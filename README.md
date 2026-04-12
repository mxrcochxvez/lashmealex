# Lashmealex

This repository is now a single Next.js storefront deployed on Cloudflare Workers, with product and order data stored in Cloudflare D1.

## Structure

- `src/`: storefront UI, product pages, and shared server utilities.
- `drizzle/`: D1 migration files.
- `seed.sql`: local and remote D1 seed data for the lash variant catalog.
- `wrangler.toml`: Cloudflare Worker and D1 binding configuration.

## Getting Started

Install dependencies:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Database

If your local D1 database still has the older flat schema, apply the migrations and reseed:

```bash
pnpm db:migrate:local
pnpm db:seed:local
```

For remote Cloudflare D1:

```bash
pnpm db:migrate:remote
pnpm db:seed:remote
```

## Verification

Run the main checks:

```bash
pnpm lint
pnpm typecheck
```

## Notes

- The catalog is modeled at the sellable variant level, so each lash variant has its own product card.
- Stripe is still deferred.
- The deprecated Medusa backend remains only as historical reference in `apps/.backend_deprecated`.
