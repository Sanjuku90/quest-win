# QuestInvest Pro

## Overview

QuestInvest Pro is a gamified investment platform where users can invest money, complete daily quests for rewards, and play a roulette game to unlock bonus funds. The platform features a professional fintech dashboard with gold/purple accents, user wallet management, and an admin panel for transaction verification.

Key features:
- User investment with 40% first-deposit bonus (locked until roulette win)
- Daily quests that reward 35% of investment balance per completion
- Roulette mini-game to unlock locked bonuses
- Wallet system with deposits, withdrawals, and transaction history
- Admin dashboard for approving/rejecting transactions
- Gamification elements: progress tracking, tier system, badges

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui (Radix primitives) with custom glass-morphism cards
- **Animations**: Framer Motion for page transitions and roulette effects
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: REST endpoints defined in shared/routes.ts with Zod validation
- **Authentication**: Replit Auth (OpenID Connect) with Passport.js
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: shared/schema.ts (tables: users, sessions, userBalances, quests, transactions)
- **Migrations**: Drizzle Kit with `db:push` command

### Key Design Patterns
- **Shared Types**: Schema and route definitions in /shared folder for frontend/backend type safety
- **API Contract**: Routes defined with method, path, and Zod response schemas
- **Storage Abstraction**: IStorage interface in server/storage.ts for database operations
- **Component Architecture**: Layout components (AppLayout, Sidebar) with page-specific components

### Authentication Flow
- Replit Auth handles login/logout via /api/login and /api/logout
- User session stored in PostgreSQL sessions table
- Protected routes check req.isAuthenticated()
- Admin routes additionally verify user.role === 'admin'

## External Dependencies

### Database
- PostgreSQL (required, connection via DATABASE_URL environment variable)

### Authentication
- Replit Auth (OpenID Connect provider at replit.com/oidc)
- Required env vars: REPL_ID, SESSION_SECRET, ISSUER_URL

### Third-Party Libraries
- **UI**: Radix UI primitives, Embla Carousel, Vaul (drawer), cmdk (command palette)
- **Forms**: React Hook Form with Zod resolver
- **Dates**: date-fns
- **Icons**: Lucide React

### Environment Variables Required
- DATABASE_URL: PostgreSQL connection string
- SESSION_SECRET: Secret for session encryption
- REPL_ID: Replit application identifier (auto-set in Replit environment)