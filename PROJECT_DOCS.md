# BookBerry - Full Project Documentation

## 1. Executive Summary
BookBerry MVP is a comprehensive library management system unifying an admin dashboard and API routes in a single Next.js codebase. It uses Supabase for database and authentication. It handles the complete lifecycle of books, schools, members, lending, and also features a public catalogue, blogs, and events.

## 2. Architecture & Tech Stack
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database & Auth:** Supabase (PostgreSQL)
- **Deployment:** Vercel or Netlify
- **Project Structure:**
  - `app/admin/`: Protected admin pages.
  - `app/auth/`: Login.
  - `app/api/`: Backend API routes (no separate backend server).
  - `components/`: Reusable UI elements.
  - `lib/services/`: Core business logic interacting with the database.
  - `lib/supabase/`: Supabase clients and wrappers.
  - `scripts/`: Data seeding and utility scripts.

## 3. Core Abstractions & "God Nodes"
The system relies heavily on a few central abstractions that act as cross-module bridges:
- **`requireAuth()`:** Central authentication middleware/guard. It verifies the Supabase session, ensuring API routes and admin pages are fully protected.
- **`cn()`:** Tailwind CSS class merging utility used pervasively across all UI components to maintain visual consistency.
- **UI Components:** `LinkButton()`, `Button()`, `Skeleton()`, `Badge()`, `Input()`, `Card()`, `CardHeader()`. These form the fundamental building blocks of the frontend.
- **API Methods:** `GET()`, `POST()`, `PATCH()`, `DELETE()` standard Next.js App Router API handlers connecting endpoints to services.

## 4. Module Overview
The system is logically divided into several interconnected domains:

### 4.1. Books & Catalogue
- **Features:** Books CRUD, CSV import/export, printable BBID labels (e.g., `BB-YYYY-0001`), and a "Where is my book?" search tool (`/admin/books/locate`).
- **Key Components:** `BookForm`, `BookUploadRow` (for imports), `BookLocateClient`, `CataloguePageClient`.

### 4.2. Schools & Sessions
- **Features:** Schools CRUD (IDs like `SCH-MUN-001`). It models the full session lifecycle (create → activate → return books → close). Supports tracking missing books on closure and generates printable session sheets.
- **Key Components:** `SchoolDetailPage`, `SessionDetailClient`, `SessionStatusBadge`, `SessionRow`.

### 4.3. Members & Lending
- **Features:** Members CRUD (IDs like `MEM-YYYY-0001`), printable member ID cards. Handles lending transactions (`LND-YYYY-00001`), quota enforcement, overdue detection, damage/loss logging, and waitlists.
- **Key Components:** `MemberForm`, `MemberDetailClient`, `LendingReturnClient`, `LendingStatusBadge`, `MemberStatusBadge`.

### 4.4. Content & Public Features
- **Features:** Public-facing pages including a catalogue, blogs, events, and subscription plans (designed to support integrations like Razorpay).
- **Key Components:** `BlogForm`, `BlogsPageClient`, `EventForm`, `PlansPageClient`.

## 5. Dashboard & Analytics
The admin dashboard aggregates data across all modules to provide key metrics and alerts:
- **Metrics Tracked:** Active members, today's sessions, missing books, books out in sessions, and overdue alerts.
- **Key Components:** `AdminOverview`, `AdminTopBar`, `KpiStrip`, `AttentionPanel`.
- **Visualizations:** Uses charts like `OperationsBarChart`, `MonthlyTrendChart`, and `DonutChart` to display trends (e.g., lending volume or member growth).

## 6. Utilities & Automations
- **Utilities:** Functions like `addDays()`, `cleanValue()`, `emptyToNull()`, and `normalizeFormat()` are widely used for data normalization.
- **Scripts / Seeders:** The `scripts/` directory contains tools to populate the database and run standalone operations (`seedBlogs()`, `seedDamageLog()`, `seedEvents()`, `generateBBID()`).

## 7. Known Architectural Connections & Best Practices
- **Security Context:** `requireAuth()` connects heavily across all module APIs (Books, Sessions, Members, Schools), making it a critical path for both security and request context.
- **Styling Consistency:** `cn()` connects almost every UI component, acting as the global styling bridge.
- **Implicit API Ties:** Serverless `GET()` and `POST()` endpoints directly wrap service functions (e.g., `getBook`, `getLending`, `getMemberProfile`, `getSchoolWithSessions`). When editing a service, expect to trace the change back to its corresponding `/api` route.
- **Isolated Configs:** Top-level configuration files (`eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs`) function independently and don't require deep contextual knowledge of the business logic to modify.

---
*Note: This document was synthesized to capture the full scope, architecture, and module relations of BookBerry. You can read this document to understand the system comprehensively without needing to navigate the full directory structure.*
