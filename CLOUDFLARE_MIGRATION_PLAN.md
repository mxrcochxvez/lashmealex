# Zero-Cost Cloudflare Tech Stack Migration Plan

Since the goal is to eliminate all server costs while keeping the fast edge-deployment of Cloudflare, we will pivot to a **Next.js Fullstack "Monolith"** architecture using entirely Cloudflare-native services.

Because you are already using Next.js for the Storefront, we don't actually need a separate backend service. We can build the API, database connectivity, and an admin panel directly into the Next.js codebase. When we deploy to Cloudflare Pages, Cloudflare handles both the frontend UI and the backend API routes on their edge workers for free.

## The New Architecture
- **Framework:** Next.js (Handling both UI and API)
- **Deployment:** Cloudflare Pages (Zero cost edge hosting)
- **Database:** Cloudflare D1 (Serverless SQLite database, very generous free tier)
- **Database ORM:** Drizzle ORM (Lightweight and works perfectly with Cloudflare D1)
- **Payments:** Stripe Checkout (Pay only per transaction)
- **Image Storage (Optional):** Cloudflare R2 (If you need to upload product images; generous free tier)

## Phase 1: Preparation & Cleanup (Completed)
1. **Remove Medusa:** Safely deprecated the `apps/backend` folder to `apps/.backend_deprecated`.
2. **Update Storefront Dependencies:** Installed `drizzle-orm`, `stripe`, and `@cloudflare/next-on-pages` into `apps/storefront`.

## Phase 2: Database Setup (Cloudflare D1) (Completed)
1. **Initialize Drizzle:** Set up the database schemas for our new custom e-commerce database (`products`, `orders`, `order_items`).
2. **Local Worker Setup:** Configured Cloudflare Wrangler locally (`wrangler.toml`).
3. **Database Migration:** Generated SQLite tables and executed a seed script to put initial product data into the D1 database.

## Phase 3: Stripe Integration (Pending)
1. **Stripe SDK Setup:** Configure the Stripe secret keys in our environment.
2. **Checkout API:** Create a Next.js Server Action (`POST /api/checkout`) that takes the user's cart, calculates the total from the D1 database securely (never trust frontend prices), and returns a Stripe Checkout URL.
3. **Webhook Handler:** Create `POST /api/webhooks/stripe` to listen for successful payments from Stripe and update the `orders` table in D1.

## Phase 4: Frontend Hookup & Admin Panel (Pending)
1. **Refactor Product Pages:** Update the homepage and individual product pages to fetch data directly from our new Drizzle/D1 interface rather than making HTTP requests to Medusa.
2. **Create Admin Dashboard:** Build a restricted route (e.g., `/admin`) inside Next.js protected by a simple password (or Cloudflare Access tunnel). This dashboard will let you add new products, edit stock, and view orders.

---

### Important Considerations:
Building a custom backend means we lose Medusa's advanced out-of-the-box features (like native multi-currency, complex tax calculators, and physical return flows). However, for a standard product-to-checkout flow, this architecture is blazingly fast, deeply customizable, and completely free to host.
