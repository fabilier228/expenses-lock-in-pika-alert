# Pika Alert — Expense Calculator

A lightweight mobile-first expense tracking web app for personal use, accessible from an iPhone home screen as a PWA.

---

## Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | Next.js 14 (App Router, TypeScript) | Full-stack, Vercel-native, easy PWA support |
| Styling | Tailwind CSS | Fast, mobile-first utility classes |
| Auth + DB | Supabase | Free tier, Google OAuth built-in, Postgres with RLS |
| Backend | Next.js API routes (no separate service) | Keeps everything on Vercel, zero extra hosting cost |
| Hosting | Vercel | Free tier, auto-deploys from GitHub |
| Charts | Recharts | React-native, small bundle, no canvas setup |
| PWA | next-pwa | Service worker generation, iOS home screen support |

**Monorepo:** single Next.js project, no separate backend service.

---

## Authentication

- **Provider:** Google OAuth only, via Supabase Auth (`@supabase/ssr`)
- **Flow:** user taps "Continue with Google" → Google → `/api/auth/callback` → session cookie set → redirected to dashboard
- **Sessions:** long-lived (1-hour access token + 60-day refresh token in cookies, auto-refreshed by middleware)
- **Guard:** `src/middleware.ts` protects all app routes — unauthenticated users are redirected to `/login`

---

## Features

### 1. Dashboard

The main screen after login. Shows a grid of **category tiles**.

- Tapping a tile opens a modal to add an expense entry (amount + optional comment)
- The **Subscriptions** tile opens a different modal: add a named recurring item (e.g. "Netflix €10/mo")
- A **+** button lets the user create a new custom category
- Categories can be deleted (long-press or swipe gesture reveals delete action — cascades to all their records)

**Preset categories created automatically on first login:**

| Category | Type | Special behavior |
|----------|------|-----------------|
| Subscriptions | subscriptions | Stores named recurring amounts; auto-included in monthly totals |
| Other | other | Standard tile with optional comment |
| Income | income | Tracks money in |

Users can rename, delete, or add more categories beyond these three.

### 2. Summary Page

Aggregated view of spending for a selected time period.

**Period selector:** Week / Month / Year (default: current month)

**Shown:**
- Total spent for the period (single headline number)
- Donut chart — spending split by category
- Table: category | total amount | % of total spend

**Subscription handling in totals:**
- Monthly: active subscriptions are summed and added once
- Yearly: subscription monthly total × 12
- Weekly: subscription total shown as the monthly equivalent with a UI note

**Category drilldown:** tapping a row in the table opens a list of individual expense records for that category in the selected period (sorted newest-first, showing amount, comment, and date).

### 3. Profile Page

- Google avatar + email
- "Member since" date (from first login)
- Sign out button

---

## Database Schema

```sql
-- Categories (one per user-defined bucket)
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('regular', 'subscriptions', 'income', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual expense entries
CREATE TABLE expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount      NUMERIC(12, 2) NOT NULL,
  comment     TEXT,                    -- optional on all categories
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Named recurring subscriptions (only for type='subscriptions' categories)
CREATE TABLE subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,           -- e.g. "Netflix"
  amount      NUMERIC(12, 2) NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Row Level Security** is enabled on all three tables. Every query is automatically scoped to `auth.uid()` — no manual `user_id` filtering needed in application code, and no cross-user data leakage is possible.

Cascade deletes: removing a category automatically removes all its `expenses` and `subscriptions` rows at the database level.

---

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/categories` | List user's categories |
| POST | `/api/categories` | Create a category |
| DELETE | `/api/categories/[id]` | Delete category (cascades) |
| GET | `/api/expenses?categoryId=&from=&to=` | List expenses (filtered) |
| POST | `/api/expenses` | Add an expense |
| DELETE | `/api/expenses/[id]` | Delete an expense |
| GET | `/api/subscriptions?categoryId=` | List subscriptions |
| POST | `/api/subscriptions` | Add a subscription |
| PATCH | `/api/subscriptions/[id]` | Toggle active on/off |
| DELETE | `/api/subscriptions/[id]` | Delete a subscription |
| GET | `/api/summary?period=week\|month\|year` | Aggregated totals for summary page |

All routes use the server-side Supabase client (session from cookies). User identity is always taken from `supabase.auth.getUser()`, never from request body.

---

## PWA (iOS Home Screen)

- `public/manifest.json` with `display: "standalone"` — removes Safari chrome
- `<link rel="apple-touch-icon">` in `app/layout.tsx` — iOS uses this for the home screen icon (ignores manifest icons)
- `<meta name="apple-mobile-web-app-capable" content="yes">` — enables standalone mode
- Service worker via `next-pwa` — caches app shell for offline access
- App icons: 192×192, 512×512, and 180×180 apple-touch-icon

---

## Project Structure

```
src/
├── middleware.ts                     # Auth guard
├── app/
│   ├── layout.tsx                    # Root layout + PWA meta
│   ├── (auth)/login/page.tsx         # Sign-in page
│   ├── (app)/layout.tsx              # App shell + BottomNav
│   ├── (app)/dashboard/page.tsx
│   ├── (app)/summary/page.tsx
│   ├── (app)/summary/[categoryId]/page.tsx
│   ├── (app)/profile/page.tsx
│   └── api/...                       # All API routes
├── components/
│   ├── ui/                           # Button, Modal, Input, Badge
│   ├── dashboard/                    # CategoryGrid, CategoryTile, modals
│   ├── summary/                      # PeriodSelector, DonutChart, SummaryTable
│   └── layout/                       # BottomNav
└── lib/
    ├── supabase/client.ts            # Browser Supabase client
    ├── supabase/server.ts            # Server Supabase client (SSR)
    └── utils/                        # subscriptionTotal, dateRanges, formatCurrency
```

---

## Build Order

1. Scaffold Next.js + install dependencies
2. Supabase clients + auth middleware
3. Login page + OAuth callback + first-login preset seeding
4. Database migrations + RLS policies
5. Dashboard (category tiles, expense modals, API routes)
6. Summary page (charts, table, drilldown)
7. Profile page
8. PWA config
9. Deploy to Vercel

---

## Verification Checklist

- [ ] Unauthenticated visit to `/dashboard` → redirect to `/login`
- [ ] Google sign-in completes → lands on `/dashboard`
- [ ] Closing and reopening the PWA keeps the user logged in
- [ ] First login creates exactly Subscriptions + Other + Income; second login doesn't duplicate
- [ ] Adding an expense → appears in that month's summary total
- [ ] Active subscriptions included in monthly total; toggling inactive removes them
- [ ] Deleting a category removes all its expense records
- [ ] User A cannot access User B's data via direct API calls
- [ ] iOS: "Add to Home Screen" opens app in standalone mode (no Safari URL bar)
- [ ] `next build` passes with zero TypeScript errors
