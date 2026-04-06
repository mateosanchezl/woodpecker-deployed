# Supporter Badge Admin

Use the local admin script to grant or revoke the Buy Me a Coffee supporter badge.

## Grant The Badge

Grant by email:

```bash
npx tsx scripts/supporter-badge.ts grant --email user@example.com
```

Grant by Clerk ID:

```bash
npx tsx scripts/supporter-badge.ts grant --clerk-id user_abc123
```

## Revoke The Badge

Revoke by email:

```bash
npx tsx scripts/supporter-badge.ts revoke --email user@example.com
```

Revoke by Clerk ID:

```bash
npx tsx scripts/supporter-badge.ts revoke --clerk-id user_abc123
```

## Notes

- The script is idempotent.
- If the badge is already present, the result will be `already_granted`.
- If the badge is already absent, the result will be `already_revoked`.
- The script prints JSON showing the outcome and the user's final supporter state.
