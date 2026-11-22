# Email & Password
admin:admin@gmail.com
student:student@gmail.com
tutor:tutor@gmail.com

password:22446688


# MentorLagbe Client

MentorLagbe is a premium tuition and mentorship marketplace for Bangladesh. This repository contains the **Next.js frontend**; the Express/MongoDB backend lives in the sibling repository `../mentorlagbe-server` and has its own README. Both applications share one MongoDB database (`mentor_lagbe`).

---

## 1. Project Name and Introduction

**MentorLagbe** — "Find Your Ideal Tutor or Mentorship Batch Today." The client delivers a polished, dark-first EdTech experience with lime/sky accents, responsive layouts, and role-aware dashboards.

## 2. Project Overview and Purpose

Students discover approved tuition posts, apply to tutors, save favourites, and manage subscriptions. Tutors publish and manage tuition listings and review applicants. Admins moderate users, tuitions and payments. All persistent application data is served by the Express backend; Better Auth handles identity and sessions.

## 3. Main Features

- Marketing home: hero, dynamic featured tuitions, Free/Pro pricing summary, 4-step workflow, top subjects, real platform statistics
- Email/password authentication plus optional Google OAuth
- Public tuition browsing, filtering, detail pages and student applications
- Student dashboard: stats, applications, saved tuitions (bookmarks), profile
- Tutor dashboard: overview, post tuition, manage tuitions, review applicants
- Admin dashboard: users, tuition approvals, transactions, platform stats
- Stripe subscription checkout, confirmation and webhook sync
- ImgBB image uploads for tuition banners and registration avatars
- Global React-Toastify notifications, skeletons, empty/error states

## 4. Roles and Capabilities

| Role | Capabilities |
| --- | --- |
| **Student** | Browse/apply to tuitions, cancel pending applications, save up to 5 tuitions on Free (unlimited on Pro), submit/manage profile, subscribe to Pro Student |
| **Tutor** | Post up to 2 tuitions on Free (unlimited on Pro), edit/close/delete own posts, review applicants, view stats, subscribe to Pro Tutor |
| **Admin** | List users and change roles, approve/reject tuition posts, inspect platform stats and Stripe transactions |

Public sign-up is sanitised to Student or Tutor; Admin is granted by an existing admin or directly in the database.

## 5. Technology Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS 4 (`@tailwindcss/postcss`, `tw-animate-css`), shadcn `base-nova` primitives on `@base-ui/react`, `class-variance-authority`, `cn`, `lucide-react`, `next-themes`, Better Auth with `@better-auth/mongo-adapter`, MongoDB Node driver, Stripe SDK, React-Toastify, `tsx` for seeding, ESLint 9 + Prettier.

> Next.js 16 differs from older releases; `AGENTS.md` directs developers to the bundled docs in `node_modules/next/dist/docs/` before writing framework-specific code.

## 6. Architecture

**Frontend**: Server Components for data/layout, Client Components for interaction, Route Handlers under `app/api/*` for proxying/auth/payments/uploads, and `"use server"` actions in `lib/actions/*` for backend mutations. A single shared Better Auth client (`lib/auth-client.ts`) keeps session state consistent. `components/bookmarks/bookmark-provider.tsx` owns optimistic bookmark state.

**Backend**: Express 5 REST API with `verifyToken`/`requireRole` middleware, controllers, services and utilities. The client reaches it through `authFetch` (Bearer session token) or `backendRequest` (shared internal secret). Responsibilities stay separated: the client never reads MongoDB directly except through Better Auth's adapter and the seed script.

## 7. Folder Structure

```
mentorlagbe-client/
  app/
    (auth)/sign-in|sign-up/            # auth pages + loading states
    api/
      auth/[...all]/route.ts           # Better Auth catch-all
      tuitions/, featured-tuitions/, platform/stats/   # public proxies
      profile/, admin/*, checkout-sessions/
      subscription/confirm|status/, webhooks/stripe/
      uploads/imgbb|profile-image/
    dashboard/                         # role dashboards, profile, bookmarks
    tuitions/[id]/, all-tuitions/, pricing/, payment/, how-it-works/
    layout.tsx, page.tsx, error.tsx, not-found.tsx, loading.tsx, globals.css
  components/
    home/, auth/, navbar/footer/site chrome, dashboard/, student/, tutor/,
    admin/, payment/, profile/, tuitions/, bookmarks/, loading/, ui/
  hooks/use-mobile.ts
  lib/
    auth.ts, auth-client.ts, core/server.ts, backend-api.ts, session.ts
    actions/{applications,bookmarks,tuition}.ts
    admin/*, tuitions/*, platform/*, stripe.ts, subscription.ts, plans.ts,
    imgbb.ts, notify.ts, dashboard-menu.ts, profile.ts, utils.ts
  scripts/seed-tuitions.ts             # 12 idempotent approved demo posts
  public/hero-mentorship.jpg
  components.json, next.config.ts, postcss.config.mjs, tailwind CSS in globals.css
```

## 8. Installation and Setup

Requirements: Node.js (the seed script uses `process.loadEnvFile`), npm, access to the shared MongoDB, and a running backend for data features.

```bash
cd mentorlagbe-client
npm install
# create .env with the variables in section 9
npm run dev
```

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `seed`, `seed:dry`.

## 9. Environment Variables

Values below are placeholders only — never commit real credentials. `.env*` is gitignored.

| Variable | Description |
| --- | --- |
| `BETTER_AUTH_SECRET` | Secret used by Better Auth for signed cookies/tokens |
| `BETTER_AUTH_URL` | Application base URL used for auth callbacks |
| `BETTER_AUTH_DB_URI` | MongoDB connection string for the Better Auth adapter and seed script |
| `INTERNAL_API_SECRET` | Shared secret sent as `x-internal-secret` to Express service endpoints |
| `BACKEND_API_URL` | Express API base URL; code defaults to `http://localhost:5000` |
| `IMGBB_API_KEY` | Server-side ImgBB key, read only in upload Route Handlers |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Declared in `.env`; not read by current source code |
| `STRIPE_SECRET_KEY` | Stripe secret/restricted key used by the server-side Stripe SDK |

Read in code but not set in the working `.env` (needed to enable those features): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `STRIPE_WEBHOOK_SECRET`, and optional `NEXT_PUBLIC_SITE_URL` / `APP_URL` for Stripe redirect origins.

## 10. Running Locally

```bash
# terminal 1 - backend
cd ../mentorlagbe-server && npm start        # http://localhost:5000

# terminal 2 - frontend
cd mentorlagbe-client && npm run dev          # http://localhost:3000
```

For local development set `BACKEND_API_URL=http://localhost:5000` and use the same `INTERNAL_API_SECRET` in both `.env` files. Restart the dev server after changing `.env`.

## 11. API Overview

Frontend Route Handlers (`app/api/*`): Better Auth catch-all, public tuition list/detail/featured/stats proxies, `/profile` (GET/PATCH), admin proxies (`stats`, `users`, `tuitions`, `transactions`), Stripe checkout/confirm/status/webhook, and ImgBB upload endpoints.

Express endpoints consumed by the client: `GET/POST/PUT/PATCH/DELETE /tuitions*`, `POST /tuitions/:id/apply`, `GET/DELETE /applications*`, `PATCH /applications/:id/status`, `GET/POST/DELETE /bookmarks*`, `GET /platform/stats`, `GET /admin/*`, `GET /internal/users/:id`, `POST /internal/payments`, `GET /internal/subscription-state`, `GET /internal/subscription-by-session`, `POST /internal/subscriptions/apply`. See the server README for method/auth/body details.

## 12. MongoDB Configuration

Database: `mentor_lagbe`. Application collections: `user`, `session`, `tuition`, `application`, `bookmarks`, `payments`, `subscriptions`. Better Auth also maintains `account` and `verification`. A legacy `testimonial` collection may exist in the database but is no longer referenced by application code. The backend creates a compound unique index on `bookmarks.{studentId, tuitionId}` at startup.

## 13. Authentication and Authorization

Better Auth (`lib/auth.ts`) uses the MongoDB adapter, email/password, a 5-minute cookie cache, additional user fields (`role`, `phone` and server-owned subscription fields), and `databaseHooks` that block self-promotion to Admin. `lib/auth-client.ts` exports the single shared client plus `signOut`/`useSession` and `refreshSession()`. Server code uses `getSession()`/`getToken()`/`authFetch()` from `lib/core/server.ts`. `DashboardGuard` enforces role routes client-side; admin Route Handlers verify the session server-side. The Express API independently verifies the Bearer session token against the shared `session` collection and applies `requireRole`.

## 14. Stripe Payment and Subscription

`lib/plans.ts` is the single source of truth (Pro Tutor $15/mo, Pro Student $10/mo). `/pricing` and the home pricing section display Free vs Pro; `/payment` reviews the plan and posts to `/api/checkout-sessions`, which creates a Stripe subscription Checkout Session and redirects. `/payment/success` calls `/api/subscription/confirm`; `lib/subscription.ts` verifies the Checkout Session and Subscription with the Stripe SDK before requesting a Pro grant through the backend. `/api/webhooks/stripe` verifies signatures and syncs subscription lifecycle events. No client-side payment logic bypasses this flow.

## 15. Image Uploads (ImgBB)

`lib/imgbb.ts` validates the `image` field (JPG/PNG/WebP/GIF, max 5 MB) and posts to ImgBB with `IMGBB_API_KEY` kept server-side. `POST /api/uploads/imgbb` requires a session (tuition banners); `POST /api/uploads/profile-image` is unauthenticated for sign-up but IP-rate-limited. Returned URLs are stored in `tuition.bannerImage` or the user's `image` field.

## 16. Deployment

Both repositories contain Vercel project links (`.vercel/project.json`). Import each repo as a separate Vercel project, add the environment variables from section 9/10 to the correct project, deploy the backend first, then the client, and restart/redeploy after env changes. Configure the Stripe webhook at `<client-origin>/api/webhooks/stripe` with `STRIPE_WEBHOOK_SECRET`. No Dockerfile or custom server is configured.

## 17. Project Links

- Local frontend: `http://localhost:3000`
- Local backend: `http://localhost:5000`
- Deployed URLs are configured through `BETTER_AUTH_URL` (client) and `BACKEND_API_URL` (client → server); Vercel project IDs are stored in each repo's `.vercel/project.json` and are not reproduced here.

Backend details, API contracts and database schema are documented in `../mentorlagbe-server/README.md`.
