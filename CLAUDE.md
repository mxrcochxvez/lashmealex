# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                    # local Next.js dev server
pnpm build                  # Next.js build + OpenNext Cloudflare packaging
pnpm build:worker           # OpenNext Cloudflare build only (skips Next build)
pnpm preview                # build worker + wrangler dev (local Cloudflare runtime)
pnpm deploy                 # build worker + wrangler deploy
pnpm lint                   # ESLint
pnpm typecheck              # TypeScript type-check (no emit)

# Database (Cloudflare D1 via Wrangler)
pnpm db:migrate:local       # apply migrations locally
pnpm db:seed:local          # seed local D1
pnpm db:migrate:remote      # apply migrations to production D1
pnpm db:seed:remote         # seed production D1
```

Migrations live in `drizzle/migrations/`. Schema source of truth is `src/db/schema.ts`. Use `drizzle-kit` to generate new migrations.

## Architecture

This is a **Next.js 16 app deployed on Cloudflare Workers** via `@opennextjs/cloudflare`. The runtime is the Cloudflare Workers edge runtime, not Node.js.

### Cloudflare bindings

All server code must access the Cloudflare environment through `getCloudflareContext()` from `@opennextjs/cloudflare`. The two helpers in `src/lib/cloudflare.ts` are the single entry points:

- `getDb()` — returns the Drizzle client backed by the `DB` D1 binding
- `getProductImagesBucket()` — returns the `PRODUCT_IMAGES` R2 bucket
- `getProductImagePath(key)` — converts an R2 object key to the in-app delivery URL (`/images/...`)

Never import `getCloudflareContext` directly outside of `src/lib/cloudflare.ts`.

### Data model

Three tables in D1 (SQLite), all prices stored in **cents** as integers:

- `products` — variant-level records. One parent product (identified by `parentProductId` and `parentProductName`) can have many rows (variants). `slug` is the unique URL segment per variant; `parentProductId` groups variants together.
- `orders` / `orderItems` — order and fulfillment state.

`src/db/schema.ts` is the Drizzle schema. `src/db/index.ts` exports `createDb(env)`.

### Server utilities (`src/lib/`)

- `catalog.ts` — product queries for storefront and admin
- `orders.ts` — order summary queries for the admin
- `admin-auth.ts` — password-based admin sessions (env vars `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`)
- `money.ts` — cent-to-display formatting

### Client state

`src/context/CartContext.tsx` — React context providing in-memory cart state. Cart is not persisted across page loads. Wrap any component that calls `useCart()` inside `CartProvider` (already done at root layout level).

### Routing

App Router layout with two surfaces:
- **Storefront**: `/`, `/shop`, `/products/[slug]`, `/wishlist`
- **Admin**: `/admin` (dashboard), `/admin/login`, `/admin/products/[slug]`

Admin mutations are Next.js Server Actions defined in `src/app/admin/actions.ts`. All actions call `requireAdmin()` first.

Product images are served through `src/app/images/[...key]/route.ts`, which streams from the R2 bucket. This keeps image URLs coupled to the app, not to the Cloudflare dashboard.

### Fonts

`--font-sans` → Plus Jakarta Sans, `--font-display` → Cormorant Garamond. Both are CSS variables set on `<html>` in `src/app/layout.tsx`.

### Styling

Tailwind CSS v4 with PostCSS. Global styles in `src/app/globals.css`. Component-level animation uses Framer Motion.
