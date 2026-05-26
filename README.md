# BookBerry MVP

Unified **Next.js** app — admin UI and API routes in one codebase, deployable to **Vercel** or **Netlify** as a single project.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL, Auth)
- API routes at `/api/*` (no separate backend server)

## Local setup

### 1. Install dependencies

```bash
cd bookberry
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in **SQL Editor** (in order):
   - `supabase/migrations/001_phase0.sql`
   - `supabase/migrations/002_phase1.sql`
   - `supabase/migrations/003_phase2.sql`
3. Create an admin user in **Authentication → Users** (email + password)
4. Copy `.env.example` to `.env.local` and fill in your keys

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to admin dashboard (login required).

## Phase 0 features

- Admin login (Supabase Auth)
- Books CRUD with auto BBID (`BB-YYYY-0001`)
- Dashboard stats
- CSV import / export
- Printable BBID labels (4 per A4 page)

## Phase 1 features

- Schools CRUD with auto IDs (`SCH-MUN-001`, `SCH-PVT-001`)
- Session lifecycle: create → activate → return books → close
- Missing book tracking on session close
- Printable session sheets
- "Where is my book?" search (`/admin/books/locate`)
- Dashboard: today's sessions, missing books, books out in sessions

## Phase 2 features

- Members CRUD with auto IDs (`MEM-YYYY-0001`)
- Lending transactions (`LND-YYYY-00001`) with quota enforcement
- Overdue detection (flagged, no auto-fines)
- Damage/loss log
- Waitlist for out-of-stock books
- Printable member ID cards (4 per A4)
- Dashboard: active members, overdue alert, expiring memberships

## Deploy

### Vercel (recommended)

1. Push repo to GitHub
2. Import project in Vercel — root directory: `bookberry`
3. Add environment variables from `.env.example`
4. Deploy

### Netlify

1. Connect repo, set base directory to `bookberry`
2. Build command: `npm run build`
3. Install `@netlify/plugin-nextjs` (see `netlify.toml`)
4. Add environment variables

## Project structure

```
bookberry/
├── app/
│   ├── admin/          # Protected admin pages
│   ├── auth/             # Login
│   └── api/              # Backend API routes
├── components/
├── lib/
│   ├── supabase/
│   ├── services/
│   └── utils/
└── supabase/migrations/
```

## Next phases

- **Phase 3:** Public catalogue, blogs, events, Razorpay

Ask before starting each phase.
