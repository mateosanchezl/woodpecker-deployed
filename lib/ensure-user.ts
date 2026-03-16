import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface ClerkIdentityInput {
  clerkId: string;
  email: string;
  name: string | null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findUserByEmail(email: string) {
  const matches = await prisma.user.findMany({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    take: 2,
  });

  if (matches.length > 1) {
    throw new Error(`Multiple users found for email ${email}`);
  }

  return matches[0] ?? null;
}

async function persistUser(input: ClerkIdentityInput) {
  const normalizedEmail = normalizeEmail(input.email);
  const data = {
    clerkId: input.clerkId,
    email: normalizedEmail,
    name: input.name,
  };

  const existingByClerkId = await prisma.user.findUnique({
    where: { clerkId: input.clerkId },
  });

  if (existingByClerkId) {
    return prisma.user.update({
      where: { id: existingByClerkId.id },
      data,
    });
  }

  const existingByEmail = await findUserByEmail(normalizedEmail);
  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        ...data,
        name: existingByEmail.name ?? input.name,
      },
    });
  }

  try {
    return await prisma.user.create({ data });
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== "P2002"
    ) {
      throw error;
    }
  }

  const concurrentUser =
    (await prisma.user.findUnique({
      where: { clerkId: input.clerkId },
    })) ?? (await findUserByEmail(normalizedEmail));

  if (!concurrentUser) {
    throw new Error("User could not be provisioned");
  }

  return prisma.user.update({
    where: { id: concurrentUser.id },
    data,
  });
}

async function provisionUserFromAuthenticatedSession(clerkId: string) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("User not authenticated");
  }

  if (clerkUser.id !== clerkId) {
    throw new Error("Authenticated user mismatch");
  }

  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId,
  );

  if (!primaryEmail) {
    throw new Error("No primary email found for user");
  }

  const name = clerkUser.firstName
    ? `${clerkUser.firstName}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ""}`
    : null;

  const user = await upsertUserFromClerkIdentity({
    clerkId,
    email: primaryEmail.emailAddress,
    name,
  });

  console.log(`User provisioned from authenticated session: ${clerkId}`);

  return user;
}

export async function upsertUserFromClerkIdentity(input: ClerkIdentityInput) {
  return persistUser(input);
}

export async function withUserProvisionFallback<T>(
  clerkId: string,
  query: () => Promise<T | null>,
): Promise<T | null> {
  const result = await query();
  if (result !== null) {
    return result;
  }

  await provisionUserFromAuthenticatedSession(clerkId);
  return query();
}

/**
 * Ensures the authenticated Clerk user has a local database row.
 *
 * @param clerkId - The Clerk user ID
 * @returns The user from the database
 * @throws Error if user cannot be created (e.g., missing email)
 */
export async function ensureUserExists(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (user) {
    return user;
  }

  return provisionUserFromAuthenticatedSession(clerkId);
}
