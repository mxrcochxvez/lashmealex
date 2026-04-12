# Database Layer

This directory defines the Cloudflare D1 schema for the storefront.

## Purpose

- `schema.ts` is the source of truth for Drizzle models.
- `index.ts` exposes the D1-backed Drizzle client used by server code.

## Current Model

- `products` stores each sellable storefront card as a variant-level record.
- `orders` stores order and fulfillment state.
- `order_items` stores the purchased variant rows for each order.

## Notes

- Prices are stored in cents.
- Inventory is tracked per variant row.
- The owner-facing admin UI reads and updates these tables directly.
