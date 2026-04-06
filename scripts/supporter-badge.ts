import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { prisma } from "@/lib/prisma";
import {
  applySupporterBadgeAction,
  serializeSupporterBadgeState,
  type SupporterAdminStore,
  type SupporterBadgeAction,
  type SupporterLookup,
} from "@/lib/supporters";

const supporterUserSelect = {
  id: true,
  clerkId: true,
  email: true,
  name: true,
  supporterBadgeGrantedAt: true,
} as const;

const prismaSupporterStore: SupporterAdminStore = {
  async findUser(lookup) {
    if (lookup.email) {
      return prisma.user.findFirst({
        where: {
          email: {
            equals: lookup.email,
            mode: "insensitive",
          },
        },
        select: supporterUserSelect,
      });
    }

    if (!lookup.clerkId) {
      return null;
    }

    return prisma.user.findUnique({
      where: { clerkId: lookup.clerkId },
      select: supporterUserSelect,
    });
  },
  async updateUserSupporterBadge(userId, supporterBadgeGrantedAt) {
    return prisma.user.update({
      where: { id: userId },
      data: { supporterBadgeGrantedAt },
      select: supporterUserSelect,
    });
  },
};

function usage() {
  return [
    "Usage:",
    "  npx tsx scripts/supporter-badge.ts grant --email <email>",
    "  npx tsx scripts/supporter-badge.ts grant --clerk-id <id>",
    "  npx tsx scripts/supporter-badge.ts revoke --email <email>",
    "  npx tsx scripts/supporter-badge.ts revoke --clerk-id <id>",
  ].join("\n");
}

export function parseSupporterBadgeArgs(argv: string[]): {
  action: SupporterBadgeAction;
  lookup: SupporterLookup;
} {
  const [action, ...rest] = argv;

  if (action !== "grant" && action !== "revoke") {
    throw new Error(usage());
  }

  let email: string | undefined;
  let clerkId: string | undefined;

  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    const value = rest[index + 1];

    if (argument === "--email") {
      if (!value) {
        throw new Error("Missing value for --email.\n\n" + usage());
      }

      email = value;
      index += 1;
      continue;
    }

    if (argument === "--clerk-id") {
      if (!value) {
        throw new Error("Missing value for --clerk-id.\n\n" + usage());
      }

      clerkId = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}\n\n${usage()}`);
  }

  return {
    action,
    lookup: {
      email,
      clerkId,
    },
  };
}

export async function runSupporterBadgeCommand(
  argv = process.argv.slice(2),
  store: SupporterAdminStore = prismaSupporterStore,
  now = new Date(),
) {
  const { action, lookup } = parseSupporterBadgeArgs(argv);
  return applySupporterBadgeAction(store, action, lookup, now);
}

function serializeResult(result: Awaited<ReturnType<typeof runSupporterBadgeCommand>>) {
  return {
    outcome: result.outcome,
    lookup: result.lookup,
    user: result.user
      ? {
          id: result.user.id,
          clerkId: result.user.clerkId,
          email: result.user.email,
          name: result.user.name,
          ...serializeSupporterBadgeState(result.user),
        }
      : null,
  };
}

async function main() {
  try {
    const result = await runSupporterBadgeCommand();
    const payload = serializeResult(result);

    if (result.outcome === "not_found") {
      console.error(JSON.stringify(payload, null, 2));
      process.exitCode = 1;
      return;
    }

    console.log(JSON.stringify(payload, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

const isMainModule =
  typeof process.argv[1] === "string" &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  void main();
}
