# MentorLagbe Client (Frontend)

This repository is the **Next.js frontend** of MentorLagbe, a tuition/mentorship platform connecting students with tutors in Bangladesh. The backend lives in a separate sibling repository at `../mentorlagbe-server` and has its own README. This document covers **frontend concerns only**.

Roles: `Student` (default), `Tutor`, and `Admin`. Pro plans (paid through Stripe) unlock extra capabilities for Students and Tutors.

---

## 1. Project Overview and Purpose

MentorLagbe lets students discover tuition posts, apply to tutors, and track applications. Tutors create and manage tuition listings, review applicants, and can upgrade to Pro. Admins review new tuition posts, manage users, and inspect platform statistics and transactions. The frontend is a server-rendered Next.js App Router application with client-side interactive pages; all persistent application data comes from the Express backend through Next.js route handlers and server actions. Authentication (sessions and the `user` document) is handled by Better Auth with a MongoDB adapter.

## 2. Frontend Technology Stack

| Technology | Version (package.json) | Purpose |
| --- | --- | --- |
| Next.js (App Router) | ^16.4.5 | Framework, routing, Server Components, Route Handlers, Server Actions |
| React / React DOM | 19.3.1 | UI library |
| TypeScript | ^5 | Typing across app, components, lib, scripts |
| Tailwind CSS | ^4 (`@tailwindcss/postcss`) | CSS-first styling; no `tailwind.config.*` file |
| shadcn (`base-nova` style) + `@base-ui/react` | ^4.23.0 / ^1.9.0 | UI primitives in `components/ui/*` (Base UI, not Radix) |
| `lucide-react` | ^1.75.0 | Icon components used throughout the UI |
| `next-themes` | ^0.4.6 | Class-based light/dark theme |
| Better Auth + MongoDB adapter | ^1.7.25 | Authentication, session hooks, user fields |
| MongoDB Node driver | ^7.9.0 | Used by `lib/auth.ts` (adapter) and `scripts/seed-tuitions.ts` |
| `react-toastify` | ^11.2.0 | Global notifications |
| Stripe (`stripe`, `@stripe/stripe-js`) | ^23.2.0 / ^10.3.0 | Server-side Checkout/verification (`stripe` is used; `@stripe/stripe-js` is installed but not imported) |
| `class-variance-authority`, `cn` | ^0.7.1 / ^0.5.2 | Button variants and class merging |
| Prettier, ESLint, TypeScript | dev deps | Formatting, linting, type checking |
| `tsx` | dev dep | Runs the tuition seed script |

Fonts: Geist and Geist Mono via `next/font/google`, exposed as `--font-sans` / `--font-mono`. Brand accent: `lime-400` on dark neutral surfaces.

> Next.js 16 differs from older versions. `AGENTS.md`/`CLAUDE.md` instruct developers to consult `node_modules/next/dist/docs/` before writing Next.js-specific code.

## 3. Installation and Setup

Prerequisites: Node.js (the seed script uses `process.loadEnvFile`, available in newer Node releases), npm, access to the MongoDB database used by Better Auth, and a running backend for data features.

```bash
cd mentorlagbe-client
npm install
cp .env.example .env    # if provided; otherwise create .env with the variables in section 14
npm run dev             # http://localhost:3000
```

Useful scripts (`package.json`):

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` / `npm run start` | Production build / serve the build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier on `*.ts` / `*.tsx` |
| `npm run seed` | Insert 12 approved demo tuition posts (idempotent; requires an existing Tutor account) |
| `npm run seed:dry` | Preview seed posts without writing |

The seed script (`scripts/seed-tuitions.ts`) uses `BETTER_AUTH_DB_URI`, targets the `mentor_lagbe` database and `tuition` collection, derives deterministic ids from slugs, and uses `$setOnInsert` so re-runs never overwrite records.

## 4. Client Folder Structure

```
mentorlagbe-client/
  app/
    (auth)/sign-in/{page,loading}.tsx        # sign-in page
    (auth)/sign-up/{page,loading}.tsx        # sign-up page
    api/
      auth/[...all]/route.ts                 # Better Auth catch-all (GET, POST)
      tuitions/route.ts                      # public list proxy
      tuitions/[id]/route.ts                 # public detail proxy
      featured-tuitions/route.ts             # featured list proxy
      platform/stats/route.ts                # public stats proxy
      admin/stats/route.ts                   # admin-only stats proxy
      admin/users/route.ts                   # admin-only user list proxy
      admin/users/[id]/role/route.ts         # admin-only role change proxy
      admin/tuitions/route.ts                # admin-only tuition list proxy
      admin/tuitions/[id]/{approve,reject}/route.ts + handle-approval.ts
      admin/transactions/route.ts            # admin-only transaction list proxy
      profile/route.ts                       # GET/PATCH own profile (Better Auth)
      checkout-sessions/route.ts             # POST: create Stripe Checkout Session
      subscription/confirm/route.ts          # POST: verify Stripe session and grant Pro
      subscription/status/route.ts           # GET: current subscription state
      uploads/imgbb/route.ts                 # POST: authenticated banner upload
      uploads/profile-image/route.ts         # POST: unauthenticated sign-up image upload
      webhooks/stripe/route.ts               # POST: Stripe webhook
    dashboard/                               # app-shell layout + role pages (see section 5)
    components/dashboardsidebar.tsx          # role-aware dashboard sidebar
    tuitions/page.tsx, tuitions/[id]/page.tsx# public browse + detail
    all-tuitions/page.tsx                    # redirects to /tuitions
    pricing/page.tsx, payment/...            # Pro plans and checkout UI
    how-it-works/page.tsx, page.tsx          # marketing pages
    error.tsx, not-found.tsx, loading.tsx    # shared error/404/loading UI
    layout.tsx, globals.css                  # root layout and global CSS
  components/
    admin/, auth/, dashboard/, home/, loading/, payment/, profile/, student/, tutor/, tuitions/, ui/
    navbar.tsx, footer.tsx, logo.tsx, site-chrome.tsx, theme-provider.tsx
  hooks/use-mobile.ts                        # responsive helper for the sidebar
  lib/
    auth.ts, auth-client.ts                  # Better Auth server config + shared client
    core/server.ts, backend-api.ts, session.ts
    actions/{applications,tuition}.ts        # "use server" actions
    admin/*, tuitions/*, platform/stats.ts
    imgbb.ts, notify.ts, plans.ts, profile.ts, stripe.ts, subscription.ts, utils.ts
    dashboard-menu.ts                        # role-based menu definitions
  scripts/seed-tuitions.ts
  public/hero-mentorship.jpg
  components.json                            # shadcn config (style: base-nova)
```

## 5. Pages, Routes, and Layouts

`app/layout.tsx` loads Geist fonts, wraps the app in `ThemeProvider` (class theme, `defaultTheme="light"`, system detection, `d` hotkey), seeds the client session with `SessionHydrator`, renders `SiteChrome` (Navbar/Footer) and mounts the single global `AppToastContainer`.

`components/site-chrome.tsx` hides the public Navbar/Footer on `/dashboard` and its children so the dashboard can render its own sidebar + top bar.

| Route | File | Description |
| --- | --- | --- |
| `/` | `app/page.tsx` | Marketing home: Banner, FeaturedTuitions, Pricing, HowMentorLagbeWorks, TopSubjects, PlatformStats |
| `/tuitions` | `app/tuitions/page.tsx` | Public listing; client search, mode filter, `?subject=` prefill from home subject cards |
| `/tuitions/[id]` | `app/tuitions/[id]/page.tsx` | Detail page with student application form |
| `/all-tuitions` | `app/all-tuitions/page.tsx` | Redirects to `/tuitions` |
| `/pricing` | `app/pricing/page.tsx` | Two Pro plans from `lib/plans.ts`; CTA only for the signed-in role's own plan |
| `/payment` | `app/payment/page.tsx` | Read-only checkout review; sign-in/role gates |
| `/payment/success` | `app/payment/success/page.tsx` | Reads `?session_id=`, shows confirmation and triggers verification |
| `/how-it-works` | `app/how-it-works/page.tsx` | Reuses the home workflow section |
| `/sign-in`, `/sign-up` | `app/(auth)/...` | Auth pages (route group keeps flat URLs) |
| `/dashboard` | `app/dashboard/layout.tsx` | App shell: `DashboardGuard`, sidebar, navbar; `/dashboard` itself renders `null` and the guard redirects to the role home |
| `/dashboard/student`, `/dashboard/student/my-applications` | Student pages | Overview stats and application list |
| `/dashboard/bookmarks` | `app/dashboard/bookmarks/page.tsx` | Saved tuitions: search, sort, plan usage, remove; student-only route |
| `/dashboard/tutor`, `/dashboard/tutor/post-tuition`, `/my-tuitions`, `/applicants` | Tutor pages | Overview, create, manage, review |
| `/dashboard/admin`, `/users`, `/tuitions`, `/transactions` | Admin pages | Stats, user management, approvals, transaction list |
| `/dashboard/profile` | `app/dashboard/profile/page.tsx` | Profile edit form + subscription summary |

Every page route has a sibling `loading.tsx` using skeletons from `components/loading/`. `app/error.tsx` and `app/not-found.tsx` provide branded fallback pages.

## 6. Components and Their Responsibilities

**Global / marketing**

- `components/navbar.tsx`: sticky dark header; nav links Home, Browse Tuitions, Pricing, How It Works; mobile hamburger menu; session-aware avatar, role badge, Dashboard/Update Profile links, sign-out (`signOut()`), and sign-in/sign-up CTAs.
- `components/footer.tsx`: CTA banner, quick links, contact info, social icons, legal links (currently both point to `/`).
- `components/site-chrome.tsx`, `theme-provider.tsx`, `logo.tsx`, `ui/toast-container.tsx`: chrome, theme, branding, notifications.

**Home** (`components/home/`): `banner.tsx` (hero + local image), `TopSubjects.tsx` (subject links with `?subject=`), `HowMentorLagbeWorks.tsx` (4-step student and tutor flows), `PlatformStats.tsx` (client-fetched counters with count-up animation), `FeaturedTuitions.tsx` (client-fetched cards from `/api/featured-tuitions`), `Pricing.tsx` (Free vs Pro summary for tutors/students using `lib/plans.ts`, CTA to `/payment`).

**Auth** (`components/auth/auth-form.tsx`): `AuthShell` (two-panel layout), `AuthInput` (icon + show/hide password), `AuthSelect`, `SubmitButton`, `GoogleButton`, `Divider`. `session-hydrator.tsx` seeds the shared client session store.

**Dashboard shell** (`components/dashboard/`): `dashboard-guard.tsx` (client-side auth/role redirect), `dashboard-navbar.tsx`, `profile-dropdown.tsx` (sign out), `role-badge.tsx`, `user-avatar.tsx`, `stat-card.tsx`, `dashboard-page.tsx`, `profile/profile-manager.tsx` (name/phone/image edit). `app/components/dashboardsidebar.tsx` builds the role-specific menu from `lib/dashboard-menu.ts` using `useSession()`; `components/ui/sidebar.tsx` provides the collapsible sidebar primitives.

**Student**: `student-dashboard.tsx` (stats cards from `getStudentStats`), `my-applications.tsx` (list, search, status filter, sort, cancel pending applications).

**Tutor**: `tutor-dashboard.tsx` (stats from `getTutorStats`), `post-tuition-form.tsx` (all tuition fields, banner upload, subscription check, free 2-post limit), `my-tuitions.tsx` (filter, edit, Active/Closed toggle, delete), `manage-applicants.tsx` (filter and accept/reject).

**Admin**: `admin-dashboard.tsx` + `admin-stats-card.tsx`, `admin-users-manager.tsx` (search/role filter, pagination, role changes), `admin-tuition-approvals.tsx` (search/subject/status filters, pagination, approve/reject), `admin-transactions-manager.tsx` (search/role/plan filters, pagination, revenue summary).

**Shared UI**: `components/ui/{button,input,separator,sheet,sidebar,skeleton,tooltip,toast-container}.tsx`, `components/profile/{profile-image-field,avatar-image}.tsx`, `components/tuitions/tuition-banner.tsx`, `components/loading/*`, `components/payment/*`.

## 7. Authentication and Better Auth (Frontend Perspective)

- `lib/auth.ts` configures Better Auth with `mongodbAdapter` on database `mentor_lagbe`, email/password enabled, cookie cache (5 minutes), and additional user fields: `role`, `phone`, plus server-owned subscription fields (`plan`, `subscriptionStatus`, `proPlanId`, `stripeSubscriptionId`, `stripeCustomerId`, `proActivatedAt`, `subscriptionStartDate`, `subscriptionEndDate`). A `databaseHooks.user.create.before` hook reduces public sign-up roles to `Student` or `Tutor`; an update hook blocks client writes to role/subscription fields. Google social provider is only registered when both Google env vars are present.
- `app/api/auth/[...all]/route.ts` exposes `toNextJsHandler(auth)` as GET/POST (sign-in, sign-up, sign-out, session, `updateUser`).
- `lib/auth-client.ts` exports one shared `authClient` created with `inferAdditionalFields<typeof auth>()`, plus `signIn`, `signUp`, `signOut`, `useSession` and `refreshSession()`. All components must use this single instance so session updates propagate.
- `components/auth/session-hydrator.tsx` hydrates the store from the server-resolved session in the root layout; `lib/session.ts` and `lib/core/server.ts` provide `getSession()` / `getToken()` / `authFetch()` for server code (`authFetch` attaches `Authorization: Bearer <session token>` and `cache: "no-store"`).
- Sign-up (`app/(auth)/sign-up/page.tsx`) sends name/email/password/role/optional image and redirects home after ~1.5 s. Sign-in (`app/(auth)/sign-in/page.tsx`) uses email/password and also renders a Google button (`signIn.social`).
- The public Navbar reads `useSession()`; the dashboard has a **client-side** guard (`DashboardGuard`) that redirects unauthenticated users to `/sign-in` and users on another role's dashboard to their own overview. There is **no** `middleware.ts` and no server-side guard on dashboard pages.

## 8. Student, Tutor, and Admin Dashboard Features

- **Student**: live overview (total applied, accepted, pending, current plan), browse/apply on `/tuitions/[id]` (phone, preferred schedule, optional note), list/search/filter/sort applications, cancel only pending applications, save/un-save tuitions from cards and the detail page, manage bookmarks at `/dashboard/bookmarks` (search, sort, usage, remove), view profile and subscription.
- **Tutor**: overview (total posts, active+approved posts, applicants, plan), create tuition with banner upload and free-plan cap of 2 posts (verified through `/api/subscription/status` on every submit), edit/close/delete own posts, review applicants (accept/reject), profile/subscription.
- **Admin**: platform stats (users, tutors, pending/approved posts, Stripe revenue), paginated user search with role promotions (cannot change own role), paginated tuition approvals with subject/status filters, paginated transactions with role/plan filters, profile/subscription.

## 9. API Integration (Frontend Endpoints)

All route handlers set `runtime = "nodejs"` where MongoDB/Stripe are involved; data reads use `cache: "no-store"`.

| Frontend endpoint | Methods | Purpose / upstream call |
| --- | --- | --- |
| `/api/auth/[...all]` | GET, POST | Better Auth session/auth endpoints (client `signIn`, `signUp`, `signOut`, `useSession`, `updateUser`) |
| `/api/tuitions` | GET | Proxies backend public tuition list; filters to approved+active in the proxy |
| `/api/tuitions/[id]` | GET | Proxies one public tuition; 404 for hidden/unavailable posts |
| `/api/featured-tuitions` | GET | Proxies backend featured posts (max 6) |
| `/api/platform/stats` | GET | Proxies public counters |
| `/api/profile` | GET, PATCH | Read/update own profile via Better Auth; PATCH whitelists `name`, `phone`, `image` |
| `/api/admin/stats`, `/api/admin/users`, `/api/admin/tuitions`, `/api/admin/transactions` | GET | Admin-only proxies; server-side session/role check (`requireAdmin()` in `lib/admin/api-auth.ts`, direct `getSession()` check in `/api/admin/stats`) before forwarding |
| `/api/admin/users/[id]/role` | PATCH | Admin role change proxy |
| `/api/admin/tuitions/[id]/approve`, `/.../reject` | PATCH | Admin approval decision fixed by the route path, not the body |
| `/api/checkout-sessions` | POST | Creates Stripe subscription Checkout Session, responds 303 redirect to Stripe |
| `/api/subscription/confirm` | POST | Verifies `sessionId` with Stripe and grants Pro; maps error codes to HTTP statuses |
| `/api/subscription/status` | GET | Reads current subscription state for the signed-in user |
| `/api/webhooks/stripe` | POST | Verifies signature and syncs subscription/checkout events |
| `/api/uploads/imgbb`, `/api/uploads/profile-image` | POST | Validates and uploads images to ImgBB |

Bookmark state is shared through `components/bookmarks/bookmark-provider.tsx` (mounted in the root layout): it loads bookmarks once for authenticated students, exposes optimistic add/remove with rollback and per-tuition pending guards, and is consumed by `components/tuitions/bookmark-button.tsx` and `components/student/bookmarks.tsx`. `lib/actions/bookmarks.ts` wraps the Express bookmark endpoints with `authFetch`.

Server-side data helpers call the Express backend directly with `BACKEND_API_URL` (default `http://localhost:5000`): `lib/actions/tuition.ts` (create/count/list/update/status/delete tuitions, stats, apply), `lib/actions/applications.ts` (student/tutor stats, applications, cancel, review), `lib/admin/*` (stats/users/tuitions/transactions), `lib/platform/stats.ts`, `lib/tuitions/featured.ts`, `lib/subscription.ts` (internal payment/subscription endpoints), and `lib/backend-api.ts` (shared request helper with `x-internal-secret` and user/admin headers).

## 10. Frontend State Management and Data Fetching

- No global store library. React `useState`/`useEffect` drive loading/error/data states in client components; `refreshKey`/`retryKey` patterns re-fetch after mutations.
- Server Components read the session with `getRequestSession()`; `SessionHydrator` seeds Better Auth's client store so `useSession()` works immediately.
- Shared client auth store: one `authClient`; `refreshSession()` notifies subscribers after subscription activation.
- Server Actions (`"use server"` in `lib/actions/*`) keep the backend URL and bearer-token logic out of the browser bundle; `authFetch` supplies the session token.
- Public data is fetched client-side from Next.js proxy routes with `cache: "no-store"`; admin/tutor/student components use `fetch("/api/...")` or server actions and display `notify.error(...)`/`userMessage(...)` on failure. React Toastify (`lib/notify.ts`) is the single notification path (`success`, `error`, `warning`, `info`, `loading`, `promise`, `dismiss`).

## 11. Forms, Validation, and Error Handling

- Sign-up: required name/email, email regex, password >= 8, role must be Student/Tutor; Better Auth errors shown via toast; image upload must finish before submit.
- Sign-in: required email/password; Google button calls `signIn.social`.
- Tuition form: all fields required, fee parsed from free text (`parseAmount`), days >= 1, tutor role check, free-plan limit check (2 posts), 5 MB image limit, image must upload before the tuition is created; uses `notify.promise` for the create action.
- Profile form: name 2-80 chars, phone `/^\+?[0-9][0-9\s-]{5,19}$/`, image URL must be http(s); PATCH `/api/profile` whitelists fields.
- Application form: phone and preferred schedule required; note optional; backend duplicate-application error is surfaced and treated as "already applied".
- Errors: `lib/notify.ts#userMessage` hides network/technical noise; API helpers parse `{ error }` JSON with a fallback message; `app/error.tsx` and `app/not-found.tsx` are branded recovery pages.

## 12. Image Upload (Frontend Perspective)

- `lib/imgbb.ts` (server-only helper) validates `FormData` field `image`: JPG/PNG/WebP/GIF, non-empty, <= 5 MB; posts to `https://api.imgbb.com/1/upload` with `IMGBB_API_KEY`; returns `{ url, deleteUrl }`.
- `POST /api/uploads/imgbb`: requires a Better Auth session; used by the tuition banner form.
- `POST /api/uploads/profile-image`: no session (sign-up has none) but rate-limited per IP (6 uploads/10 minutes, in-memory map) and uses the same validation; used by `components/profile/profile-image-field.tsx`.
- The returned URL is saved with the tuition (`bannerImage`) or passed as `image` to `authClient.signUp.email` / PATCH `/api/profile`. The ImgBB key is never sent to the browser.

## 13. Stripe Payment Integration (Frontend Perspective)

- Plan catalog: `lib/plans.ts` - `pro-tutor` ($15/month) and `pro-student` ($10/month); plan is always derived from the authenticated role, never from query params or request bodies.
- `/pricing` shows plans; `/payment` reviews plan/user and posts to `/api/checkout-sessions` via a normal HTML form (303 redirect to Stripe Checkout). Checkout uses `mode: "subscription"`, monthly recurring `price_data`, `client_reference_id` and metadata (`userId`, `userRole`, `planId`), success URL `/payment/success?session_id={CHECKOUT_SESSION_ID}`, cancel URL `/payment`.
- `/payment/success` first reads stored subscription state; `components/payment/payment-confirmation.tsx` posts `{sessionId}` to `/api/subscription/confirm`. `lib/subscription.ts#verifyAndGrantProFromCheckoutSession` retrieves the Checkout Session and Subscription directly with the Stripe SDK, validates status, price, currency, interval, role/plan metadata, records the payment through the backend, then requests the Pro grant. It is also used by the webhook handler.
- `app/api/webhooks/stripe/route.ts` verifies `stripe-signature` using `STRIPE_WEBHOOK_SECRET` and handles `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `customer.subscription.{created,updated,deleted}` via `syncStripeSubscription`.
- Pro effects in the UI: unlimited tuition posts for Tutors (free cap 2), priority placement/applications and "save" benefits advertised on `/pricing` (not all are implemented - see section 18), subscription badge on `/dashboard/profile`.
- `lib/stripe.ts` throws at startup if `STRIPE_SECRET_KEY` is missing and documents restricted-key permission requirements. `isStripePermissionError` maps permission failures to a 502 with a friendly message.

## 14. Environment Variables (names and descriptions only)

Present in the working `.env` (values intentionally omitted):

| Variable | Description |
| --- | --- |
| `BETTER_AUTH_SECRET` | Secret used by Better Auth to sign/verify session cookies and tokens |
| `BETTER_AUTH_URL` | Base URL Better Auth uses for callbacks and trusted origins |
| `BETTER_AUTH_DB_URI` | MongoDB connection string used by the Better Auth adapter and seed script |
| `INTERNAL_API_SECRET` | Shared secret sent as `x-internal-secret` when calling Express backend endpoints |
| `BACKEND_API_URL` | Base URL of the Express backend (code defaults to `http://localhost:5000`) |
| `IMGBB_API_KEY` | Server-side key for ImgBB image uploads, used only in route handlers |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key; declared in `.env` but not read by any current source file |
| `STRIPE_SECRET_KEY` | Stripe secret/restricted key used by the server-side Stripe SDK; can be `rk_...` (see `lib/stripe.ts`) |

Read in code but **not** present in the working `.env` (needed to enable those features):

| Variable | Description |
| --- | --- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth credentials; Google sign-in is skipped entirely when absent |
| `STRIPE_WEBHOOK_SECRET` | Signing secret used to verify Stripe webhook events; webhook returns 500 when absent |
| `NEXT_PUBLIC_SITE_URL` / `APP_URL` | Optional fixed origin for Stripe success/cancel URLs; falls back to request headers |

Never commit real credentials. The repository `.gitignore` excludes `.env*`.

## 15. Required npm Packages and Their Purposes

See `package.json` for exact versions. Runtime: `next`, `react`, `react-dom`, `better-auth`, `@better-auth/mongo-adapter`, `mongodb`, `stripe`, `@stripe/stripe-js`, `react-toastify`, `next-themes`, `lucide-react`, `@base-ui/react`, `shadcn`, `class-variance-authority`, `cn`, `tw-animate-css`. Development: `typescript`, `@types/*`, `tailwindcss`, `@tailwindcss/postcss`, `prettier`, `prettier-plugin-tailwindcss`, `eslint`, `eslint-config-next`, `tsx`.

## 16. Running the Client Locally

```bash
npm install
# create/populate .env (section 14)
npm run dev      # http://localhost:3000
```

For full functionality also start the backend (`cd ../mentorlagbe-server && npm start`, default `http://localhost:5000`) and set `BACKEND_API_URL` / `INTERNAL_API_SECRET` to matching values. Run `npm run typecheck` and `npm run lint` before committing.

## 17. Frontend Deployment

The repository contains a Vercel project link (`.vercel/project.json`) and no `vercel.json`. Typical flow:

1. Import the `mentorlagbe-client` repository in Vercel (framework preset: Next.js; root directory = client folder).
2. Add all required environment variables from section 14 in the Vercel project settings (including the ones missing locally if those features are needed). Set `BACKEND_API_URL` to the deployed Express API and use matching `INTERNAL_API_SECRET` values in both projects.
3. Register the deployed origin as a Better Auth trusted origin (`BETTER_AUTH_URL`), and configure Stripe webhook endpoint `<deployed-origin>/api/webhooks/stripe` with `STRIPE_WEBHOOK_SECRET`.
4. Deploy; verify `npm run build` locally first. Node.js runtime is required for the MongoDB/Stripe route handlers (they declare `runtime = "nodejs"`).

No Dockerfile or custom server is configured for the client.

## 18. Current Frontend Implementation Status and Known Issues

**Implemented**: full marketing home, browse/detail pages, sign-in/sign-up with Better Auth, session-aware navbar and footer, all three role dashboards with real backend data, tuition CRUD, application apply/cancel/review, profile editing, image uploads, Stripe checkout/confirm/webhook, admin management screens, seed script, loading/error states and toasts.

**Known gaps / issues**:

1. No `middleware.ts`; `DashboardGuard` and admin route handler checks are the only protection. Dashboard pages themselves are not server-guarded, and admin API proxies verify both session and role while some server actions rely on the backend's token check.
2. Google OAuth button is wired but inactive because `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are not configured.
3. Stripe webhook needs `STRIPE_WEBHOOK_SECRET`; `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set but unused by code.
4. Bookmarks are stored in a dedicated `bookmarks` collection on the backend (one row per student/tuition, compound unique index), with a free-student cap of 5 enforced server-side. The Pro Student "Save tutors and tuition posts" benefit is only partially covered: tuition bookmarks exist, but tutor bookmarks do not.
5. `/api/admin/stats` and `requireAdmin()` duplicate role-check logic; the admin proxies depend on both the Next.js session and Express internal headers.
6. `lib/dashboard-menu.ts` still contains logic for a `subscription` menu item and an "About" page/link no longer exists in the current nav; `/dashboard` renders `null` and relies on the client redirect.
7. Footer legal links (Terms of Service, Privacy Policy) point to `/`.
8. `globals.css` contains only Tailwind import, animation/keyframe and toast styling - no shadcn theme token block (`components.json` declares `cssVariables: true`), so token-based utility classes may have no CSS variables backing them.
9. Theme defaults differ: `app/layout.tsx` passes `defaultTheme="light"` while `components/theme-provider.tsx` defaults to `"system"` (layout prop wins).
10. `components/home/PlatformStats.tsx`, `FeaturedTuitions.tsx` and the listings page fetch on the client; failures are toast-only with retry buttons.
11. Client-side validation is duplicated across forms and route handlers (intentional defence in depth); the backend remains the authority for ownership and roles.
12. Image upload endpoints keep the ImgBB key server-side; the unauthenticated sign-up upload endpoint relies on an in-memory per-instance rate limit, which resets on restart and is not shared across instances.
13. Seed script requires at least one existing Tutor account and uses `$setOnInsert`, so it will not update already-seeded posts.

This README was written from the source code in this repository (Next.js 16 App Router). When adding features, update both this file and the backend README as appropriate.
