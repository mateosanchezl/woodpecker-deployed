# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Woodpecker is a Next.js 16 application using:
- **Framework**: Next.js 16 (App Router)
- **Authentication**: Clerk
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Language**: TypeScript

It is a web app aimed at providing chess training that uses the woodpecker method. Below is some more context on this:

## The Woodpecker Method (Chess Puzzle Training)

The **Woodpecker Method** is a structured approach to improving tactical calculation in chess through **intensive repetition of a fixed set of puzzles**.

### Core Idea
Instead of solving many new puzzles once, you:
1. Select a **small, high-quality set of tactical puzzles** (usually slightly below or around your current rating).
2. Solve the **same set repeatedly**, aiming to complete each cycle **faster and more accurately** than the last.

This repetition builds **pattern recognition**, **calculation speed**, and **confidence under time pressure**.

### How It Works
- **Initial cycle**: Solve all puzzles carefully, calculating fully.
- **Subsequent cycles**: Re-solve the *same puzzles*, but faster.
- **Goal**: Reduce total completion time each cycle while maintaining correctness.

Over time, motifs (pins, forks, deflections, sacrifices) become automatic.

### Recommended Structure
- Puzzle set size: **100–300 puzzles**
- Difficulty: **slightly easier than your peak tactical ability**
- Cycles: **3–6 repetitions**
- Time pressure increases naturally as familiarity grows

### Why It’s Effective
- Reinforces tactical motifs through repetition
- Converts calculation into intuition
- Improves performance in real games, especially in time trouble

### Common Mistakes
- Using puzzles that are too difficult
- Adding new puzzles too frequently
- Moving too fast before full understanding in early cycles

### Best Use Case
The Woodpecker Method is most effective for players who:
- Already know basic tactics
- Want to improve **speed, accuracy, and consistency**
- Are preparing for tournaments or serious online play

This web app is a SaaS that aims to provide this training service to users for effective chess improvement.

## Aesthetic & Vibe

The app should feel **focused, calm, and demanding in a good way** — closer to a training room than a game.

### Core Feel
- Minimalist and quiet  
- Serious, deliberate, and distraction-free  
- Optimized for deep concentration and repetition  

The user should feel like they are doing *work*, not killing time.

### Visual Language
- Neutral, muted color palette (grays, off-whites, soft blacks)
- One restrained accent color for focus and success states
- High contrast only where it improves clarity or speed

No visual noise. No gradients for decoration. Every element earns its place.

### Typography
- Clean, modern sans-serif
- Clear hierarchy, generous spacing
- Numbers and timers should feel precise and authoritative

### Motion & Feedback
- Subtle, fast transitions
- Immediate, unambiguous feedback on correctness
- No celebratory animations — progress is shown through data, not fireworks

### UX Philosophy
- One primary action per screen
- Zero friction between puzzles
- The interface should get out of the way and let the patterns sink in

### Emotional Goal
By the third repetition, the user should feel:
- Faster
- Sharper
- Quietly confident

This is not a chess app for entertainment.
This is a **training tool**.

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Database & Prisma

### Prisma Client Location
The Prisma client is generated to a custom location: `app/generated/prisma` (not the default `node_modules/@prisma/client`).

### Configuration
- Schema: `prisma/schema.prisma` (output configured to `../app/generated/prisma`)
- Config: `prisma.config.ts` (uses the new Prisma config format with dotenv)
- Connection: PostgreSQL via `DATABASE_URL` environment variable
- Adapter: Uses `@prisma/adapter-pg` with `pg` Pool for PostgreSQL connection pooling

### Database Client Usage
**IMPORTANT**: Do not import `PrismaClient` directly. Use the singleton instance:
```typescript
import { prisma } from '@/lib/prisma'
```

The `lib/prisma.ts` file provides a singleton instance that:
- Uses the PostgreSQL adapter with connection pooling
- Prevents multiple instances in development (hot reload safe)
- Is properly configured for production environments

### Common Prisma Commands
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (dev only)
npx prisma migrate reset
```

## Project Structure

- `app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with ClerkProvider wrapping all pages
  - `globals.css` - Global styles and Tailwind configuration
- `lib/` - Shared utilities
  - `utils.ts` - Contains `cn()` utility for className merging
  - `prisma.ts` - Prisma client singleton instance (use this for all database queries)
- `app/generated/prisma/` - Generated Prisma client (gitignored)
- `components/` - React components
  - `ui/` - shadcn/ui component library
- `prisma/` - Database schema and migrations
- `public/` - Static assets

## Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:
- `@/*` maps to the root directory

shadcn/ui component aliases (in `components.json`):
- `@/components` - Components directory
- `@/components/ui` - UI components
- `@/lib/utils` - Utilities
- `@/lib` - Lib directory
- `@/hooks` - Hooks directory

## Authentication (Clerk)

The application uses Clerk for authentication:
- `ClerkProvider` wraps the entire application in `app/layout.tsx`
- Environment variables required:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- Auth components used in header: `SignInButton`, `SignUpButton`, `UserButton`, `SignedIn`, `SignedOut`

## State Management (TanStack Query)

The application uses **TanStack Query (React Query)** for server state management and caching:
- `QueryProvider` wraps the entire application in `app/layout.tsx` (located in `app/providers/query-provider.tsx`)
- Default configuration: 1-minute stale time, refetch on window focus disabled
- **Use TanStack Query for all API calls and remote data fetching**
- Use `useQuery` for data fetching, `useMutation` for create/update/delete operations
- Keep query keys consistent and structured (e.g., `['puzzles', userId]`, `['progress', setId]`)

## Styling

### shadcn/ui Configuration
- Style: "new-york"
- Base color: slate
- CSS variables enabled
- Icon library: lucide-react
- Main CSS file: `app/globals.css`

### Tailwind
- Uses Tailwind CSS v4
- Custom fonts: Geist Sans and Geist Mono (via next/font)
- CSS utility function: `cn()` from `lib/utils.ts` for merging class names

## Environment Variables

Required environment variables (stored in `.env.local`, gitignored):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `DATABASE_URL` - PostgreSQL connection string
