import { currentUser } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * Ensures a user exists in the database, creating them if not found.
 * This is useful in development when webhooks aren't enabled.
 * 
 * @param clerkId - The Clerk user ID
 * @returns The user from the database
 * @throws Error if user cannot be created (e.g., missing email)
 */
export async function ensureUserExists(clerkId: string) {
  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId },
  })

  // If user exists, return it
  if (user) {
    return user
  }

  // User doesn't exist - fetch from Clerk and create
  // This only happens in development when webhooks aren't set up
  const clerkUser = await currentUser()

  if (!clerkUser) {
    throw new Error('User not authenticated')
  }

  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId
  )

  if (!primaryEmail) {
    throw new Error('No primary email found for user')
  }

  const name = clerkUser.firstName
    ? `${clerkUser.firstName}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ''}`
    : null

  // If a user already exists with this email, link the clerkId
  const existingByEmail = await prisma.user.findUnique({
    where: { email: primaryEmail.emailAddress },
  })

  if (existingByEmail) {
    user = await prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerkId,
        name: existingByEmail.name ?? name,
      },
    })
    return user
  }

  // Create the user
  try {
    user = await prisma.user.create({
      data: {
        clerkId,
        email: primaryEmail.emailAddress,
        name,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const userByEmail = await prisma.user.findUnique({
        where: { email: primaryEmail.emailAddress },
      })
      if (userByEmail) {
        user = await prisma.user.update({
          where: { id: userByEmail.id },
          data: {
            clerkId,
            name: userByEmail.name ?? name,
          },
        })
      } else {
        throw error
      }
    } else {
      throw error
    }
  }

  console.log(`User auto-created in development: ${clerkId}`)

  return user
}
