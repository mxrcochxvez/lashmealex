# Payment Integration Plan

## Current State

- Cart system is fully built (create, add items, persist, merge)
- `orders` / `orderItems` tables exist and are ready
- `stripe` SDK (`^22.0.1`) is installed but completely unused
- The "Checkout Now" button in `Cart.tsx` is a stub — it waits 1 second then closes the drawer
- No Stripe keys in `wrangler.toml`, no API routes, no webhook handler

## Business Context

Pickup-only (Fresno salon). No shipping calculation needed. Flow is:
**Cart → Payment → Order confirmed → Admin marks ready for pickup**

---

## Phase 1 — Order Creation (no payment yet)

Goal: wire the checkout button to actually create an order in the database.

**`src/lib/orders.ts`** — add `createOrderFromCart(cartId)`:
- Load cart + items from DB
- Validate each item is still active and has enough inventory
- Insert into `orders` (status: `pending`, fulfillmentStatus: `unfulfilled`)
- Insert into `orderItems` (snapshot price at purchase time)
- Decrement `products.inventory` for each item
- Set `carts.status` → `converted`
- Return the new `orderId`

**`src/app/checkout/actions.ts`** — new server action `checkoutAction(cartId)`:
- Calls `createOrderFromCart`
- Calls `revalidatePath('/admin')` to refresh admin view
- Returns `{ orderId }` or throws on validation failure

**`src/components/Cart.tsx`** — replace the stub `handleCheckout`:
- Call `checkoutAction(cartId)`
- On success: close cart, clear local cart state, show confirmation

Deliverable: clicking "Checkout Now" creates a real order in D1.

---

## Phase 2 — Stripe Payment

Goal: collect payment before the order is confirmed.

### Environment setup

Add to `wrangler.toml` vars section:
```toml
[vars]
STRIPE_SECRET_KEY = ""       # fill in Cloudflare dashboard / .dev.vars
STRIPE_PUBLISHABLE_KEY = ""
STRIPE_WEBHOOK_SECRET = ""
```

Add `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` as secrets in the Cloudflare dashboard for production.

Add a `.dev.vars` file locally (gitignored) for dev:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### API route — create Payment Intent

**`src/app/api/checkout/route.ts`** (`POST`):
- Accepts `{ cartId }`
- Loads cart subtotal from DB
- Creates a Stripe `PaymentIntent` for the subtotal amount
- Returns `{ clientSecret, paymentIntentId }`

### Checkout UI

Two options — pick one:

**Option A (simpler): Stripe Checkout (hosted page)**
- Server creates a `checkout.Session` with line items
- Redirect customer to Stripe's hosted page
- On success, Stripe redirects to `/checkout/success?session_id=...`
- Success page verifies session and creates the order

**Option B (custom): Stripe Elements (in-app)**
- Add a `/checkout` page or modal with Stripe Elements embedded
- Customer enters card details without leaving the site
- On `paymentIntent.succeeded` client event, call `checkoutAction`

Recommendation: **Option A** first — less code, PCI-compliant out of the box, faster to ship.

### Webhook handler

**`src/app/api/webhooks/stripe/route.ts`** (`POST`):
- Verify signature using `stripe.webhooks.constructEvent` + `STRIPE_WEBHOOK_SECRET`
- Handle `checkout.session.completed` (Option A) or `payment_intent.succeeded` (Option B):
  - Find order by `metadata.cartId` or `metadata.orderId`
  - Set `orders.status` → `paid`
  - Revalidate `/admin`

**Important:** Cloudflare Workers runs on the edge — use `stripe.webhooks.constructEventAsync` (the async variant) instead of the sync version, which requires Node.js crypto.

---

## Phase 3 — Confirmation & Admin Polish

- **Order confirmation screen**: after successful payment, show order summary to customer (order ID, items, total, pickup info)
- **Admin pickup flow**: "Ready for Pickup" button already exists in the admin orders UI — no changes needed
- **Email notification** (optional, future): send customer a confirmation email via Resend or Cloudflare Email Workers when order status becomes `paid`

---

## File Checklist

| File | Change |
|------|--------|
| `src/lib/orders.ts` | Add `createOrderFromCart()` |
| `src/app/checkout/actions.ts` | New — `checkoutAction` server action |
| `src/app/api/checkout/route.ts` | New — create Stripe PaymentIntent or Checkout Session |
| `src/app/api/webhooks/stripe/route.ts` | New — webhook handler |
| `src/app/checkout/success/page.tsx` | New — order confirmation page (Option A) |
| `src/components/Cart.tsx` | Replace stub `handleCheckout` |
| `wrangler.toml` | Add Stripe env var placeholders |
| `.dev.vars` | Local Stripe test keys (gitignored) |
| `.gitignore` | Ensure `.dev.vars` is ignored |

---

## Order of Work

1. Phase 1 — order creation (no payment), get the DB wiring right
2. Stripe keys + `wrangler.toml` setup
3. Stripe Checkout Session route + success page
4. Webhook handler
5. Wire `Cart.tsx` checkout button to the full flow
6. Test end-to-end with Stripe test cards
