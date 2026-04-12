# Server Utilities

This directory contains server-side helpers shared by the storefront and admin surfaces.

## Modules

- `cloudflare.ts`: reads the active Cloudflare request context and returns the D1 client.
- `catalog.ts`: storefront and admin product queries.
- `orders.ts`: owner-facing order summary queries.
- `admin-auth.ts`: simple password-based admin session handling.
- `money.ts`: cent-to-USD formatting helpers.

## Environment

- `DB` must be bound in the Cloudflare Worker runtime.
- `ADMIN_PASSWORD` protects the `/admin` area.
- `ADMIN_SESSION_SECRET` signs the admin session cookie.
