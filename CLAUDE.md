# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                    # local Next.js dev server
pnpm dev:remote             # dev server with remote Cloudflare bindings
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

Migrations live in `drizzle/migrations/`. Schema source of truth is `src/db/schema.ts`. Use `drizzle-kit` to generate new migrations (`pnpm drizzle-kit generate`).

## Architecture

This is a **Next.js 16 app deployed on Cloudflare Workers** via `@opennextjs/cloudflare`. The runtime is the Cloudflare Workers edge runtime, not Node.js. No test suite exists; verify correctness by running `pnpm typecheck` and `pnpm lint`.

### Cloudflare bindings

All server code must access the Cloudflare environment through `getCloudflareContext()` from `@opennextjs/cloudflare`. The helpers in `src/lib/cloudflare.ts` are the **single entry points**:

- `getDb()` — returns the Drizzle client backed by the `DB` D1 binding
- `getProductImagesBucket()` — returns the `PRODUCT_IMAGES` R2 bucket
- `getProductImagePath(key)` — converts an R2 object key to the in-app delivery URL (`/images/...`)

Never import `getCloudflareContext` directly outside of `src/lib/cloudflare.ts`.

Wrangler bindings (defined in `wrangler.toml`):
- D1 database binding: `DB` → `lashmealex-d1`
- R2 bucket binding: `PRODUCT_IMAGES` → `product-images`

### Data model

Five tables in D1 (SQLite), all prices stored in **cents** as integers:

- `products` — variant-level records. One parent product (identified by `parentProductId` and `parentProductName`) can have many rows (variants). `slug` is the unique URL segment per variant; `parentProductId` groups variants together. `sortOrder` controls display ordering. `isHero` marks homepage-featured variants.
- `orders` / `orderItems` — order and fulfillment state. `orders.status` values: `pending`, `paid`, `shipped`, `fulfilled`. `orders.fulfillmentStatus` defaults to `unfulfilled`.
- `carts` / `cartItems` — pre-order shopping carts. `carts.email` is unique and normalized before insert. `carts.status` values: `active`, `converted`, `abandoned`. `cartItems` has a unique constraint on `(cartId, productId)`.

`src/db/schema.ts` is the Drizzle schema. `src/db/index.ts` exports `createDb(env)`.

### Server utilities (`src/lib/`)

All files in `src/lib/` use the `"use server"` directive and run server-side only.

- `cloudflare.ts` — Cloudflare binding accessors (see above)
- `catalog.ts` — product queries for storefront and admin
- `orders.ts` — order summary queries for the admin
- `admin-auth.ts` — password-based admin sessions (env vars `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`). Session cookie: `lashmealex_admin_session` (httpOnly, 12-hour maxAge). Token is a SHA-256 hash of `password:secret`.
- `money.ts` — cent-to-display formatting: `centsToDollars(cents)` → number, `formatUsdFromCents(cents)` → USD string
- `cart.ts` — cart data operations (create, fetch, update, merge carts)
- `cart-constants.ts` — cart configuration and validation constants

### Client state

`src/context/CartContext.tsx` — React context providing in-memory cart state. Cart ID is persisted in `localStorage` (`lashmealex_cart_id`). Wrap any component that calls `useCart()` inside `CartProvider` (already done at root layout level).

**Cart initialization flow:**
1. Items added before user enters email are tracked in `pendingItemsRef`.
2. When `startCart` is called (user submits email/phone), pending items are flushed to the server via `flushPendingToServer`.
3. If the email already has an existing cart, the user can "resume" (merge) or "replace" it.

### Server actions

- `src/app/admin/actions.ts` — admin product, order, and cart mutations. All actions call `requireAdmin()` first (redirects to `/admin/login` if unauthenticated).
- `src/app/cart/actions.ts` — customer-facing cart mutations.

### Routing

App Router layout with two surfaces:
- **Storefront**: `/`, `/shop`, `/products/[slug]`, `/wishlist`
- **Admin**: `/admin` (dashboard), `/admin/login`, `/admin/products/[slug]`, `/admin/carts`, `/admin/carts/[id]`

Each product/shop page is split into a server component (data fetching) and a `*Client.tsx` client component (interactivity). Example: `src/app/shop/page.tsx` + `src/app/shop/ShopClient.tsx`.

Product images are served through `src/app/images/[...key]/route.ts`, which streams from the R2 bucket with `Cache-Control: public, max-age=31536000, immutable`. This keeps image URLs coupled to the app, not to the Cloudflare dashboard.

### Fonts

`--font-sans` → Plus Jakarta Sans, `--font-display` → Cormorant Garamond. Both are CSS variables set on `<html>` in `src/app/layout.tsx`.

### Styling

Tailwind CSS v4 with PostCSS. Global styles in `src/app/globals.css`. Component-level animation uses Framer Motion.

Key design tokens (defined in `tailwind.config.js`):
- Colors: `pink` (#d46a8c), `rose-gold` (#d9b09f)
- Border radius: `0px` by default (sharp corners everywhere), except `full`
- Custom animations: `loading`, `fade-in`, `slide-up`
- Z-index scale: modals > dropdowns > tooltips

### Key conventions

- Use `revalidatePath()` after any server action that mutates data to clear Next.js cache.
- Product slugs at variant level are unique; the parent product URL is derived from `parentProductId` (underscores replaced with hyphens).
- Use `clsx` for conditional class names in components.
- Never store prices as floats; always use integers (cents).
- Email addresses are normalized (lowercased, trimmed) before storage and lookups.
