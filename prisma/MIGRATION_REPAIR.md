# Prisma Migration Repair (Non-Destructive)

This project had a broken historical migration chain:

- `20251223133741_init` created `User.id` as `INTEGER`
- a later migration referenced `User.id` as `TEXT`
- one migration file was also missing from the repository

That made `prisma migrate dev` fail on shadow database replay.

## What changed in this repo

- Active migrations were rebaselined to a single migration:
  - `prisma/migrations/20260213123000_baseline_current_schema/migration.sql`
- Historical migrations were preserved for reference only:
  - `prisma/migrations_legacy/*`

## One-time DB repair steps (safe for user data)

These steps do **not** drop app tables or puzzle/user data.
They only:
- ensure the new schema bits exist (`focusTheme` + GIN index), and
- reset Prisma migration metadata so it matches the new baseline.

1. Stop the dev server.

2. Apply schema patch directly (idempotent):

```bash
npx prisma db execute --file prisma/sql/apply_focus_theme_patch.sql
```

3. Backup and reset `_prisma_migrations` metadata:

```bash
npx prisma db execute --file prisma/sql/repair_migration_metadata.sql
```

4. Mark baseline as applied:

```bash
npx prisma migrate resolve --applied 20260213123000_baseline_current_schema
```

5. Regenerate and restart:

```bash
npx prisma generate
rm -rf .next
npm run dev
```

## Optional verification

```bash
npx prisma migrate status
```

Expected result: migration history is clean and baseline is applied.

## Repair for `20260227130500_optimize_training_hot_path` (P3018 / duplicates)

If production fails with:

- `P3018`
- `Cannot add unique constraint Attempt(cycleId, puzzleInSetId): duplicates detected`

use this recovery sequence.

1. Pause writes to training attempts (maintenance mode) for a short window.

2. Mark the failed migration as rolled back:

```bash
npx prisma migrate resolve --rolled-back 20260227130500_optimize_training_hot_path
```

3. (Optional) Inspect duplicates in your DB SQL console:

```sql
-- See prisma/sql/check_attempt_duplicates.sql
```

4. Run deterministic dedupe + aggregate reconciliation:

```bash
npx prisma db execute --file prisma/sql/dedupe_attempt_duplicates_before_unique.sql
```

5. Deploy migrations again:

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
```

6. Verify migration state:

```bash
npx prisma migrate status --schema prisma/schema.prisma
```

Notes:
- The dedupe script keeps the earliest attempt per `(cycleId, puzzleInSetId)` and deletes later duplicates.
- It recomputes `Cycle` and `PuzzleInSet` aggregate counters for impacted rows only.
