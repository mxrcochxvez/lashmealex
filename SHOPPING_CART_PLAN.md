# Shopping Cart Plan

Persistent, identified shopping carts for the storefront, with visibility in the admin dashboard. Carts are identified by `cartId` (stored in `localStorage`) and keyed by `email` in the DB so they can be recovered if the client loses the id.

---

## 1. Data Model

### New tables (D1 / Drizzle)

**`carts`**
| column | type | notes |
|---|---|---|
| `id` | `text` PK | nanoid, generated server-side |
| `email` | `text NOT NULL UNIQUE` | the recovery key |
| `phone` | `text NOT NULL` | stored as submitted; we light-validate format |
| `name` | `text NOT NULL` | |
| `status` | `text NOT NULL DEFAULT 'active'` | `active` / `converted` / `abandoned` — gives the admin a filter later |
| `notes` | `text` | admin-only freeform notes |
| `createdAt` | `integer` (unix ms) | |
| `updatedAt` | `integer` | |
| `lastActiveAt` | `integer` | bumped on every add/update so the admin can see recency |

**`cartItems`**
| column | type | notes |
|---|---|---|
| `id` | `text` PK | nanoid |
| `cartId` | `text NOT NULL` | FK → `carts.id`, `ON DELETE CASCADE` |
| `productId` | `integer NOT NULL` | FK → `products.id` — this is the **variant** id in the current schema |
| `quantity` | `integer NOT NULL` | |
| `createdAt` / `updatedAt` | `integer` | |
| `UNIQUE(cartId, productId)` | | one row per variant per cart — adding an existing variant increments quantity |

Migration file: `drizzle/migrations/XXXX_add_carts.sql` generated via `drizzle-kit`.

Schema change: edit `src/db/schema.ts`.

### Why `UNIQUE(email)` on carts
The spec says re-entering an email should recover the existing cart. Enforcing uniqueness at the DB level makes the recovery flow deterministic and avoids race conditions.

### Why cascade delete on `cartItems`
Simpler admin delete + simpler "start over" semantics.

---

## 2. Server Layer

### `src/lib/cart.ts` (new)

Query/mutation helpers that use `getDb()`:

- `getCartWithItems(cartId)` — returns cart + joined items with variant snapshots (name, price, image, inventory) for UI
- `findCartByEmail(email)` — for the recovery flow
- `createCart({ email, phone, name })` — generates `nanoid`, inserts, returns cart
- `upsertCartItem(cartId, productId, quantity)` — insert or increment; respects a variant inventory cap if you want
- `setCartItemQuantity(cartId, productId, quantity)` — absolute set; `0` deletes
- `removeCartItem(cartId, productId)`
- `clearCart(cartId)` — deletes all `cartItems` rows for that cart (preserves the cart record so the email mapping stays)
- `replaceCartItems(cartId, items[])` — transactional: clear then insert
- `mergeCartItems(cartId, incomingItems[])` — additive: upserts each item, summing quantities
- `touchCart(cartId)` — bumps `updatedAt` + `lastActiveAt`

### `src/lib/cart-pricing.ts` (optional split)

Price/total calc helpers so both client drawer and admin page agree. In cents, mirroring existing `money.ts` conventions.

### Admin-side helpers in `src/lib/cart.ts`

- `listAdminCarts({ status?, search? })` — newest first, with item count + computed subtotal
- `getAdminCartStats()` — active cart count, total cart value, abandoned carts (no activity > 7 days)

### Server Actions: `src/app/cart/actions.ts` (new)

All cart mutations are Server Actions called from client components (so UI can call them directly and we still validate/authorize server-side).

- `startCartAction(formData)` — reads `email`, `phone`, `name`; returns `{ cartId }` on create, OR `{ conflict: 'existing', existingCartId, itemCount }` when email already has a cart and the client hasn't declared intent
- `resolveCartConflictAction(formData)` — reads `{ existingCartId, intent: 'resume' | 'replace', pendingItems? }` where `pendingItems` is whatever was in the client's temporary in-memory cart prior to recovery. `resume` merges `pendingItems` into the existing cart; `replace` clears existing items and then inserts `pendingItems`. Returns `{ cartId }`
- `addCartItemAction(formData)` — `{ cartId, productId, quantity }`, calls `upsertCartItem`
- `updateCartItemAction(formData)` — `{ cartId, productId, quantity }`, calls `setCartItemQuantity`
- `removeCartItemAction(formData)` — `{ cartId, productId }`
- `clearCartAction(formData)` — `{ cartId }`
- `getCartAction(cartId)` — returns full cart payload (used for hydration on page load)

### Admin Server Actions: add to `src/app/admin/actions.ts`

- `adminClearCartAction({ cartId })`
- `adminDeleteCartAction({ cartId })`
- `adminUpdateCartStatusAction({ cartId, status })`
- `adminUpdateCartNotesAction({ cartId, notes })`

All gated by `requireAdmin()`.

### Validation

- Email: simple regex + lowercase/trim before insert
- Phone: strip non-digits, require 10 digits (US) — store normalized
- Name: trim, 1–80 chars
- Quantity: integer ≥ 0
- ProductId must exist and `isActive` when adding (skip the check in admin ops)
- Wrap each action's body in try/catch and return `{ error: string }` on failure so the client drawer can show inline errors

---

## 3. Client Layer (Storefront)

### Updated `src/context/CartContext.tsx`

State split into three concerns:

1. **Identity** — `cartId: string | null`, `details: { email, name, phone } | null`
2. **Items** — same shape as today, but synced from server
3. **Drawer** — `isOpen` unchanged

Behavior:

- On mount: read `localStorage.getItem('lashmealex_cart_id')`. If present, call `getCartAction(cartId)`:
  - `200` → populate items + details
  - `404` / missing → clear `localStorage`, treat as no cart
- All mutations:
  - If `cartId` exists: optimistic local update → call server action → reconcile on response → rollback on error
  - If `cartId` is null: buffer the add into a `pendingItems` array in context and open the `CartStartModal`
- Expose a `startCart({ email, phone, name })` helper that calls `startCartAction`, handles the conflict case, and persists the returned `cartId` to `localStorage`

Storage key: `lashmealex_cart_id` (constant in `src/lib/cart-constants.ts`).

### New component: `src/components/CartStartModal.tsx`

Shown when the user tries to add their first item without a `cartId`. Required fields:

- Email
- Phone
- Name

Submit → `startCartAction`. Two response shapes:

1. **Created** → store `cartId`, flush `pendingItems` into the cart via `addCartItemAction` calls (or a single batch `mergeCartItemsAction` — see open question), close modal, open drawer
2. **Conflict** → modal swaps into the recovery view (below) without closing

### New inline view: `CartRecoveryPrompt` (inside `CartStartModal`)

When `startCartAction` returns `{ conflict: 'existing', existingCartId, itemCount }`:

```
You already have a cart with N items. What would you like to do?

[ Resume my previous cart ]   ← primary, calls resolveCartConflictAction with intent='resume' + pendingItems
[ Start over ]                ← secondary, calls with intent='replace' + pendingItems
```

Both paths set the returned `cartId` into `localStorage` and populate the context.

### Drawer + Add-to-Cart buttons

- `Add to Cart` click: if `cartId` → call `addCartItemAction`; else push into `pendingItems` and open `CartStartModal`
- Quantity +/- and remove: call respective server actions, optimistic update
- New small section at the top of the drawer showing the customer's name + email (once a cart is active) with a "Not you? Sign out" link that clears `localStorage` and resets context

### Error handling

- A single `cartError` state in context, surfaced as a toast-style message inside the drawer
- Out-of-stock / inventory-exceeded errors shown inline on the line item

---

## 4. Admin Dashboard Additions

### New page: `src/app/admin/carts/page.tsx`

Entry point from the dashboard. Lists carts.

**Header stats** (card strip, matches the existing dashboard style):
- Active carts (status = `active`)
- Total cart value (sum of active cart subtotals)
- Abandoned carts (active + `lastActiveAt` older than 7 days)

**Filters**
- Status pills: All / Active / Abandoned / Converted
- Search box (by email or name)

**Cart list** — one row per cart:
- Customer name + email + phone
- `itemCount` / subtotal
- Status badge (same color system used for orders)
- `lastActiveAt` relative time
- "View" link → `/admin/carts/[id]`

### New page: `src/app/admin/carts/[id]/page.tsx`

Single cart view:

- Customer block (name, email, phone, `createdAt`, `lastActiveAt`)
- Line items table: image, variant name, unit price, quantity, line total
- Subtotal
- Admin actions (server-action forms):
  - Update status (dropdown: active / abandoned / converted)
  - Notes textarea
  - `Clear Cart` (removes items, keeps cart record)
  - `Delete Cart` (destructive, red, confirmation via `confirm()` in a tiny client wrapper)

### Dashboard integration

On `src/app/admin/page.tsx`:
- Add a "Carts" link in the sticky topnav (between Products and Orders)
- Add an "Active Carts" stat card (fetched via `getAdminCartStats`)
- Optionally surface the 3 most recently updated carts in a small strip above Orders. _Open question below._

---

## 5. Flows

### First-time shopper
1. Browses shop, clicks **Add to Cart** on a variant
2. `cartId` is null → item is held in `pendingItems`, `CartStartModal` opens
3. Enters email / phone / name, submits
4. `startCartAction` creates the cart, returns `cartId`
5. Context flushes `pendingItems` into the DB, stores `cartId` in `localStorage`, opens the drawer

### Returning shopper, same device
1. Loads the site → `CartContext` mount effect finds `cartId` in `localStorage`
2. `getCartAction` returns the cart + items, context hydrates
3. Drawer shows items immediately; no prompts

### Returning shopper, new device / cleared storage (the recovery flow)
1. Clicks **Add to Cart** → `pendingItems` + `CartStartModal`
2. Enters email that already exists → `startCartAction` returns conflict
3. Recovery view shows: "You already have a cart with N items"
4. User picks **Resume** → `resolveCartConflictAction({ intent: 'resume', pendingItems })` merges the two
   Or **Start over** → `resolveCartConflictAction({ intent: 'replace', pendingItems })` purges the old items and inserts `pendingItems`
5. Returned `cartId` saved to `localStorage`, context hydrated, drawer opens

### "Not you?" / sign-out-of-cart
1. User clicks sign-out link in the drawer
2. `localStorage.removeItem('lashmealex_cart_id')`
3. Context resets to empty, drawer closes
4. Cart record stays in DB (still recoverable via email)

---

## 6. Edge Cases

- **`cartId` in storage but not in DB** (admin deleted, wiped): `getCartAction` returns 404 → context clears storage and treats as fresh
- **Variant deleted while in a cart**: cart item join returns null product → skip that row in the UI and surface a one-time warning
- **Variant goes inactive or out of stock**: show inline flag on the line item but don't auto-remove (admin can choose to)
- **User changes their email in the modal after a conflict**: re-run `startCartAction` fresh
- **Concurrent mutations from two tabs**: `UNIQUE(cartId, productId)` prevents duplicate rows; re-fetch cart after server responses
- **Very large `pendingItems` at recovery**: server action accepts an array; enforce a sane max (say 50)
- **Case-insensitive email match**: always lowercase + trim before insert and query
- **Admin editing a cart while user is active**: acceptable race; last write wins. Optionally bump a `version` int, but probably overkill for v1

---

## 7. Files Touched / Created

**Created**
- `drizzle/migrations/XXXX_add_carts.sql`
- `src/lib/cart.ts`
- `src/lib/cart-constants.ts`
- `src/app/cart/actions.ts`
- `src/components/CartStartModal.tsx`
- `src/components/CartRecoveryPrompt.tsx` (or inlined into the modal)
- `src/app/admin/carts/page.tsx`
- `src/app/admin/carts/[id]/page.tsx`

**Edited**
- `src/db/schema.ts` — add `carts`, `cartItems`
- `src/db/index.ts` — export new tables if needed
- `src/context/CartContext.tsx` — persistence + server sync
- `src/components/CartDrawer.tsx` — show identity block, wire to new actions, error UI
- `src/components/AddToCartButton.tsx` (or wherever) — open modal when `cartId` is null
- `src/app/admin/page.tsx` — topnav link, stat card, recent carts strip
- `src/app/admin/actions.ts` — admin cart actions

---

## 8. Build / Deploy Steps

1. Implement schema + generate migration
2. Run `pnpm db:migrate:local`, verify with seed data
3. Build server layer (`cart.ts`, actions)
4. Build client layer (context, modal, drawer updates)
5. Build admin pages
6. Run `pnpm typecheck` and `pnpm lint`
7. `pnpm preview` — manual smoke test on local Cloudflare runtime
8. `pnpm db:migrate:remote` on prod D1
9. `pnpm deploy`

---

## 9. Open Questions (please confirm before I start)

1. **Email uniqueness**: is `UNIQUE(email)` on `carts` acceptable? (It's what makes the "re-enter email" recovery flow work cleanly. Alternative: allow duplicates, always pick the most recent.)
2. **Identity collection timing**: collect email/phone/name on first **Add to Cart** click (plan above), or on drawer-open, or at checkout? Spec sounds like on first add — confirming.
3. **Cart expiry / cleanup**: do you want a background job to mark carts abandoned after N days? (Not needed for v1 — we can just compute it in the admin query.)
4. **Stock enforcement**: should `addCartItemAction` reject when inventory is insufficient, or allow it and warn? (Default: allow, warn in UI.)
5. **Dashboard "recent carts" strip**: include on the main dashboard, or keep carts on their own page?
6. **Anti-abuse**: anyone who knows an email could enter it and "resume" someone else's cart. For a lash-tech DTC shop this is probably fine and matches typical SMB UX. Flagging it anyway — no fix planned for v1.

Once you confirm, I'll execute in the order listed in §8.
