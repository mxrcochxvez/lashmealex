import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  createVariantAction,
  deleteProductAction,
  deleteVariantAction,
  logoutAction,
  setHeroProductAction,
  updateProductAction,
  updateVariantAction,
  uploadProductImageAction,
  uploadVariantImageAction,
} from '../../actions';
import { requireAdmin } from '@/lib/admin-auth';
import { formatUsdFromCents } from '@/lib/money';
import { getAdminProductGroupBySlug } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

function formatDate(value: Date | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(value);
}

interface AdminProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminProductPage({ params }: AdminProductPageProps) {
  await requireAdmin();

  const resolvedParams = await params;
  const product = await getAdminProductGroupBySlug(resolvedParams.slug);

  if (!product) notFound();

  const inventoryValue = product.variants.reduce((sum, v) => sum + v.inventory * v.price, 0);

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Topnav */}
      <nav className="sticky top-0 z-50 border-b border-foreground bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 text-muted transition-colors hover:text-foreground">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Dashboard</span>
            </Link>
            <span className="text-muted">/</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">{product.name}</span>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="border border-foreground px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-white">
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10 sm:px-12 lg:px-20">
        {/* Product Hero Header */}
        <div className="border border-foreground bg-white p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {product.category && (
                  <span className="border border-foreground px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-muted">
                    {product.category}
                  </span>
                )}
                {product.isHero && (
                  <span className="border border-pink-200 bg-pink-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-pink-dark">
                    ★ Hero Product
                  </span>
                )}
              </div>
              <h1 className="font-display text-5xl tracking-tighter text-foreground">{product.name}</h1>
              {product.description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{product.description}</p>
              )}
            </div>

            <div className="flex shrink-0 gap-3">
              <div className="border border-foreground bg-[#faf9f7] px-4 py-3 text-center">
                <p className="font-display text-2xl text-foreground">{product.variantCount}</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Variants</p>
              </div>
              <div className="border border-foreground bg-[#faf9f7] px-4 py-3 text-center">
                <p className="font-display text-2xl text-foreground">{product.totalInventory}</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted">In Stock</p>
              </div>
              <div className="border border-foreground bg-[#faf9f7] px-4 py-3 text-center">
                <p className="font-display text-2xl text-foreground">{formatUsdFromCents(inventoryValue)}</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details + Actions */}
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          {/* Product Details Form */}
          <form action={updateProductAction} className="space-y-5 border border-foreground bg-white p-6">
            <input type="hidden" name="parentProductId" value={product.id} />
            <input type="hidden" name="parentSlug" value={product.slug} />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">Product Details</p>
              <h2 className="mt-2 font-display text-2xl tracking-tighter text-foreground">Shared Info</h2>
              <p className="mt-1 text-xs text-muted">These details apply to all variations of this product.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Product Name</span>
                <input
                  type="text"
                  name="productName"
                  required
                  defaultValue={product.name}
                  className="w-full border border-foreground bg-transparent px-3 py-2.5 text-sm text-foreground outline-none focus:border-pink-dark"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Category</span>
                <input
                  type="text"
                  name="category"
                  defaultValue={product.category}
                  className="w-full border border-foreground bg-transparent px-3 py-2.5 text-sm text-foreground outline-none focus:border-pink-dark"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Description</span>
              <textarea
                name="description"
                rows={5}
                defaultValue={product.description}
                className="w-full resize-none border border-foreground bg-transparent px-3 py-2.5 text-sm text-foreground outline-none focus:border-pink-dark"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Default Image URL</span>
              <input
                type="url"
                name="imageUrl"
                defaultValue={product.image ?? ''}
                className="w-full border border-foreground bg-transparent px-3 py-2.5 text-sm text-foreground outline-none focus:border-pink-dark"
              />
            </label>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[10px] text-muted">/products/{product.slug}</p>
              <button type="submit" className="btn-secondary">Save Details</button>
            </div>
          </form>

          {/* Actions Sidebar */}
          <div className="space-y-4">
            {/* Upload Image */}
            <form action={uploadProductImageAction} className="space-y-4 border border-foreground bg-white p-5">
              <input type="hidden" name="parentProductId" value={product.id} />
              <input type="hidden" name="parentSlug" value={product.slug} />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-dark">Product Image</p>
                <p className="mt-1 text-xs text-muted">Upload an image that applies to all variants</p>
              </div>

              {product.image && (
                <div className="aspect-square w-full overflow-hidden border border-[#e5e2dd] bg-[#f5f3f0]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                </div>
              )}

              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Choose File</span>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  required
                  className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none file:mr-3 file:border-0 file:bg-foreground file:px-2 file:py-1 file:text-[9px] file:font-bold file:uppercase file:tracking-[0.15em] file:text-background"
                />
              </label>

              <button type="submit" className="btn-secondary w-full">Upload Image</button>
            </form>

            {/* Hero + Delete */}
            <div className="space-y-4 border border-foreground bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-dark">Actions</p>

              <form action={setHeroProductAction}>
                <input type="hidden" name="parentProductId" value={product.id} />
                <input type="hidden" name="parentSlug" value={product.slug} />
                <button
                  type="submit"
                  disabled={product.isHero}
                  className={`w-full border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors ${
                    product.isHero
                      ? 'cursor-default border-pink-dark bg-pink-dark text-white'
                      : 'border-foreground text-foreground hover:bg-foreground hover:text-white'
                  }`}
                >
                  {product.isHero ? '★ Hero Product' : 'Set as Hero'}
                </button>
                {!product.isHero && (
                  <p className="mt-2 text-center text-[10px] text-muted">Highlights this product on your homepage</p>
                )}
              </form>

              <form action={deleteProductAction}>
                <input type="hidden" name="parentProductId" value={product.id} />
                <input type="hidden" name="parentSlug" value={product.slug} />
                <button
                  type="submit"
                  className="w-full border border-red-200 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                >
                  Delete Product
                </button>
                <p className="mt-2 text-center text-[10px] text-muted">This will remove all variants too</p>
              </form>
            </div>
          </div>
        </div>

        {/* Variants */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">Variations</p>
              <h2 className="mt-2 font-display text-4xl tracking-tighter text-foreground">Manage Variants</h2>
            </div>
            <p className="text-xs text-muted">{product.variantCount} variant{product.variantCount !== 1 ? 's' : ''}</p>
          </div>

          <div className="space-y-4">
            {product.variants.map((variant) => (
              <div key={variant.id} className="border border-foreground bg-white">
                {/* Variant Header */}
                <div className={`flex items-center justify-between border-b border-foreground px-5 py-3.5 ${variant.isActive ? 'bg-white' : 'bg-[#faf9f7]'}`}>
                  <div className="flex items-center gap-3">
                    <p className="font-display text-xl text-foreground">{variant.variantName ?? variant.name}</p>
                    <div className="flex gap-1.5">
                      <span className={`border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${variant.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
                        {variant.isActive ? 'Active' : 'Hidden'}
                      </span>
                      {variant.isFeatured && (
                        <span className="border border-pink-200 bg-pink-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-pink-dark">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg text-foreground">{formatUsdFromCents(variant.price)}</p>
                    <p className="text-[10px] text-muted">{variant.inventory} in stock</p>
                  </div>
                </div>

                {/* Variant Form */}
                <form action={updateVariantAction} className="p-5">
                  <input type="hidden" name="productId" value={variant.id} />
                  <input type="hidden" name="slug" value={variant.slug} />
                  <input type="hidden" name="parentProductId" value={product.id} />
                  <input type="hidden" name="parentSlug" value={product.slug} />
                  <input type="hidden" name="parentProductName" value={product.name} />

                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Identity */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Identity</p>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Variant Name</span>
                        <input
                          type="text"
                          name="variantName"
                          required
                          defaultValue={variant.variantName ?? variant.name}
                          className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-pink-dark"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Category</span>
                        <input
                          type="text"
                          name="category"
                          defaultValue={variant.category}
                          className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-pink-dark"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Sort Order</span>
                        <input
                          type="number"
                          name="sortOrder"
                          defaultValue={variant.sortOrder}
                          className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-pink-dark"
                        />
                      </label>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Pricing & Stock</p>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Price</span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                          <input
                            type="number"
                            name="price"
                            step="0.01"
                            min="0"
                            defaultValue={(variant.price / 100).toFixed(2)}
                            className="w-full border border-foreground bg-transparent py-2 pl-7 pr-3 text-sm text-foreground outline-none focus:border-pink-dark"
                          />
                        </div>
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Compare-At Price</span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                          <input
                            type="number"
                            name="compareAtPrice"
                            step="0.01"
                            min="0"
                            defaultValue={variant.compareAtPrice ? (variant.compareAtPrice / 100).toFixed(2) : ''}
                            className="w-full border border-foreground bg-transparent py-2 pl-7 pr-3 text-sm text-foreground outline-none focus:border-pink-dark"
                          />
                        </div>
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Inventory</span>
                        <input
                          type="number"
                          name="inventory"
                          min="0"
                          defaultValue={variant.inventory}
                          className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-pink-dark"
                        />
                      </label>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Content</p>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Description</span>
                        <textarea
                          name="description"
                          rows={4}
                          defaultValue={variant.description ?? ''}
                          className="w-full resize-none border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-pink-dark"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Image URL</span>
                        <input
                          type="url"
                          name="imageUrl"
                          defaultValue={variant.imageUrl ?? ''}
                          className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-pink-dark"
                        />
                      </label>
                    </div>

                    {/* Visibility */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Visibility</p>

                      <div className="space-y-2.5 border border-[#e5e2dd] bg-[#f5f3f0] p-3">
                        <label className="flex cursor-pointer items-center gap-2.5 text-xs text-foreground">
                          <input type="checkbox" name="isActive" defaultChecked={variant.isActive} className="h-4 w-4 accent-foreground" />
                          <span className="font-semibold">Active on storefront</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2.5 text-xs text-foreground">
                          <input type="checkbox" name="isFeatured" defaultChecked={variant.isFeatured} className="h-4 w-4 accent-foreground" />
                          <span className="font-semibold">Featured on homepage</span>
                        </label>
                      </div>

                      <div className="space-y-2 border border-[#e5e2dd] bg-[#f5f3f0] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Variant Image</p>
                        {variant.imageUrl && (
                          <div className="aspect-square w-full overflow-hidden border border-[#e5e2dd] bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={variant.imageUrl} alt={variant.variantName ?? variant.name} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          className="w-full bg-transparent text-xs text-foreground file:mr-2 file:border-0 file:bg-foreground file:px-2 file:py-1 file:text-[9px] file:font-bold file:uppercase file:tracking-[0.1em] file:text-background"
                        />
                        <button
                          type="submit"
                          formAction={uploadVariantImageAction}
                          className="w-full border border-foreground px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-foreground hover:text-white"
                        >
                          Upload Image
                        </button>
                      </div>

                      <p className="text-[10px] text-muted">Updated {formatDate(variant.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="mt-5 flex items-center justify-between border-t border-[#e5e2dd] pt-4">
                    <p className="text-[10px] text-muted">{variant.slug}</p>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        formAction={deleteVariantAction}
                        className="border border-red-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                      >
                        Delete
                      </button>
                      <button
                        type="submit"
                        className="border border-foreground bg-foreground px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-transparent hover:text-foreground"
                      >
                        Save Variant
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ))}
          </div>

          {/* Add Variant Form */}
          <div className="border border-foreground bg-white">
            <div className="border-b border-foreground px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">Add Variation</p>
              <h3 className="mt-1 font-display text-2xl tracking-tighter text-foreground">New Variant</h3>
            </div>

            <form action={createVariantAction} className="p-5">
              <input type="hidden" name="parentProductId" value={product.id} />
              <input type="hidden" name="parentProductName" value={product.name} />
              <input type="hidden" name="parentSlug" value={product.slug} />
              <input type="hidden" name="description" value={product.description} />
              <input type="hidden" name="category" value={product.category} />
              <input type="hidden" name="imageUrl" value={product.image ?? ''} />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Variant Name *</span>
                  <input
                    type="text"
                    name="variantName"
                    required
                    placeholder="e.g. 0.03 CC 10-15mm"
                    className="w-full border border-foreground bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted/40 focus:border-pink-dark"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Price *</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                      className="w-full border border-foreground bg-transparent py-2.5 pl-7 pr-3 text-sm text-foreground outline-none placeholder:text-muted/40 focus:border-pink-dark"
                    />
                  </div>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Compare-At</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                    <input
                      type="number"
                      name="compareAtPrice"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full border border-foreground bg-transparent py-2.5 pl-7 pr-3 text-sm text-foreground outline-none placeholder:text-muted/40 focus:border-pink-dark"
                    />
                  </div>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Inventory *</span>
                  <input
                    type="number"
                    name="inventory"
                    min="0"
                    defaultValue="0"
                    required
                    className="w-full border border-foreground bg-transparent px-3 py-2.5 text-sm text-foreground outline-none focus:border-pink-dark"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-5">
                <label className="flex cursor-pointer items-center gap-2.5 text-xs text-foreground">
                  <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 accent-foreground" />
                  <span className="font-semibold">Active on storefront</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 text-xs text-foreground">
                  <input type="checkbox" name="isFeatured" className="h-4 w-4 accent-foreground" />
                  <span className="font-semibold">Featured on homepage</span>
                </label>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                  <span>Sort Order</span>
                  <input
                    type="number"
                    name="sortOrder"
                    defaultValue={product.variantCount}
                    className="w-16 border border-foreground bg-transparent px-2 py-1.5 text-sm text-foreground outline-none focus:border-pink-dark"
                  />
                </div>
                <button type="submit" className="btn-primary ml-auto">
                  Add Variant →
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
