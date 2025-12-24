import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/webhooks/clerk
 * Handles Clerk webhook events for user lifecycle management.
 *
 * Events handled:
 * - user.created: Create user in database
 * - user.updated: Sync user email/name changes
 * - user.deleted: Delete user and cascade to related data
 */
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify the webhook signature
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  const eventType = evt.type

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data)
        break

      case 'user.updated':
        await handleUserUpdated(evt.data)
        break

      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break

      default:
        // Ignore other events
        console.log(`Unhandled webhook event: ${eventType}`)
    }

    return new Response('Webhook processed', { status: 200 })
  } catch (error) {
    console.error(`Error processing webhook ${eventType}:`, error)
    return new Response('Webhook processing failed', { status: 500 })
  }
}

/**
 * Handle user.created event
 * Creates a new user in the database when they sign up via Clerk
 */
async function handleUserCreated(data: WebhookEvent['data']) {
  if (!('id' in data) || !('email_addresses' in data)) {
    console.error('Invalid user.created payload')
    return
  }

  const { id: clerkId, email_addresses, first_name, last_name } = data

  const primaryEmail = email_addresses.find(
    (email) => email.id === data.primary_email_address_id
  )

  if (!primaryEmail) {
    console.error('No primary email found for user:', clerkId)
    return
  }

  const name = first_name
    ? `${first_name}${last_name ? ` ${last_name}` : ''}`
    : null

  await prisma.user.create({
    data: {
      clerkId,
      email: primaryEmail.email_address,
      name,
    },
  })

  console.log(`User created: ${clerkId}`)
}

/**
 * Handle user.updated event
 * Syncs email and name changes from Clerk to the database
 */
async function handleUserUpdated(data: WebhookEvent['data']) {
  if (!('id' in data) || !('email_addresses' in data)) {
    console.error('Invalid user.updated payload')
    return
  }

  const { id: clerkId, email_addresses, first_name, last_name } = data

  const primaryEmail = email_addresses.find(
    (email) => email.id === data.primary_email_address_id
  )

  if (!primaryEmail) {
    console.error('No primary email found for user:', clerkId)
    return
  }

  const name = first_name
    ? `${first_name}${last_name ? ` ${last_name}` : ''}`
    : null

  // Use upsert to handle edge case where webhook arrives before user exists
  await prisma.user.upsert({
    where: { clerkId },
    update: {
      email: primaryEmail.email_address,
      name,
    },
    create: {
      clerkId,
      email: primaryEmail.email_address,
      name,
    },
  })

  console.log(`User updated: ${clerkId}`)
}

/**
 * Handle user.deleted event
 * Removes user and all related data from the database
 */
async function handleUserDeleted(data: WebhookEvent['data']) {
  if (!('id' in data)) {
    console.error('Invalid user.deleted payload')
    return
  }

  const { id: clerkId } = data

  if (!clerkId) {
    console.error('No clerkId in user.deleted event')
    return
  }

  // Delete user - cascades to puzzleSets, cycles, attempts via Prisma schema
  const deletedUser = await prisma.user.delete({
    where: { clerkId },
  }).catch((error) => {
    // User might not exist in DB (e.g., if created before webhook was set up)
    if (error.code === 'P2025') {
      console.log(`User not found in database: ${clerkId}`)
      return null
    }
    throw error
  })

  if (deletedUser) {
    console.log(`User deleted: ${clerkId}`)
  }
}
