import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  createVariantAction,
  deleteProductAction,
  deleteVariantAction,
  logoutAction,
  updateProductAction,
  updateVariantAction,
  uploadProductImageAction,
  uploadVariantImageAction,
} from '../../actions';
import { requireAdmin } from '@/lib/admin-auth';
import { formatUsdFromCents } from '@/lib/money';
import { getAdminProductGroupBySlug } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

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

interface AdminProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AdminProductPage({ params }: AdminProductPageProps) {
  await requireAdmin();

  const resolvedParams = await params;
  const product = await getAdminProductGroupBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="flex flex-col gap-6 border border-foreground bg-white p-8 sm:flex-row sm:items-end sm:justify-between sm:p-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
              Product Editor
            </p>
            <h1 className="mt-5 font-display text-5xl tracking-tighter text-foreground">
              {product.name}
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted">
              Edit each variant the way you would in Medusa: open the product first, then manage
              price, inventory, and visibility at the variant level.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="btn-secondary">
              Back to Dashboard
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="btn-primary">
                Sign Out
              </button>
            </form>
          </div>
        </div>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="border border-foreground bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Category</p>
            <p className="mt-4 text-lg text-foreground">{product.category}</p>
          </div>
          <div className="border border-foreground bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Variants</p>
            <p className="mt-4 text-lg text-foreground">{product.variantCount}</p>
          </div>
          <div className="border border-foreground bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Inventory</p>
            <p className="mt-4 text-lg text-foreground">{product.totalInventory} trays</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <form action={updateProductAction} className="space-y-5 border border-foreground bg-white p-6">
              <input type="hidden" name="parentProductId" value={product.id} />
              <input type="hidden" name="parentSlug" value={product.slug} />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
                  Product Details
                </p>
                <h2 className="mt-4 font-display text-3xl tracking-tighter text-foreground">
                  Shared Across Variants
                </h2>
              </div>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Product Name
                </span>
                <input
                  type="text"
                  name="productName"
                  required
                  defaultValue={product.name}
                  className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Category
                </span>
                <input
                  type="text"
                  name="category"
                  defaultValue={product.category}
                  className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Description
                </span>
                <textarea
                  name="description"
                  rows={6}
                  defaultValue={product.description}
                  className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                  Default Image URL
                </span>
                <input
                  type="url"
                  name="imageUrl"
                  defaultValue={product.image ?? ''}
                  className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                />
              </label>

              <button type="submit" className="btn-secondary">
                Save Product Details
              </button>
            </form>

            <div className="space-y-5 border border-foreground bg-white p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
                  Product Actions
                </p>
                <h2 className="mt-4 font-display text-3xl tracking-tighter text-foreground">
                  Manage Parent Product
                </h2>
              </div>

              <div className="space-y-4 text-sm text-muted">
                <p>Storefront slug: /products/{product.slug}</p>
                <p>Inventory value: {formatUsdFromCents(product.variants.reduce((sum, variant) => sum + (variant.inventory * variant.price), 0))}</p>
                <p>Last updated: {formatDate(product.variants[0]?.updatedAt ?? null)}</p>
              </div>

              <form action={uploadProductImageAction} className="space-y-3 border border-line p-4">
                <input type="hidden" name="parentProductId" value={product.id} />
                <input type="hidden" name="parentSlug" value={product.slug} />
                <label className="space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                    Upload Shared Product Image
                  </span>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    required
                    className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none file:mr-3 file:border-0 file:bg-foreground file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.2em] file:text-background"
                  />
                </label>
                <button type="submit" className="btn-secondary w-full">
                  Upload Product Image
                </button>
              </form>

              <form action={deleteProductAction}>
                <input type="hidden" name="parentProductId" value={product.id} />
                <input type="hidden" name="parentSlug" value={product.slug} />
                <button
                  type="submit"
                  className="w-full border border-red-700 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-700 transition-colors hover:bg-red-700 hover:text-white"
                >
                  Delete Product
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
              Add Variant
            </p>
            <h2 className="mt-4 font-display text-4xl tracking-tighter text-foreground">
              Create Another Variant
            </h2>
          </div>

          <form action={createVariantAction} className="grid gap-5 border border-foreground bg-white p-6 xl:grid-cols-4">
            <input type="hidden" name="parentProductId" value={product.id} />
            <input type="hidden" name="parentProductName" value={product.name} />
            <input type="hidden" name="parentSlug" value={product.slug} />
            <input type="hidden" name="description" value={product.description} />
            <input type="hidden" name="category" value={product.category} />
            <input type="hidden" name="imageUrl" value={product.image ?? ''} />

            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                Variant Name
              </span>
              <input
                type="text"
                name="variantName"
                required
                placeholder="0.03 CC 10-15mm"
                className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
              />
            </label>

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
                Inventory
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

            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                Sort Order
              </span>
              <input
                type="number"
                name="sortOrder"
                defaultValue={product.variantCount}
                className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
              />
            </label>

            <div className="flex items-end gap-4 xl:col-span-3">
              <label className="flex items-center gap-3 text-sm text-foreground">
                <input type="checkbox" name="isActive" defaultChecked />
                Active
              </label>
              <label className="flex items-center gap-3 text-sm text-foreground">
                <input type="checkbox" name="isFeatured" />
                Featured
              </label>
              <button type="submit" className="btn-secondary ml-auto">
                Add Variant
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">Variants</p>
            <h2 className="mt-4 font-display text-4xl tracking-tighter text-foreground">
              Full Variant CRUD
            </h2>
          </div>

          <div className="space-y-4">
            {product.variants.map((variant) => (
              <form
                key={variant.id}
                action={updateVariantAction}
                className="grid gap-5 border border-foreground bg-white p-6 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
              >
                <input type="hidden" name="productId" value={variant.id} />
                <input type="hidden" name="slug" value={variant.slug} />
                <input type="hidden" name="parentProductId" value={product.id} />
                <input type="hidden" name="parentSlug" value={product.slug} />
                <input type="hidden" name="parentProductName" value={product.name} />

                <div className="space-y-4">
                  <div>
                    <p className="font-display text-2xl text-foreground">
                      {variant.variantName ?? variant.name}
                    </p>
                    <p className="mt-2 text-xs text-muted">{variant.slug}</p>
                  </div>

                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                      Variant Name
                    </span>
                    <input
                      type="text"
                      name="variantName"
                      required
                      defaultValue={variant.variantName ?? variant.name}
                      className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                      Description
                    </span>
                    <textarea
                      name="description"
                      rows={4}
                      defaultValue={variant.description ?? ''}
                      className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                      Image URL
                    </span>
                    <input
                      type="url"
                      name="imageUrl"
                      defaultValue={variant.imageUrl ?? ''}
                      className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                    />
                  </label>

                  <div className="space-y-3 border border-line p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                      Upload Variant Image
                    </p>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none file:mr-3 file:border-0 file:bg-foreground file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.2em] file:text-background"
                    />
                    <button type="submit" formAction={uploadVariantImageAction} className="btn-secondary w-full">
                      Upload Variant Image
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                      Price
                    </span>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      defaultValue={(variant.price / 100).toFixed(2)}
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
                      step="0.01"
                      min="0"
                      defaultValue={variant.compareAtPrice ? (variant.compareAtPrice / 100).toFixed(2) : ''}
                      className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                      Inventory
                    </span>
                    <input
                      type="number"
                      name="inventory"
                      min="0"
                      defaultValue={variant.inventory}
                      className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                    />
                  </label>
                </div>

                <div className="grid gap-4">
                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                      Category
                    </span>
                    <input
                      type="text"
                      name="category"
                      defaultValue={variant.category}
                      className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
                      Sort Order
                    </span>
                    <input
                      type="number"
                      name="sortOrder"
                      defaultValue={variant.sortOrder}
                      className="w-full border border-foreground bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                    />
                  </label>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-sm text-foreground">
                    <input type="checkbox" name="isActive" defaultChecked={variant.isActive} />
                    Active on storefront
                  </label>
                  <label className="flex items-center gap-3 text-sm text-foreground">
                    <input type="checkbox" name="isFeatured" defaultChecked={variant.isFeatured} />
                    Featured on homepage
                  </label>
                  <p className="text-xs text-muted">Updated {formatDate(variant.updatedAt)}</p>
                </div>

                <div className="flex flex-col justify-end gap-3">
                  <button type="submit" className="btn-secondary w-full">
                    Save Variant
                  </button>
                  <button
                    type="submit"
                    formAction={deleteVariantAction}
                    className="w-full border border-red-700 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-700 transition-colors hover:bg-red-700 hover:text-white"
                  >
                    Delete Variant
                  </button>
                </div>
              </form>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
