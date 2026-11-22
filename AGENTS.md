<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Sound of Revival — project guide

Event companion app for the Baze University Chapel Thanksgiving Service concert.
Three surfaces share one codebase:

- **Audience** (`src/app/(audience)/`) — public, mobile-first: order of program,
  song lyrics reached by QR code, Instagram post gallery.
- **Admin** (`src/app/(admin)/admin/`) — authenticated organizers: CRUD for program,
  songs, posts; controls what is projected live.
- **Display** (`src/app/(display)/display/`) — fullscreen 16:9 projection that follows
  `live_state`; no chrome, no interaction.

## Commands

- `yarn dev` / `yarn build` / `yarn start` / `yarn lint`
- `yarn db:generate` — generate Drizzle migrations from `src/server/db/schema.ts`
- `yarn db:migrate` — apply migrations
- `yarn db:seed` — seed the event and first admin (reads `ADMIN_EMAIL`/`ADMIN_PASSWORD`)

## Stack

Next.js 16 App Router + TypeScript + React 19 (Turbopack; Cache Components and Partial
Prefetching enabled in `next.config.ts`), Postgres via Drizzle ORM (`postgres` driver),
zod for validation, iron-session + bcrypt for admin auth, `qrcode` for song QR SVGs,
CSS Modules + design tokens for styling. Package manager: **yarn 4** (node-modules linker,
see `.yarnrc.yml`). Do not introduce npm/pnpm lockfiles.

## Architecture map (DRY)

```
src/
  proxy.ts                     # optimistic /admin redirect only — not the security boundary
  app/(audience|admin|display)/# route groups per surface; api/ for route handlers
  server/                      # 'server-only' — the ONLY place that touches the DB
    db/schema.ts               # single source of truth: tables, types, relations
    services/*.ts              # all queries and mutations live here
    auth/                      # session (iron-session), requireAdmin(), password hashing
  components/ui/               # prop-driven primitives reused by all three surfaces
  features/*/                  # feature components and hooks
  lib/                         # pure helpers (urls, instagram parsing, formatting)
  styles/tokens.css            # the only place raw design values exist
```

Hard rules:

- Never query the DB outside `src/server/services` — pages, actions, and route handlers
  call services.
- Every mutation is a Server Function guarded by `requireAdmin()`; actions live next to
  their feature and delegate to a service. Public pages are read-only.
- Zod schemas are derived from the Drizzle schema (`drizzle-zod`) — do not hand-write
  duplicate validators.
- Reuse `components/ui` primitives and the `useLiveState()` hook; do not fork styles or
  fetch live state ad hoc.
- Design values come from `src/styles/tokens.css` only. Read `design.md` before any UI
  work.

## Cache Components conventions

`cacheComponents: true` is enabled — every route must produce a static shell:

- Cacheable reads: `'use cache'` + `cacheLife(...)` + `cacheTag(...)` in service
  functions (e.g. program list, song lyrics, posts).
- Request-time reads (`cookies()`, `searchParams`, live `live_state` polling data) must
  sit behind `<Suspense>` boundaries or inside `'use cache: private'` helpers.
- Mutations call `revalidateTag`/`updateTag` (never revalidate everything), and the
  admin UI uses `refresh()` where a router refresh is enough.
- Live state is a single-row `live_state` table streamed to the audience program
  page over SSE (`/api/live/[eventId]/stream`, fanned out via Postgres
  `LISTEN/NOTIFY` on the `live_state` channel); `/api/live/[eventId]` remains the
  polling fallback. Don't add WebSockets without discussing it first.

## Auth

- Admin sessions are iron-session encrypted cookies; `getCurrentUser()` uses
  `'use cache: private'` per the bundled guide
  (`node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`).
- `src/proxy.ts` only redirects unauthenticated `/admin` visits; every server action and
  route handler re-checks authorization itself.

## Instagram posts

Instagram scraping is not allowed. Flow: paste URL → extract shortcode (`lib/instagram.ts`)
→ iframe embed preview in admin → admin uploads the image for the clean projection card.
If `IG_OEMBED_TOKEN` is set, auto-fill thumbnail/caption via the Graph oEmbed API.

## Environment

- `DATABASE_URL` — Postgres connection string (details supplied per deployment)
- `SESSION_SECRET` — iron-session password, ≥ 32 chars
- `NEXT_PUBLIC_APP_URL` — public origin used in QR codes
- `MEDIA_DIR` — persistent directory for uploaded images (Dokploy volume)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — used by `yarn db:seed`
- `IG_OEMBED_TOKEN` — optional; enables Instagram oEmbed auto-fill

## Deployment

Dokploy (Docker, self-hosted): build with `output: 'standalone'`, run
`yarn db:migrate` as a deploy step, and mount a persistent volume at `MEDIA_DIR` for
uploads. `NEXT_PUBLIC_APP_URL` must be set at build time (it is baked into QR codes).

