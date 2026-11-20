# MentorLagbe — Client

**MentorLagbe** is a tuition/mentorship platform for Bangladesh that connects students with verified tutors. This repository is the **frontend (client)** app. A sibling folder `mentorlagbe-server` exists next to this repo but is currently **empty** (no backend code yet).

This document is the single source of truth for the project's state. Feed it to a new conversation to resume work without re-explaining anything.

---

## 1. Project Overview

- **Product name:** MentorLagbe
- **Tagline:** "Find the right mentor, right when you need one."
- **User roles:** `Student` (default), `Tutor`, `Admin` — selected at sign-up via a select field
- **Core concept:** Students browse tuition posts, tutors offer their services, sessions are tracked. Paid "Pro" plans are planned.

## 2. Current Status Snapshot

| Area                                                             | Status                                                                    |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Project scaffolding (Next.js 16 + Tailwind 4 + shadcn/base-nova) | ✅ Done                                                                   |
| Root layout (fonts, theme provider, navbar, footer)              | ✅ Done                                                                   |
| Navbar (desktop + mobile, session-aware)                         | ✅ Done                                                                   |
| Footer                                                           | ✅ Done                                                                   |
| Auth pages — Sign Up (email/password + role select)              | ✅ Done                                                                   |
| Auth pages — Sign In (email/password + Google button)            | ✅ Done                                                                   |
| Auth API route (`/api/auth/[...all]`)                            | ✅ Done                                                                   |
| Auth backend config (Better Auth + MongoDB, `role` field)        | ✅ Done                                                                   |
| Home page (simple hero with CTA links)                           | ✅ Done (basic)                                                           |
| Browse Tuitions page                                             | 🟨 Placeholder — title only                                               |
| Pricing page                                                     | 🟨 Placeholder — title only                                               |
| How It Works page                                                | 🟨 Placeholder — title only                                               |
| Dashboard page                                                   | 🟨 Placeholder — title only ("Role-based dashboard content will go here") |
| Update Profile page                                              | 🟨 Placeholder — title only ("Profile editing form will go here")         |
| About page                                                       | 🟨 Placeholder — completely empty component                               |
| Google OAuth (social provider)                                   | ⚠️ Code wired up, but **not functional** — see Pending Tasks              |
| Route protection / middleware                                    | ❌ Not started                                                            |
| Backend (`mentorlagbe-server`)                                   | ❌ Empty folder                                                           |

Legend: ✅ implemented · 🟨 skeleton exists · ❌ not started · ⚠️ partially wired

## 3. Technologies Used

| Technology                                                          | Version                                | Purpose                                                                                                                            |
| ------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Next.js                                                             | 16.4.5 (App Router)                    | Framework. **Note:** APIs differ from older Next.js — consult `node_modules/next/dist/docs/` before writing code (see `AGENTS.md`) |
| React                                                               | 19.3.1                                 | UI library                                                                                                                         |
| TypeScript                                                          | ^5                                     | Typing throughout                                                                                                                  |
| Tailwind CSS                                                        | ^4 (via `@tailwindcss/postcss`)        | Styling — CSS-first config, **no `tailwind.config` file**                                                                          |
| shadcn (base-nova style)                                            | ^4.23.0 + `@base-ui/react` ^1.9.0      | Component primitives (`components/ui/*` uses Base UI, not Radix)                                                                   |
| Better Auth                                                         | ^1.7.25 + `@better-auth/mongo-adapter` | Authentication                                                                                                                     |
| MongoDB                                                             | ^7.9.0 (Node driver)                   | Auth database (`mentor_lagbe` DB)                                                                                                  |
| next-themes                                                         | ^0.4.6                                 | Light/dark theme (class attribute, system default)                                                                                 |
| `class-variance-authority`, `cn`                                    | —                                      | Variant/class utilities                                                                                                            |
| Prettier + prettier-plugin-tailwindcss, ESLint (eslint-config-next) | —                                      | Formatting & linting                                                                                                               |

Fonts: **Geist** and **Geist Mono** (Google fonts) exposed as `--font-sans` / `--font-mono`.

## 4. Folder Structure

```
mentorlagbe-client/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx        # Sign-in page (fully implemented)
│   │   └── sign-up/page.tsx        # Sign-up page (fully implemented)
│   ├── api/auth/[...all]/route.ts  # Better Auth catch-all handler (GET + POST)
│   ├── about/page.tsx              # Placeholder (empty)
│   ├── dashboard/page.tsx          # Placeholder
│   ├── how-it-works/page.tsx       # Placeholder
│   ├── pricing/page.tsx            # Placeholder
│   ├── tuitions/page.tsx           # Placeholder
│   ├── update-profile/page.tsx     # Placeholder
│   ├── globals.css                 # Only `@import "tailwindcss";` — no theme tokens yet
│   ├── layout.tsx                  # Root layout: fonts + ThemeProvider + Navbar + Footer
│   ├── page.tsx                    # Home page
│   └── favicon.ico
├── components/
│   ├── auth/auth-form.tsx          # AuthShell, AuthInput, AuthSelect, SubmitButton, GoogleButton, Divider
│   ├── ui/button.tsx               # shadcn button (Base UI + CVA variants)
│   ├── footer.tsx                  # Footer
│   ├── logo.tsx                    # LogoMark (lime link icon) + Logo (link wrapper)
│   ├── navbar.tsx                  # Navbar
│   └── theme-provider.tsx          # next-themes wrapper + "d" hotkey toggle
├── hooks/                          # Empty (.gitkeep)
├── lib/
│   ├── auth.ts                     # Better Auth server config (MongoDB adapter)
│   ├── auth-client.ts              # Shared Better Auth client (React hooks)
│   └── utils.ts                    # cn() helper
├── components.json                 # shadcn config (style: base-nova)
├── .env                            # BETTER_AUTH_SECRET, BETTER_AUTH_URL, BETTER_AUTH_DB_URI
└── package.json
```

## 5. Completed Features (details)

### 5.1 Root Layout (`app/layout.tsx`)

- Geist / Geist Mono fonts loaded via `next/font/google`, `suppressHydrationWarning` on `<html>` for theme.
- Wraps the whole app in `ThemeProvider` (class-based, `defaultTheme="light"` passed in layout, system detection enabled).
- Renders `<Navbar />` above `{children}` and `<Footer />` below on **every** page (auth pages included — the auth shell is sized with `min-h-[calc(100svh-4rem)]` to account for the 4rem sticky navbar).

### 5.2 Navbar (`components/navbar.tsx`)

- **Sticky, dark header** (`bg-neutral-900`), height 16 (`h-16`), max-w-7xl container.
- Logo (`components/logo.tsx`) links home; lime (`#a3e635`-family) is the brand accent color.
- **Nav links:** Home `/`, Browse Tuitions `/tuitions`, Pricing `/pricing`, How It Works `/how-it-works`, About `/about`. Active link highlighted via `usePathname()`.
- **Breakpoint behavior:** desktop nav links visible at `lg+`; hamburger menu button below `lg` toggles a dropdown panel with the same links. Desktop user section visible at `md+` (below `md`, everything lives in the mobile menu).
- **Session-aware right side** (uses `authClient.useSession()`):
  - While loading (`isPending`): pulsing avatar skeleton.
  - **Signed in:** avatar (user image or 2-letter initials fallback), truncated name, colored **role badge** (Student = sky, Tutor = lime, Admin = rose, defaults to Student styling), extra links **Dashboard** `/dashboard` and **Update Profile** `/update-profile`, and a **Sign Out** button.
  - Sign-out: calls `signOut()`, redirects to `/`, refreshes the router, disables the button with "Signing Out..." while pending.
  - **Signed out:** "Sign In" text link + lime pill **Sign Up** button → `/sign-up`.
- Mobile menu mirrors the same signed-in/signed-out states and closes on link click.

### 5.3 Footer (`components/footer.tsx`)

- Server component; dark (`bg-neutral-950`) with a soft lime glow decoration.
- **CTA banner:** lime rounded card — "Ready to find the right mentor?" + "Get Started" → `/sign-up`.
- **4-column grid:** Brand block (logo, tagline, social links: X, Facebook, LinkedIn — inline SVGs, external `target="_blank"`), Quick Links (same 5 nav routes), Contact (email `support@mentorlagbe.com`, phone `+880 1700-000000`, location "Dhaka, Bangladesh"), Legal (Terms of Service / Privacy Policy — **both currently just link to `/`**, no real pages).
- Dynamic copyright year; tagline "Mentors · Learners · Growth"; giant gradient "MentorLagbe" wordmark cut off at the bottom (signature design element).

### 5.4 Home Page (`app/page.tsx`)

- Simple centered hero: LogoMark + "MentorLagbe" heading, one-line description, two CTAs → "Browse Tuitions" (lime pill) and "How It Works" (outline). Server component. No other homepage sections exist yet.

### 5.5 Auth Pages

Shared building blocks in `components/auth/auth-form.tsx`:

- **`AuthShell`** — two-panel split layout: desktop-only left brand panel (logo, headline with lime highlight, 3 checkmark feature bullets, copyright; lime blur glow decorations) and right form panel. Compact brand row on mobile.
- **`AuthInput`** — label + input with optional leading icon (`mail` / `lock` / `user`); password inputs get an eye toggle to show/hide.
- **`AuthSelect`**, **`SubmitButton`** (lime pill), **`GoogleButton`** (real Google logo SVG), **`Divider`** ("or").

**Sign Up (`app/(auth)/sign-up/page.tsx`)** — client component:

- Fields: Full Name, Email, role select ("I am a": Student/Tutor/Admin, default Student), Password (min 8, show/hide toggle).
- Client-side validation before submit: required name/email, email regex, password ≥ 8 chars, valid role.
- Submits via `authClient.signUp.email({ name, email, password, role, callbackURL: "/" })`. On success shows "Account created successfully! Redirecting..." and routes to `/` after 1.5s (with `router.refresh()`). Errors from Better Auth are shown in a red alert line; success in a lime status line. Button shows "Creating account..." while pending.
- **Note:** logs form data (password redacted) with `console.log` — leftover debug logging.

**Sign In (`app/(auth)/sign-in/page.tsx`)** — client component:

- Fields: Email, Password (show/hide toggle). Required-field check only.
- Submits via `authClient.signIn.email({ email, password, callbackURL: "/" })`; on success redirects to `/` and refreshes.
- "Continue with Google" button calls `authClient.signIn.social({ provider: "google", callbackURL: "/" })`.
- Cross-links between the two auth pages in the footer slot.

## 6. Authentication System

**Stack:** Better Auth (server + React client) with the official **MongoDB adapter**.

### Server (`lib/auth.ts`)

- Connects via `MongoClient(process.env.BETTER_AUTH_DB_URI)`, database **`mentor_lagbe`**.
- **Email & password** enabled.
- **Custom user field `role`:** `type: "string"`, `input: true`, `defaultValue: "Student"`. Type is a plain string (Better Auth field types are primitives); the allowed values (Student/Tutor/Admin) are only enforced by the sign-up form's select options — the server does not validate the enum.
- **Google social provider** configured from `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` env vars (cast with `as string`, no presence validation).
- Mounted at `app/api/auth/[...all]/route.ts` via `toNextJsHandler(auth)`.

### Client (`lib/auth-client.ts`)

- One shared `authClient = createAuthClient({ plugins: [inferAdditionalFields<typeof auth>()] })`; exports `signIn, signUp, signOut, useSession`.
- `inferAdditionalFields` surfaces the server's `role` field in client types; the `auth` import is **type-only** so no server code reaches the client bundle.
- Consumers must import from this single instance (see Fix F1).

### What works end-to-end

Email/password sign-up (with role persisted), sign-in, session read in the navbar (`authClient.useSession()`), and sign-out — all against MongoDB. Sessions appear/disappear in the navbar immediately.

### What is wired but not functional

Google OAuth UI exists on both auth pages and `socialProviders.google` is configured server-side, but the Google client ID/secret are **absent from `.env`** (currently only `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_DB_URI` are set), so the flow will fail until credentials are added.

## 7. Design Decisions

1. **Brand identity:** dark neutral surfaces (`neutral-900`/`neutral-950`) with **lime-400** as the single accent color; rounded-full pill CTAs; `-rotate-6` link-chain LogoMark; lime blur glows on dark panels. Consistent across navbar, footer, auth pages, and home hero.
2. **Route group `(auth)`** for sign-in/sign-up so their URLs stay flat (`/sign-in`, `/sign-up`) without affecting the layout (they still share the root layout with navbar/footer).
3. **Single shared auth client instance** — everything (navbar included) imports from `lib/auth-client.ts`; multiple instances would each hold their own session store and stop seeing each other's updates.
4. **Role as a string field, not enum:** Better Auth additional fields only support primitive types; the form's select constrains values. Navbar falls back to `role ?? "Student"` and unknown roles render with Student badge styling.
5. **Client-side validation first, server errors second** on auth forms (regex email check, password length, role whitelist) with `role="alert"` / `role="status"` for accessibility.
6. **Navbar/Footer globally** in the root layout rather than per-page; auth pages size themselves with `min-h-[calc(100svh-4rem)]` to fit below the sticky navbar.
7. **Inline SVG icons** (no icon library installed despite `iconLibrary: "lucide"` in components.json).
8. **Tailwind 4 CSS-first** styling with no config file; custom theme tokens (e.g., `--color-primary`) are **not yet defined** in `globals.css` — only the Tailwind import exists there, so shadcn token classes like `text-muted-foreground` have no variable backing on placeholder pages.
9. **Theme hotkey:** pressing "d" (outside inputs) toggles light/dark via a `ThemeHotkey` helper inside `ThemeProvider`.

## 8. Fixes Applied (so we don't redo them)

- **F1 — Sign-out not updating the navbar:** the navbar originally had its own auth client; because each `createAuthClient()` instance keeps its own session store, the navbar kept showing the old session after sign-out on an auth page. Fixed by making everything import the **single shared instance** from `lib/auth-client.ts`. (Documented in comments in that file.)
- **F2 — Navbar under sticky header:** auth shell uses `min-h-[calc(100svh-4rem)]` so content doesn't overflow behind the 4rem sticky navbar.
- **F3 — Mobile nav breakpoint tuning:** desktop nav links show at `lg+` (not `md+`) to prevent crowding, with the hamburger handling anything below `lg`.

## 9. Pending Tasks / Known Gaps

1. **Google OAuth not functional:** add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env` (they are read in `lib/auth.ts` but missing). Also `as string` casts mean missing vars fail at runtime, not at startup.
2. **Real content for the placeholder pages:** `/tuitions` (tuition post listing), `/pricing`, `/how-it-works`, `/dashboard` (role-based content), `/update-profile` (profile edit form), `/about` (empty file).
3. **No route protection:** `/dashboard` and `/update-profile` are public; no middleware or server-side session guard exists.
4. **globals.css has no theme tokens** — shadcn semantic classes (`bg-primary`, `text-muted-foreground`, `border-ring`, etc.) used by `components/ui/button.tsx` and placeholder pages currently have no CSS variables behind them; the theme block still needs to be generated/added.
5. **Backend absent:** `mentorlagbe-server` is an empty folder; all data comes from the auth DB only. Tuition CRUD, profiles, payments need a server (or Next.js server actions/route handlers).
6. **Role not validated server-side:** any `role` string can be sent to the sign-up endpoint; the enum is only enforced in the browser form.
7. **No sign-in state redirect:** already-authenticated users can still visit `/sign-in` / `/sign-up`.
8. **Debug `console.log`s remain** in sign-up (form data) and sign-in (success) handlers.
9. **Footer legal links** (Terms of Service / Privacy Policy) point to `/` — no dedicated pages.
10. **Hooks directory empty**; `iconLibrary: "lucide"` configured but `lucide-react` not installed (icons are inline SVGs).
11. **ThemeProvider defaults differ slightly:** layout passes `defaultTheme="light"`, while the wrapper component's own default is `"system"` — reconcile at some point.

## 10. Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run format     # prettier
```

**Environment variables (`.env`):**

```
BETTER_AUTH_SECRET=<secret>
BETTER_AUTH_URL=<app base url>
BETTER_AUTH_DB_URI=<mongodb connection string>
# Missing — required for Google sign-in:
# GOOGLE_CLIENT_ID=<from Google Cloud Console>
# GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
```

---

## 11. Notifications (React-Toastify)

Global toasts are provided by **`react-toastify`**. A single themed
`<AppToastContainer />` is mounted in `app/layout.tsx` inside `ThemeProvider`,
so every page (marketing, auth and dashboard) shares one toast container.

- `lib/notify.ts` — the only entry point for notifications: `notify.success`,
  `notify.error`, `notify.warning`, `notify.info`, `notify.loading`,
  `notify.promise` and `notify.dismiss`, plus `userMessage(error)` which turns
  thrown values into short, user-safe descriptions.
- `components/ui/toast-container.tsx` — the single global `ToastContainer`,
  configured for bottom-right placement, dark theme, 4 second auto-close,
  `Bounce` animation and a 4-toast limit.
- `app/globals.css` — `.mentorlagbe-toasts` CSS variables restyle the container
  with the site's dark surfaces and lime/rose/sky/amber accents.

Use `notify` after an operation actually succeeds or fails; use
`notify.promise()` for longer async work so a loading state is shown. Never
show a success toast for a failed request, and avoid firing two toasts for the
same action.

## 12. Seeding approved tuitions

`scripts/seed-tuitions.ts` inserts 12 realistic, approved tuition posts and
connects each one to a **real Tutor account** already stored in the `user`
collection (the script resolves `tutorId`, `tutorName` and `tutorEmail` from
the database — no fake references).

```bash
npm run seed          # insert missing posts; safe to re-run
npm run seed:dry      # preview the posts without writing
```

The script uses `BETTER_AUTH_DB_URI` from `.env`, targets the existing
`mentor_lagbe.tuition` collection and is idempotent: document ids are derived
from stable slugs and written with `$setOnInsert`, so re-running never creates
duplicates and never overwrites existing records. It requires at least one
account with `role: "Tutor"` to exist. Verify afterwards with
`GET /all-tuitions` on the backend (or `/api/tuitions` through Next.js) — the
seeded posts appear immediately because those routes use `cache: "no-store"`.

---

## 13. Note for Future Sessions (AI / collaborators)

- Everything above reflects the code **as of 2026-11-18**. When unsure whether a feature exists, check the Status table in §2 and the actual files — do not implement anything listed as ✅ again.
- The **next logical steps** are: finish the placeholder pages (starting with `/tuitions` listing and the role-based `/dashboard`), add auth guards for private routes, complete `globals.css` theme tokens, and scaffold the backend.
- Next.js 16 here has breaking changes vs. older versions — read the bundled docs in `node_modules/next/dist/docs/` before writing Next.js-specific code (see `AGENTS.md`).
