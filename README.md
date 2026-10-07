# OpenRoles — Recruitment Platform

A production-ready recruitment website and admin panel built with **Next.js 15 (App Router)**, **React 19** and **Tailwind CSS v4**, connected to recruitment data via a Google Apps Script API backed by Google Sheets.

## Features

**Public site**
- Landing page with featured open positions and "how it works" sections
- Live job directory (`/jobs`) with per-vacancy detail pages
- Short application form per vacancy (`/apply/[vacancyId]`) that writes straight to the recruitment sheet
- Forms with server and client validation, accessible markup, loading/skeleton/error states

**Admin panel** (`/admin`, password protected)
- Dashboard with live application stats
- Vacancy manager — list, search and per-vacancy candidate views, plus "Add Vacancy" (creates the vacancy in the backend)
- Candidate directory grouped by vacancy, with search and status/WhatsApp filters
- Candidate detail view with status updates and a WhatsApp handoff button
- HMAC-signed, HttpOnly session cookie (7 days) enforced by an Edge middleware gate and a server-side layout check

**Integration**
- Single centralized API client (`lib/recruitment-api.ts`) for the Google Apps Script endpoint, with typed responses, per-kind error handling and server-side caching
- Thin `/api/recruitment` proxy that whitelists mutating actions and requires an authenticated session for all of them except public applications
- Server-only environment variables — credentials and the Google Script URL are never shipped to the browser

## Tech stack

- Next.js 15.5 (App Router, RSC, Route Groups)
- React 19, TypeScript 5
- Tailwind CSS v4 (`@theme` design tokens)
- ESLint 9 + `eslint-config-next`

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run start     # serve the production build
npm run lint
npm run typecheck
```

### Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable              | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `GOOGLE_SCRIPT_URL`   | Google Apps Script web app endpoint       |
| `ADMIN_USERNAME`      | Admin panel username                      |
| `ADMIN_PASSWORD`      | Admin panel password                      |
| `ADMIN_SESSION_SECRET`| Long random string used to sign sessions  |

> Values containing `#` must be wrapped in double quotes (e.g. `ADMIN_PASSWORD="a#b"`).

## Project structure

```
app/
  (public)/          Public marketing + jobs pages
  admin/(panel)/     Protected admin screens (sidebar layout)
  admin/login/       Admin sign-in
  api/recruitment/   Whitelisted mutating-action proxy
  api/auth/          Sign-in / sign-out
components/
  ui/                Badge, Button, Empty/Error state, Icons, Skeleton
  admin/             Sidebar, directory, forms, status/WhatsApp controls
  site-header/footer, job-card, jobs-directory, apply-form
lib/
  recruitment-api.ts Central Apps Script client
  auth.ts            Session signing + verification
  validation.ts      Shared form rules
  types.ts           Vacancy / Candidate types + status constants
middleware.ts        Edge gate for /admin
```