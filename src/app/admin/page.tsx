import Link from 'next/link';

import { createProductAction, logoutAction, updateOrderAction } from './actions';
import { requireAdmin } from '@/lib/admin-auth';
import { getAdminCatalogStats, listAdminProductGroups } from '@/lib/catalog';
import { formatUsdFromCents } from '@/lib/money';
import { getAdminOrderStats, listAdminOrders } from '@/lib/orders';

export const dynamic = 'force-dynamic';

function formatDate(value: Date | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value);
}

export default async function AdminPage() {
  await requireAdmin();

  const [productGroups, catalogStats, orders, orderStats] = await Promise.all([
    listAdminProductGroups(),
    getAdminCatalogStats(),
    listAdminOrders(),
    getAdminOrderStats(),
  ]);

  return (
    <div className="min-h-screen bg-background px-6 py-12 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="flex flex-col gap-6 border border-foreground bg-white p-8 sm:flex-row sm:items-end sm:justify-between sm:p-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
              Owner Dashboard
            </p>
            <h1 className="mt-5 font-display text-5xl tracking-tighter text-foreground">
              Inventory + Orders
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
              Manage your catalog, pricing, and inventory from one place. Each lash variant is its
              own storefront record, so what you update here is what customers see.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/" className="btn-secondary">
              View Storefront
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="btn-primary">
                Sign Out
              </button>
            </form>
          </div>
        </div>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <div className="border border-foreground bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Active Variants</p>
            <p className="mt-5 font-display text-4xl text-foreground">{catalogStats.activeVariants}</p>
          </div>
          <div className="border border-foreground bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Inventory On Hand</p>
            <p className="mt-5 font-display text-4xl text-foreground">{catalogStats.totalInventory}</p>
          </div>
          <div className="border border-foreground bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Inventory Value</p>
            <p className="mt-5 font-display text-4xl text-foreground">
              {formatUsdFromCents(catalogStats.inventoryValue)}
            </p>
          </div>
          <div className="border border-foreground bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Paid Sales</p>
            <p className="mt-5 font-display text-4xl text-foreground">
              {formatUsdFromCents(orderStats.grossSales)}
            </p>
          </div>
          <div className="border border-foreground bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Units Sold</p>
            <p className="mt-5 font-display text-4xl text-foreground">{orderStats.unitsSold}</p>
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">Catalog</p>
            <h2 className="mt-4 font-display text-4xl tracking-tighter text-foreground">
              Products
            </h2>
          </div>

          <form
            action={createProductAction}
            className="grid gap-5 border border-foreground bg-white p-6 lg:grid-cols-[1.2fr_1fr_1fr]"
          >
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-dark">
                  Create Product
                </p>
                <p className="mt-3 max-w-xl text-sm text-muted">
                  Add a new parent product with its first variant. Shared product details can be
                  edited later from the dedicated product editor.
                </p>
              </div>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Product Name
                </span>
                <input
                  type="text"
                  name="productName"
                  required
                  className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Description
                </span>
                <textarea
                  name="description"
                  rows={5}
                  className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                />
              </label>
            </div>

            <div className="space-y-4">
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Category
                </span>
                <input
                  type="text"
                  name="category"
                  defaultValue="Lashes"
                  className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Product Image
                </span>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none file:mr-3 file:border-0 file:bg-foreground file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.2em] file:text-background"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  First Variant Name
                </span>
                <input
                  type="text"
                  name="initialVariantName"
                  required
                  placeholder="CC Curl 0.03"
                  className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                />
              </label>
            </div>

            <div className="space-y-4">
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Price
                </span>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                  className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Compare-At Price
                </span>
                <input
                  type="number"
                  name="compareAtPrice"
                  min="0"
                  step="0.01"
                  className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Starting Inventory
                </span>
                <input
                  type="number"
                  name="inventory"
                  min="0"
                  defaultValue="0"
                  required
                  className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                />
              </label>

              <div className="space-y-3 border border-line p-4">
                <label className="flex items-center gap-3 text-sm text-foreground">
                  <input type="checkbox" name="isActive" defaultChecked />
                  Active on storefront
                </label>
                <label className="flex items-center gap-3 text-sm text-foreground">
                  <input type="checkbox" name="isFeatured" defaultChecked />
                  Featured on homepage
                </label>
              </div>

              <button type="submit" className="btn-primary w-full">
                Create Product
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {productGroups.map((product) => (
              <div
                key={product.id}
                className="grid gap-5 border border-foreground bg-white p-6 lg:grid-cols-[2fr_1fr_auto]"
              >
                <div>
                  <p className="font-display text-2xl text-foreground">{product.name}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                    {product.variantCount} variants
                  </p>
                  <p className="mt-3 max-w-2xl text-sm text-muted">{product.description}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Category</p>
                  <p className="text-sm text-foreground">{product.category}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Inventory</p>
                  <p className="text-sm text-foreground">{product.totalInventory} trays</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Visibility</p>
                  <p className="text-sm text-foreground">
                    {product.hasActiveVariant ? 'Active' : 'Hidden'} · {product.isFeatured ? 'Featured' : 'Standard'}
                  </p>
                </div>

                <div className="flex items-end">
                  <Link href={`/admin/products/${product.slug}`} className="btn-secondary w-full text-center">
                    Edit Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">Orders</p>
            <h2 className="mt-4 font-display text-4xl tracking-tighter text-foreground">
              Sales Tracking
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="border border-dashed border-foreground bg-white p-10 text-sm text-muted">
              No orders have been recorded yet. Once checkout is live, this table will track
              payments, fulfillment status, and pickup readiness.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <form
                  key={order.id}
                  action={updateOrderAction}
                  className="grid gap-5 border border-foreground bg-white p-6 lg:grid-cols-[1.4fr_1fr_1fr_auto]"
                >
                  <input type="hidden" name="orderId" value={order.id} />

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                      {order.customerEmail}
                    </p>
                    {order.customerName && (
                      <p className="mt-2 text-sm text-foreground">{order.customerName}</p>
                    )}
                    <p className="mt-2 text-sm text-muted">
                      {formatDate(order.createdAt)} · {formatUsdFromCents(order.total)}
                    </p>
                  </div>

                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                      Payment
                    </span>
                    <select
                      name="status"
                      defaultValue={order.status}
                      className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                      Fulfillment
                    </span>
                    <select
                      name="fulfillmentStatus"
                      defaultValue={order.fulfillmentStatus}
                      className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                    >
                      <option value="unfulfilled">Unfulfilled</option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="fulfilled">Fulfilled</option>
                    </select>
                  </label>

                  <div className="flex items-end">
                    <button type="submit" className="btn-secondary w-full">
                      Update
                    </button>
                  </div>
                </form>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
