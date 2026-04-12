# Zero-Cost Cloudflare Tech Stack Migration Plan

Since the goal is to eliminate all server costs while keeping fast edge deployment, this project is now using a **single Next.js fullstack app at the repository root** with Cloudflare-native infrastructure.

Because the site only needs one storefront plus an owner dashboard, we no longer need a separate backend service or a monorepo app split. The public storefront, owner admin UI, and future checkout logic all live in the same Next.js codebase and deploy together to Cloudflare Workers/Pages.

## The New Architecture
- **Framework:** Next.js app router
- **Deployment:** Cloudflare Pages / Workers runtime
- **Database:** Cloudflare D1
- **ORM:** Drizzle ORM
- **Admin Auth:** App-level password-protected `/admin` route for now
- **Payments:** Stripe Checkout later, not part of the current implementation scope

## Phase 1: Preparation & Cleanup (Completed)
1. **Remove Medusa from the active app path:** The Medusa backend was deprecated to `apps/.backend_deprecated`.
2. **Collapse the repo into one app:** The old `apps/storefront` structure was flattened so the active Next.js app now lives at the repository root.
3. **Keep Cloudflare-native dependencies in the root app:** Next.js, Drizzle, Wrangler, and Cloudflare bindings are all configured at the repo root.

## Phase 2: Database Setup (Cloudflare D1) (Completed)
1. **Initialize Drizzle:** The D1 schema is in place for `products`, `orders`, and `order_items`.
2. **Model the real catalog shape:** Instead of one flat product row, each lash variant is stored as its own sellable storefront record.
3. **Local Worker Setup:** Wrangler is configured at the repo root through `wrangler.toml`.
4. **Database Migration + Seed:** Migrations and `seed.sql` now rebuild the catalog around the 10 lash variants from the deprecated Medusa seed.

## Phase 3: Storefront Hookup (Completed)
1. **Replace Medusa fetches:** The homepage, shop page, product detail page, search, and quick-view flow now read from the D1-backed catalog instead of Medusa HTTP endpoints.
2. **Variant-level product cards:** Each lash variant now appears as its own product card and product detail page.
3. **Root app verification:** The flattened root app passes `pnpm typecheck` and `pnpm lint` with warnings only.

## Phase 4: Owner Admin Panel (In Progress)
1. **Protected owner login:** Add a password-protected `/admin/login` flow backed by a signed session cookie.
2. **Inventory management:** Add a dashboard to edit variant inventory, pricing, and storefront visibility directly in D1.
3. **Order tracking:** Add an order-management view to update payment and fulfillment status.

## Phase 5: Checkout + Payments (Pending)
1. **Stripe SDK Setup:** Configure Stripe secret keys and public configuration.
2. **Checkout API:** Create a secure checkout server action or route that recalculates totals from D1.
3. **Webhook Handler:** Persist successful payments back into the `orders` table and adjust fulfillment workflows.

## Local D1 Reminder

If your local D1 database still has the original flat schema, run:

```bash
pnpm db:migrate:local
pnpm db:seed:local
```

---

### Important Considerations:
Building a custom backend means we lose Medusa's advanced out-of-the-box features such as multi-currency, tax engines, and complex return flows. For this project, that tradeoff is acceptable because the catalog is small, the owner needs straightforward inventory and sales management, and the Cloudflare-native setup keeps hosting costs near zero.
