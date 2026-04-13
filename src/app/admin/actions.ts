'use server';

import { desc, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { orderItems, orders, products } from '@/db/schema';
import { loginAdmin, logoutAdmin, requireAdmin } from '@/lib/admin-auth';
import { getDb, getProductImagePath, getProductImagesBucket } from '@/lib/cloudflare';

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

async function getUniqueVariantSlugForUpdate(baseSlug: string, productId: string) {
  const db = getDb();
  let candidate = baseSlug;
  let counter = 2;

  for (;;) {
    const existing = await db.query.products.findFirst({
      where: eq(products.slug, candidate),
    });

    if (!existing || existing.id === productId) {
      return candidate;
    }

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

function toCents(value: FormDataEntryValue | null) {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0;
}

function toNullableCents(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? '').trim();

  if (!rawValue) {
    return null;
  }

  const amount = Number(rawValue);

  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : null;
}

function toInventoryCount(value: FormDataEntryValue | null) {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
}

function toSortOrder(value: FormDataEntryValue | null) {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) ? Math.floor(amount) : 0;
}

function getBooleanField(formData: FormData, key: string) {
  return formData.get(key) === 'on';
}

function sanitizeFileName(fileName: string) {
  const extensionIndex = fileName.lastIndexOf('.');
  const baseName = extensionIndex >= 0 ? fileName.slice(0, extensionIndex) : fileName;
  const extension = extensionIndex >= 0 ? fileName.slice(extensionIndex).toLowerCase() : '';
  const sanitizedBase = slugify(baseName) || 'image';

  return `${sanitizedBase}${extension}`;
}

async function uploadImageFile(file: File, objectKey: string) {
  const bucket = getProductImagesBucket();
  const bytes = await file.arrayBuffer();

  await bucket.put(objectKey, bytes, {
    httpMetadata: {
      contentType: file.type || 'application/octet-stream',
    },
  });

  return getProductImagePath(objectKey);
}

function revalidateCatalogPaths(parentSlug: string, variantSlug?: string, previousVariantSlug?: string) {
  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/admin');
  revalidatePath(`/admin/products/${parentSlug}`);
  revalidatePath(`/products/${parentSlug}`);

  if (variantSlug) {
    revalidatePath(`/products/${variantSlug}`);
  }

  if (previousVariantSlug && previousVariantSlug !== variantSlug) {
    revalidatePath(`/products/${previousVariantSlug}`);
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
  const price = toCents(formData.get('price'));
  const compareAtPrice = toNullableCents(formData.get('compareAtPrice'));
  const inventory = toInventoryCount(formData.get('inventory'));
  const isFeatured = getBooleanField(formData, 'isFeatured');
  const isActive = getBooleanField(formData, 'isActive');

  if (!productName || !initialVariantName) {
    redirect('/admin');
  }

  const parentSlug = await getUniqueParentSlug(slugify(productName));
  const variantSlug = await getUniqueVariantSlug(
    `${parentSlug}-${slugify(initialVariantName)}`,
  );
  const db = getDb();
  const newProductId = crypto.randomUUID();

  await db.insert(products).values({
    id: newProductId,
    parentProductId: parentIdFromSlug(parentSlug),
    parentProductName: productName,
    slug: variantSlug,
    name: `${productName} ${initialVariantName}`.trim(),
    variantName: initialVariantName,
    description,
    category,
    imageUrl: imageUrl || null,
    price,
    compareAtPrice,
    inventory,
    isFeatured,
    isActive,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const upload = formData.get('image') as File | null;
  const isValidFile = upload && typeof upload === 'object' && 'size' in upload && 'name' in upload;

  if (isValidFile && upload.size > 0 && upload.type.startsWith('image/')) {
    const objectKey = `products/${parentSlug}/${Date.now()}-${sanitizeFileName(upload.name)}`;
    const finalImageUrl = await uploadImageFile(upload, objectKey);

    await db
      .update(products)
      .set({ imageUrl: finalImageUrl })
      .where(eq(products.id, newProductId));
  }

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
  const price = toCents(formData.get('price'));
  const compareAtPrice = toNullableCents(formData.get('compareAtPrice'));
  const inventory = toInventoryCount(formData.get('inventory'));
  const sortOrderValue = String(formData.get('sortOrder') ?? '').trim();
  const isFeatured = getBooleanField(formData, 'isFeatured');
  const isActive = getBooleanField(formData, 'isActive');

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
    price,
    compareAtPrice,
    inventory,
    isFeatured,
    isActive,
    sortOrder: sortOrderValue ? toSortOrder(sortOrderValue) : (lastVariant?.sortOrder ?? -1) + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidateCatalogPaths(parentSlug, variantSlug);
  redirect(`/admin/products/${parentSlug}`);
}

/**
 * Uploads a shared parent-product image into R2 and applies it to every variant.
 *
 * @param formData Submitted product-image upload form data.
 * @throws Redirects back to the product editor after upload.
 */
export async function uploadProductImageAction(formData: FormData) {
  await requireAdmin();

  const parentProductId = String(formData.get('parentProductId') ?? '').trim();
  const parentSlug = String(formData.get('parentSlug') ?? '').trim();
  const upload = formData.get('image') as File | null;
  const isValidFile = upload && typeof upload === 'object' && 'size' in upload && 'name' in upload;

  if (!parentProductId || !parentSlug || !isValidFile || upload.size === 0) {
    redirect(`/admin/products/${parentSlug || ''}`);
  }

  if (!upload.type.startsWith('image/')) {
    redirect(`/admin/products/${parentSlug}`);
  }

  const objectKey = `products/${parentSlug}/${Date.now()}-${sanitizeFileName(upload.name)}`;
  const imageUrl = await uploadImageFile(upload, objectKey);
  const db = getDb();

  await db
    .update(products)
    .set({
      imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(products.parentProductId, parentProductId));

  revalidateCatalogPaths(parentSlug);
  redirect(`/admin/products/${parentSlug}`);
}

/**
 * Uploads a variant image into R2 and applies it to one specific variant.
 *
 * @param formData Submitted variant-image upload form data.
 * @throws Redirects back to the product editor after upload.
 */
export async function uploadVariantImageAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get('productId') ?? '').trim();
  const parentSlug = String(formData.get('parentSlug') ?? '').trim();
  const variantSlug = String(formData.get('slug') ?? '').trim();
  const upload = formData.get('image') as File | null;
  const isValidFile = upload && typeof upload === 'object' && 'size' in upload && 'name' in upload;

  if (!productId || !parentSlug || !variantSlug || !isValidFile || upload.size === 0) {
    redirect(`/admin/products/${parentSlug || ''}`);
  }

  if (!upload.type.startsWith('image/')) {
    redirect(`/admin/products/${parentSlug}`);
  }

  const objectKey = `products/${parentSlug}/variants/${variantSlug}/${Date.now()}-${sanitizeFileName(upload.name)}`;
  const imageUrl = await uploadImageFile(upload, objectKey);
  const db = getDb();

  await db
    .update(products)
    .set({
      imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  revalidateCatalogPaths(parentSlug, variantSlug);
  redirect(`/admin/products/${parentSlug}`);
}

/**
 * Updates shared product details across every variant in a parent product.
 *
 * @param formData Submitted product-management form data.
 */
export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const parentSlug = String(formData.get('parentSlug') ?? '');
  const parentProductId = String(formData.get('parentProductId') ?? '');
  const productName = String(formData.get('productName') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const category = String(formData.get('category') ?? 'Lashes').trim() || 'Lashes';
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();

  if (!parentSlug || !parentProductId || !productName) {
    return;
  }

  const db = getDb();
  const existingVariants = await db
    .select({
      id: products.id,
      variantName: products.variantName,
    })
    .from(products)
    .where(eq(products.parentProductId, parentProductId));

  for (const variant of existingVariants) {
    await db
      .update(products)
      .set({
        parentProductName: productName,
        name: `${productName} ${variant.variantName ?? ''}`.trim(),
        description,
        category,
        imageUrl: imageUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(products.id, variant.id));
  }

  revalidateCatalogPaths(parentSlug);
  redirect(`/admin/products/${parentSlug}`);
}

/**
 * Updates a single product variant in D1.
 *
 * @param formData Submitted variant-management form data.
 */
export async function updateVariantAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get('productId') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();
  const parentSlug = String(formData.get('parentSlug') ?? '').trim();
  const parentProductName = String(formData.get('parentProductName') ?? '').trim();
  const variantName = String(formData.get('variantName') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const category = String(formData.get('category') ?? 'Lashes').trim() || 'Lashes';
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const price = toCents(formData.get('price'));
  const compareAtPrice = toNullableCents(formData.get('compareAtPrice'));
  const inventory = toInventoryCount(formData.get('inventory'));
  const sortOrder = toSortOrder(formData.get('sortOrder'));
  const isActive = getBooleanField(formData, 'isActive');
  const isFeatured = getBooleanField(formData, 'isFeatured');

  if (!productId || !parentSlug || !parentProductName || !variantName) {
    return;
  }

  const variantSlug = await getUniqueVariantSlugForUpdate(
    `${parentSlug}-${slugify(variantName)}`,
    productId,
  );
  const db = getDb();

  await db
    .update(products)
    .set({
      slug: variantSlug,
      name: `${parentProductName} ${variantName}`.trim(),
      variantName,
      description,
      category,
      imageUrl: imageUrl || null,
      price,
      compareAtPrice,
      inventory,
      sortOrder,
      isActive,
      isFeatured,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  revalidateCatalogPaths(parentSlug, variantSlug, slug);
  redirect(`/admin/products/${parentSlug}`);
}

/**
 * Deletes a parent product and all of its variants.
 *
 * @param formData Submitted product-delete form data.
 * @throws Redirects back to the admin dashboard.
 */
export async function deleteProductAction(formData: FormData) {
  await requireAdmin();

  const parentProductId = String(formData.get('parentProductId') ?? '').trim();
  const parentSlug = String(formData.get('parentSlug') ?? '').trim();

  if (!parentProductId || !parentSlug) {
    return;
  }

  const db = getDb();
  const variants = await db
    .select({ id: products.id, slug: products.slug })
    .from(products)
    .where(eq(products.parentProductId, parentProductId));

  if (variants.length === 0) {
    redirect('/admin');
  }

  await db.delete(orderItems).where(inArray(orderItems.productId, variants.map((variant) => variant.id)));
  await db.delete(products).where(eq(products.parentProductId, parentProductId));

  revalidateCatalogPaths(parentSlug);

  for (const variant of variants) {
    revalidatePath(`/products/${variant.slug}`);
  }

  redirect('/admin');
}

/**
 * Deletes a single variant. If it is the last remaining variant, the full product is removed.
 *
 * @param formData Submitted variant-delete form data.
 * @throws Redirects after deletion.
 */
export async function deleteVariantAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get('productId') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();
  const parentProductId = String(formData.get('parentProductId') ?? '').trim();
  const parentSlug = String(formData.get('parentSlug') ?? '').trim();

  if (!productId || !parentProductId || !parentSlug) {
    return;
  }

  const db = getDb();
  const siblingVariants = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.parentProductId, parentProductId));

  await db.delete(orderItems).where(eq(orderItems.productId, productId));
  await db.delete(products).where(eq(products.id, productId));

  if (siblingVariants.length <= 1) {
    revalidateCatalogPaths(parentSlug, undefined, slug);
    redirect('/admin');
  }

  revalidateCatalogPaths(parentSlug, undefined, slug);
  redirect(`/admin/products/${parentSlug}`);
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
