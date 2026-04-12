'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { orders, products } from '@/db/schema';
import { loginAdmin, logoutAdmin, requireAdmin } from '@/lib/admin-auth';
import { getDb } from '@/lib/cloudflare';

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
 * Updates variant inventory and price directly in D1.
 *
 * @param formData Submitted product-management form data.
 */
export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get('productId') ?? '');
  const slug = String(formData.get('slug') ?? '');
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
