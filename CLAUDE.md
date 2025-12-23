# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Woodpecker is a Next.js 16 application using:
- **Framework**: Next.js 16 (App Router)
- **Authentication**: Clerk
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Language**: TypeScript

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
