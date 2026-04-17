# Lashmealex Project Context

Lashmealex is a high-performance, SEO-optimized e-commerce storefront for a beauty salon. Originally planned as a Next.js + Medusa monorepo, it has been migrated to a **single Next.js fullstack application** optimized for zero-cost deployment on **Cloudflare Workers**.

## Project Overview

- **Framework:** Next.js (App Router)
- **Runtime:** Cloudflare Workers / Pages (via `@opennextjs/cloudflare`)
- **Database:** Cloudflare D1 (SQLite) managed with **Drizzle ORM**
- **Storage:** Cloudflare R2 for product images
- **Styling:** Tailwind CSS v4, Framer Motion for animations
- **Architecture:** Simplified single-app structure. The legacy Medusa backend is preserved for reference in `apps/.backend_deprecated/`.
- **Key Features:** Variant-level product catalog, local pickup fulfillment, and SEO-first rendering.

## Core Mandates & Conventions

- **Database First:** All product and order data must be managed through Cloudflare D1. Use Drizzle for type-safe queries.
- **Cloudflare Native:** Prefer Cloudflare bindings (`env.DB`, `env.PRODUCT_IMAGES`) for infrastructure.
- **Surgical Changes:** When modifying the schema, always generate migrations via `drizzle-kit` and update `seed.sql`.
- **SEO & Performance:** Maintain high Lighthouse scores. Use Next.js Metadata API and structured JSON-LD data.
- **Styling:** Adhere to the brand palette:
  - Primary Pink: `#FF7BEF`
  - Dark Slate: `#2C2E32`
- **Product Model:** Products are modeled at the **sellable variant level**. Each record in the `products` table represents a unique variant (e.g., a specific lash style/length).

## Development Workflow

### Building and Running

- `pnpm dev`: Start Next.js development server with local bindings.
- `pnpm dev:remote`: Start Next.js development server with remote Cloudflare bindings (access real products in D1).
- `pnpm build`: Build the project for Cloudflare (using OpenNext).
- `pnpm preview`: Local preview of the worker build using Wrangler.
- `pnpm deploy`: Deploy the application to Cloudflare.

### Database Management

- `pnpm db:migrate:local`: Apply migrations to local D1.
- `pnpm db:seed:local`: Seed local D1 from `seed.sql`.
- `pnpm db:migrate:remote`: Apply migrations to production D1.
- `pnpm db:seed:remote`: Seed production D1 from `seed.sql`.

### Quality & Verification

- `pnpm lint`: Run ESLint across the codebase.
- `pnpm typecheck`: Run TypeScript compiler check.

## Key Directory Structure

- `src/app/`: Next.js App Router routes (Storefront & Admin).
- `src/db/`: Drizzle schema definitions and database client.
- `src/lib/`: Shared utilities (catalog, orders, cloudflare bindings).
- `drizzle/`: SQL migration files.
- `seed.sql`: Source of truth for initial product data.
- `wrangler.toml`: Cloudflare resource bindings and configuration.

## Roadmap & Status

- [x] Cloudflare D1/R2 Migration
- [x] Product Catalog Implementation
- [/] Owner Admin Panel (In Progress - `/admin`)
- [ ] Stripe Payment Integration (Pending)
- [ ] Checkout Flow (Pending)
