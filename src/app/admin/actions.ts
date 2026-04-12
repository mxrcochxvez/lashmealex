'use server';

import { desc, eq, like } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { orders, products } from '@/db/schema';
import { loginAdmin, logoutAdmin, requireAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/cloudflare';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parentIdFromSlug(slug: string) {
  return slug.replace(/-/g, '_');
}

async function getUniqueParentSlug(baseSlug: string) {
  const db = getDb();
  let candidate = baseSlug;
  let counter = 2;

  for (;;) {
    const existing = await db.query.products.findFirst({
      where: eq(products.parentProductId, parentIdFromSlug(candidate)),
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function getUniqueVariantSlug(baseSlug: string) {
  const db = getDb();
  let candidate = baseSlug;
  let counter = 2;

  for (;;) {
    const existing = await db.query.products.findFirst({
      where: eq(products.slug, candidate),
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

/**
 * Logs the owner into the admin area.
 *
 * @param formData Submitted login form data.
 * @throws Redirects to the admin page on success or back to login on failure.
 */
export async function loginAction(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const authenticated = await loginAdmin(password);

  if (!authenticated) {
    redirect('/admin/login?error=invalid');
  }

  redirect('/admin');
}

/**
 * Logs the owner out of the admin area.
 *
 * @throws Redirects to the login page.
 */
export async function logoutAction() {
  await logoutAdmin();
  redirect('/admin/login');
}

/**
 * Creates a new parent product and its initial variant from the dashboard.
 *
 * @param formData Submitted product-creation form data.
 * @throws Redirects to the new product editor.
 */
export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const productName = String(formData.get('productName') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const category = String(formData.get('category') ?? 'Lashes').trim() || 'Lashes';
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const initialVariantName = String(formData.get('initialVariantName') ?? '').trim();
  const price = Number(formData.get('price') ?? 0);
  const inventory = Number(formData.get('inventory') ?? 0);
  const isFeatured = formData.get('isFeatured') === 'on';
  const isActive = formData.get('isActive') === 'on';

  if (!productName || !initialVariantName) {
    redirect('/admin');
  }

  const parentSlug = await getUniqueParentSlug(slugify(productName));
  const variantSlug = await getUniqueVariantSlug(
    `${parentSlug}-${slugify(initialVariantName)}`,
  );
  const db = getDb();

  await db.insert(products).values({
    id: crypto.randomUUID(),
    parentProductId: parentIdFromSlug(parentSlug),
    parentProductName: productName,
    slug: variantSlug,
    name: `${productName} ${initialVariantName}`.trim(),
    variantName: initialVariantName,
    description,
    category,
    imageUrl: imageUrl || null,
    price: Number.isFinite(price) ? Math.max(0, Math.round(price * 100)) : 0,
    inventory: Number.isFinite(inventory) ? Math.max(0, Math.floor(inventory)) : 0,
    isFeatured,
    isActive,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/admin');
  redirect(`/admin/products/${parentSlug}`);
}

/**
 * Adds a new variant to an existing parent product.
 *
 * @param formData Submitted variant-creation form data.
 */
export async function createVariantAction(formData: FormData) {
  await requireAdmin();

  const parentProductId = String(formData.get('parentProductId') ?? '').trim();
  const parentProductName = String(formData.get('parentProductName') ?? '').trim();
  const parentSlug = String(formData.get('parentSlug') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const category = String(formData.get('category') ?? 'Lashes').trim() || 'Lashes';
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const variantName = String(formData.get('variantName') ?? '').trim();
  const price = Number(formData.get('price') ?? 0);
  const inventory = Number(formData.get('inventory') ?? 0);
  const isFeatured = formData.get('isFeatured') === 'on';
  const isActive = formData.get('isActive') === 'on';

  if (!parentProductId || !parentProductName || !parentSlug || !variantName) {
    return;
  }

  const db = getDb();
  const lastVariant = await db.query.products.findFirst({
    where: eq(products.parentProductId, parentProductId),
    orderBy: [desc(products.sortOrder)],
  });
  const variantSlug = await getUniqueVariantSlug(`${parentSlug}-${slugify(variantName)}`);

  await db.insert(products).values({
    id: crypto.randomUUID(),
    parentProductId,
    parentProductName,
    slug: variantSlug,
    name: `${parentProductName} ${variantName}`.trim(),
    variantName,
    description,
    category,
    imageUrl: imageUrl || null,
    price: Number.isFinite(price) ? Math.max(0, Math.round(price * 100)) : 0,
    inventory: Number.isFinite(inventory) ? Math.max(0, Math.floor(inventory)) : 0,
    isFeatured,
    isActive,
    sortOrder: (lastVariant?.sortOrder ?? -1) + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/admin');
  revalidatePath(`/admin/products/${parentSlug}`);
  redirect(`/admin/products/${parentSlug}`);
}

/**
 * Updates variant inventory and price directly in D1.
 *
 * @param formData Submitted product-management form data.
 */
export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get('productId') ?? '');
  const slug = String(formData.get('slug') ?? '');
  const parentSlug = String(formData.get('parentSlug') ?? '');
  const inventory = Number(formData.get('inventory') ?? 0);
  const price = Number(formData.get('price') ?? 0);
  const isActive = formData.get('isActive') === 'on';
  const isFeatured = formData.get('isFeatured') === 'on';

  if (!productId) {
    return;
  }

  const db = getDb();

  await db
    .update(products)
    .set({
      inventory: Number.isFinite(inventory) ? Math.max(0, Math.floor(inventory)) : 0,
      price: Number.isFinite(price) ? Math.max(0, Math.round(price * 100)) : 0,
      isActive,
      isFeatured,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/admin');

  if (parentSlug) {
    revalidatePath(`/admin/products/${parentSlug}`);
  }

  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}

/**
 * Updates owner-facing order payment and fulfillment state.
 *
 * @param formData Submitted order-management form data.
 */
export async function updateOrderAction(formData: FormData) {
  await requireAdmin();

  const orderId = String(formData.get('orderId') ?? '');
  const status = String(formData.get('status') ?? 'pending');
  const fulfillmentStatus = String(formData.get('fulfillmentStatus') ?? 'unfulfilled');

  if (!orderId) {
    return;
  }

  const db = getDb();

  await db
    .update(orders)
    .set({
      status,
      fulfillmentStatus,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  revalidatePath('/admin');
}
