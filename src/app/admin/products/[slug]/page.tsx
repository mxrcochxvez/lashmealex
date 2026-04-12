import Link from 'next/link';
import { notFound } from 'next/navigation';

import { logoutAction, updateProductAction } from '../../actions';
import { requireAdmin } from '@/lib/admin-auth';
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
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">Variants</p>
            <h2 className="mt-4 font-display text-4xl tracking-tighter text-foreground">
              Inventory + Pricing
            </h2>
          </div>

          <div className="space-y-4">
            {product.variants.map((variant) => (
              <form
                key={variant.id}
                action={updateProductAction}
                className="grid gap-5 border border-foreground bg-white p-6 lg:grid-cols-[2fr_1fr_1fr_auto]"
              >
                <input type="hidden" name="productId" value={variant.id} />
                <input type="hidden" name="slug" value={variant.slug} />
                <input type="hidden" name="parentSlug" value={product.slug} />

                <div>
                  <p className="font-display text-2xl text-foreground">
                    {variant.variantName ?? variant.name}
                  </p>
                  <p className="mt-2 text-xs text-muted">{variant.slug}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
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

                <div className="flex items-end">
                  <button type="submit" className="btn-secondary w-full">
                    Save Variant
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
