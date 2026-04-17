# Admin Dashboard Redesign Prompt

Pass this entire file back to Claude Code to execute the redesign.

---

## Goal

Redesign the two admin UI files to look like a professional, easy-to-use CMS for someone who is a lash tech (not technical). Keep all existing server actions and data-fetching logic exactly as-is — only change the JSX/UI layer.

**Files to edit:**
- `src/app/admin/page.tsx` — main dashboard
- `src/app/admin/products/[slug]/page.tsx` — product editor

**Do not touch:**
- `src/app/admin/actions.ts`
- `src/lib/catalog.ts`
- `src/lib/orders.ts`
- `src/lib/admin-auth.ts`
- `src/db/schema.ts`

---

## Design rules

- Keep the existing Tailwind CSS classes and CSS variables (`text-foreground`, `text-muted`, `text-pink-dark`, `bg-background`, `border-foreground`, `border-line`, `btn-primary`, `btn-secondary`, `font-display`)
- Use `bg-[#faf9f7]` for the page background and `bg-[#f0ede8]` for image placeholder areas
- Use `bg-[#f5f3f0]` for subtle form sections
- Color-coded status badges using Tailwind: green for active/paid/fulfilled, amber for pending, blue for ready_for_pickup, slate for hidden/unfulfilled, red for cancelled
- Add `$` prefix spans inside price inputs (use `relative` wrapper + `absolute` span + `pl-7` on the input)
- All inline SVG icons — no icon libraries
- No comments in the code

---

## Changes to `src/app/admin/page.tsx`

### 1. Sticky top navigation bar

Replace the current header card with a `<nav>` that is `sticky top-0 z-50 border-b border-foreground bg-white`. Inside:
- Left: "Lashmealex" in `font-display text-lg` + "Admin" label in `text-[9px] font-bold uppercase tracking-[0.35em] text-pink-dark` below it
- Center (hidden on mobile): anchor links `href="#products"` and `href="#orders"` styled as `text-[10px] font-bold uppercase tracking-[0.2em] text-muted hover:text-foreground`
- Right: "View Storefront ↗" link (hidden on mobile) + Sign Out form button styled as `border border-foreground px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em]`

### 2. Page header

Below the nav, inside the main content div, add a simple page header (no border card):
```
text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark → "Dashboard"
font-display text-5xl tracking-tighter → "Your Shop"
text-sm text-muted → "Manage your lash catalog and track orders. Any changes you make here show up on the storefront immediately."
```

### 3. Stats cards

Keep the same 5 stats in a `xl:grid-cols-5` grid. For each card, add a small helper line under the big number in `text-[10px] text-muted`:
- "Active Variants" → rename label to "Products Listed", helper: "active on storefront"
- "Inventory On Hand" → rename to "Items in Stock", helper: "trays available"
- "Inventory Value" → rename to "Stock Value", helper: "at retail price"
- "Paid Sales" → rename to "Revenue Collected", helper: "from paid orders"
- "Units Sold" → keep label, helper: "items purchased"

### 4. Products section

Add `id="products"` and `scroll-mt-20` to the section. Add a product count `<p className="text-xs text-muted">` beside the section header showing `{productGroups.length} product(s)`.

**Replace the product list rows with image cards:**

Use a `grid gap-5 sm:grid-cols-2 xl:grid-cols-3` grid. Each card is `flex flex-col border border-foreground bg-white`:

- **Image area** `relative aspect-square w-full overflow-hidden bg-[#f0ede8]`:
  - If `product.image` exists: `<img>` tag with `h-full w-full object-cover` (suppress next/image lint warning with `{/* eslint-disable-next-line @next/next/no-img-element */}`)
  - If no image: centered SVG placeholder (a simple rectangle + circle + path photo icon at 36x36, opacity 30%, color text-muted)
  - Status badges overlaid `absolute left-3 top-3 flex flex-wrap gap-1.5`:
    - Active/Hidden badge: emerald (active) or slate (hidden)
    - Featured badge: pink if `product.isFeatured`

- **Card body** `flex flex-1 flex-col p-5`:
  - `font-display text-xl` product name
  - `text-[10px] font-bold uppercase tracking-[0.2em] text-muted` for category
  - `line-clamp-2 text-xs text-muted` description
  - `flex items-center gap-4 border-t border-[#e8e5e0] pt-4 text-xs text-muted` row: variant count + "·" + stock count
  - Full-width "Manage Product" link button: `block w-full border border-foreground px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-white`

**Redesign the Create Product form:**

Wrap in `border border-foreground bg-white` div. Add a header section `border-b border-foreground px-6 py-5` with "New Product" in pink-dark + "Add a Product" in `font-display text-2xl` + a short helper sentence.

Form body `p-6` with `grid gap-6 md:grid-cols-2 xl:grid-cols-3`:

Column 1 — "Basic Info":
- Product Name (required, placeholder: "e.g. Classic Faux Mink Lashes")
- Description (textarea, 4 rows, placeholder: "Describe this product for customers…")
- Category (default: "Lashes")

Column 2 — "First Variation":
- Variation Name (required, placeholder: "e.g. CC Curl 0.03")
- Price (required, with `$` prefix span)
- Compare-At Price (optional label note in normal case)

Column 3 — "Inventory & Visibility":
- Starting Inventory (required)
- Product Image (file input)
- Checkbox group in `bg-[#f5f3f0] border border-[#e5e2dd] p-4`:
  - "Show on storefront — customers can see and buy this" (defaultChecked)
  - "Feature on homepage — highlights this product" (defaultChecked)
- "Create Product →" submit button (`btn-primary w-full`)

### 5. Orders section

Add `id="orders"` and `scroll-mt-20`. Add order count beside the section header.

Empty state: centered text with `font-display text-2xl` "No orders yet" + helper text.

**Replace order rows** with cleaner cards `border border-foreground bg-white`. Inside each card, a `grid gap-4 p-5 sm:grid-cols-[1fr_160px_160px_auto] sm:items-center`:

Column 1 — Customer info:
- Customer name (or email if no name) in `text-sm font-semibold text-foreground`
- Email below name in `text-[11px] text-muted` (if name exists)
- Date in `text-xs text-muted`
- Total in `font-display text-lg text-foreground`
- Status badge row `flex flex-wrap gap-1.5 mt-2.5`: show current payment status badge + fulfillment status badge (read-only colored badges, distinct from the dropdowns)

Column 2 — Payment select (label: "Payment", select with Pending/Paid/Cancelled)
Column 3 — Fulfillment select (label: "Fulfillment", select with Unfulfilled/Ready for Pickup/Fulfilled)
Column 4 — Save button: `border border-foreground px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-white`

**Badge color maps** (add as module-level const objects before the component):
```
paymentStyle: pending → amber, paid → emerald, cancelled → red
fulfillmentStyle: unfulfilled → slate, ready_for_pickup → blue, fulfilled → emerald
```

---

## Changes to `src/app/admin/products/[slug]/page.tsx`

### 1. Sticky top navigation bar

Same nav as dashboard: "Lashmealex" + "Admin" on left. But center becomes a breadcrumb:
`← Dashboard / {product.name}`
- Back arrow link styled `flex items-center gap-2 text-muted hover:text-foreground` with an inline SVG back-arrow (M19 12H5M12 19l-7-7 7-7)
- Slash separator
- Product name in `text-xs font-semibold uppercase tracking-[0.15em] text-foreground`

Right: Sign Out form button only.

### 2. Product hero header

Replace the current header card with `border border-foreground bg-white p-8`:

Left side:
- Badge row `flex flex-wrap items-center gap-2 mb-3`: category badge (border-foreground text-muted) + Hero badge (pink, only if `product.isHero`)
- `font-display text-5xl tracking-tighter text-foreground` — product name
- `text-sm text-muted max-w-2xl` — description

Right side (shrink-0): three small stat boxes (`border border-foreground bg-[#faf9f7] px-4 py-3 text-center`) for:
- Variants count
- Total inventory ("In Stock")
- Inventory value in `font-display text-2xl` with `text-[9px] font-bold uppercase tracking-[0.2em] text-muted` label below

Layout: `flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between`

### 3. Details + Actions layout

Two columns `grid gap-6 xl:grid-cols-[1fr_320px]`:

**Left — Product Details form** (`border border-foreground bg-white p-6 space-y-5`):
- Pink-dark label "Product Details" + `font-display text-2xl` "Shared Info" + helper text "These details apply to all variations of this product."
- Two-column grid `sm:grid-cols-2` for Product Name + Category inputs
- Full-width Description textarea (5 rows)
- Full-width Default Image URL input
- Footer row `flex items-center justify-between pt-2`: slug path text in `text-[10px] text-muted` on left + "Save Details" `btn-secondary` on right

**Right — Actions sidebar** (two separate bordered cards stacked):

Card 1 — "Product Image" (`border border-foreground bg-white p-5 space-y-4`):
- Pink-dark label "Product Image" + helper text "Upload an image that applies to all variants"
- If `product.image` exists: show image preview `aspect-square w-full overflow-hidden border border-line bg-[#f5f3f0]` with `<img>` tag
- File input + "Upload Image" `btn-secondary w-full`

Card 2 — "Actions" (`border border-foreground bg-white p-5 space-y-4`):
- Pink-dark label "Actions"
- Set as Hero form/button (same logic as before but styled `w-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.15em] border`)
- Helper text below if not hero: "Highlights this product on your homepage" in `text-[10px] text-muted text-center`
- Delete Product form/button styled with red-200 border + red-600 text, hover:bg-red-600 hover:text-white
- Helper text below delete: "This will remove all variants too" in `text-[10px] text-muted text-center`

### 4. Variants section

Add `flex items-end justify-between` header with pink-dark label + `font-display text-4xl` title on left and variant count on right.

**Each variant card** `border border-foreground bg-white`:

**Card header** `flex items-center justify-between border-b px-5 py-3.5` (use `bg-[#faf9f7]` if inactive, white if active):
- Left: variant name in `font-display text-xl` + status badge (Active/Hidden, emerald/slate) + Featured badge (pink, if featured)
- Right: price in `font-display text-lg` + inventory count in `text-[10px] text-muted` below

**Card form** `p-5` (same hidden inputs as before):

Four-column grid `grid gap-5 sm:grid-cols-2 xl:grid-cols-4`:

Column 1 — "Identity":
- Section label `text-[10px] font-bold uppercase tracking-[0.25em] text-muted`
- Variant Name input
- Category input
- Sort Order input

Column 2 — "Pricing & Stock":
- Section label
- Price input with `$` prefix
- Compare-At Price input with `$` prefix
- Inventory input

Column 3 — "Content":
- Section label
- Description textarea (4 rows, resize-none)
- Image URL input

Column 4 — "Visibility":
- Section label
- Checkbox group in `bg-[#f5f3f0] border border-[#e5e2dd] p-3 space-y-2.5`:
  - "Active on storefront" (bold label)
  - "Featured on homepage" (bold label)
- Variant image sub-panel `border border-[#e5e2dd] bg-[#f5f3f0] p-3 space-y-2`:
  - "Variant Image" label
  - If `variant.imageUrl`: image preview `aspect-square w-full overflow-hidden bg-white border border-line` with `<img>` tag
  - File input
  - "Upload Image" button: `w-full border border-foreground px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-foreground hover:text-white`
- Updated date in `text-[10px] text-muted`

**Card footer** `mt-5 flex items-center justify-between border-t border-[#e5e2dd] pt-4`:
- Left: slug in `text-[10px] text-muted`
- Right: two buttons:
  - Delete: `border border-red-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600` with `formAction={deleteVariantAction}`
  - Save Variant: `border border-foreground bg-foreground px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-transparent hover:text-foreground`

### 5. Add Variant form

Move this section to be BELOW the variants list (currently it's above). Wrap in `border border-foreground bg-white`:
- Header `border-b border-foreground px-5 py-4`: pink-dark "Add Variation" + `font-display text-2xl` "New Variant"
- Form body `p-5` with `grid gap-4 sm:grid-cols-2 xl:grid-cols-4`:
  - Variant Name (required, placeholder: "e.g. 0.03 CC 10-15mm")
  - Price (required, with `$` prefix)
  - Compare-At (optional, with `$` prefix)
  - Inventory (required, default 0)
- Checkbox + sort order row below grid: `flex flex-wrap items-center gap-5 mt-4`
  - "Active on storefront" checkbox (defaultChecked)
  - "Featured on homepage" checkbox
  - Sort Order input (small, w-16) with inline label
  - "Add Variant →" `btn-primary ml-auto`

---

## Notes

- The `formatDate` helper function is the same in both files — keep it.
- Compute `inventoryValue` in the product editor as `product.variants.reduce((sum, v) => sum + v.inventory * v.price, 0)` and pass to `formatUsdFromCents`.
- Use `// eslint-disable-next-line @next/next/no-img-element` before any `<img>` tags.
- Keep `export const dynamic = 'force-dynamic'` at the top of each file.
- Keep all hidden inputs exactly as they are (productId, slug, parentProductId, etc.).
- The `formAction` attribute on Delete buttons and Upload Image buttons must be preserved exactly.
