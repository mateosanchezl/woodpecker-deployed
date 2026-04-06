export interface SupporterFieldsSource {
  supporterBadgeGrantedAt: Date | null;
}

export interface SerializedSupporterBadgeState {
  isSupporter: boolean;
  supporterBadgeGrantedAt: string | null;
}

export function serializeSupporterBadgeState(
  source: SupporterFieldsSource,
): SerializedSupporterBadgeState {
  return {
    isSupporter: source.supporterBadgeGrantedAt !== null,
    supporterBadgeGrantedAt: source.supporterBadgeGrantedAt?.toISOString() ?? null,
  };
}

export interface SupporterLookup {
  email?: string;
  clerkId?: string;
}

export interface NormalizedSupporterLookup {
  email?: string;
  clerkId?: string;
}

export interface SupporterAdminUser extends SupporterFieldsSource {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
}

export interface SupporterAdminStore {
  findUser(lookup: NormalizedSupporterLookup): Promise<SupporterAdminUser | null>;
  updateUserSupporterBadge(
    userId: string,
    supporterBadgeGrantedAt: Date | null,
  ): Promise<SupporterAdminUser>;
}

export type SupporterBadgeAction = "grant" | "revoke";

export type SupporterBadgeOutcome =
  | "granted"
  | "revoked"
  | "already_granted"
  | "already_revoked"
  | "not_found";

export interface SupporterBadgeActionResult {
  outcome: SupporterBadgeOutcome;
  lookup: NormalizedSupporterLookup;
  user?: SupporterAdminUser;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeSupporterLookup(
  lookup: SupporterLookup,
): NormalizedSupporterLookup {
  const normalizedEmail = lookup.email?.trim()
    ? normalizeEmail(lookup.email)
    : undefined;
  const normalizedClerkId = lookup.clerkId?.trim() || undefined;

  if (!normalizedEmail && !normalizedClerkId) {
    throw new Error("Provide exactly one lookup target: --email or --clerk-id.");
  }

  if (normalizedEmail && normalizedClerkId) {
    throw new Error("Choose only one lookup target: --email or --clerk-id.");
  }

  return {
    email: normalizedEmail,
    clerkId: normalizedClerkId,
  };
}

export async function applySupporterBadgeAction(
  store: SupporterAdminStore,
  action: SupporterBadgeAction,
  lookup: SupporterLookup,
  now = new Date(),
): Promise<SupporterBadgeActionResult> {
  const normalizedLookup = normalizeSupporterLookup(lookup);
  const user = await store.findUser(normalizedLookup);

  if (!user) {
    return {
      outcome: "not_found",
      lookup: normalizedLookup,
    };
  }

  if (action === "grant") {
    if (user.supporterBadgeGrantedAt) {
      return {
        outcome: "already_granted",
        lookup: normalizedLookup,
        user,
      };
    }

    const updatedUser = await store.updateUserSupporterBadge(user.id, now);
    return {
      outcome: "granted",
      lookup: normalizedLookup,
      user: updatedUser,
    };
  }

  if (!user.supporterBadgeGrantedAt) {
    return {
      outcome: "already_revoked",
      lookup: normalizedLookup,
      user,
    };
  }

  const updatedUser = await store.updateUserSupporterBadge(user.id, null);
  return {
    outcome: "revoked",
    lookup: normalizedLookup,
    user: updatedUser,
  };
}
