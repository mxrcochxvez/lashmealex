import "server-only";

import { and, desc, eq, inArray, like, or } from "drizzle-orm";

import { cartItems, carts, products } from "@/db/schema";

import { getDb } from "./cloudflare";
import {
  ABANDONED_THRESHOLD_MS,
  CART_STATUSES,
  type CartStatus,
  normalizeEmail,
  normalizePhone,
} from "./cart-constants";

export interface CartLine {
  id: string;
  productId: string;
  quantity: number;
  name: string;
  variantName: string | null;
  slug: string;
  price: number;
  image: string | null;
  inventory: number;
  isActive: boolean;
}

export interface CartWithItems {
  id: string;
  email: string;
  phone: string;
  name: string;
  status: CartStatus;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  lastActiveAt: Date | null;
  items: CartLine[];
  subtotal: number;
  itemCount: number;
}

function subtotalOf(lines: Array<{ price: number; quantity: number }>) {
  return lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
}

function itemCountOf(lines: Array<{ quantity: number }>) {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export async function getCartWithItems(cartId: string): Promise<CartWithItems | null> {
  const db = getDb();

  const cartRow = await db.select().from(carts).where(eq(carts.id, cartId)).get();
  if (!cartRow) return null;

  const itemRows = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      name: products.parentProductName,
      variantName: products.variantName,
      slug: products.slug,
      price: products.price,
      image: products.imageUrl,
      inventory: products.inventory,
      isActive: products.isActive,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId))
    .all();

  const lines: CartLine[] = itemRows.map((r) => ({
    id: r.id,
    productId: r.productId,
    quantity: r.quantity,
    name: r.name,
    variantName: r.variantName ?? null,
    slug: r.slug,
    price: r.price,
    image: r.image ?? null,
    inventory: r.inventory,
    isActive: Boolean(r.isActive),
  }));

  return {
    id: cartRow.id,
    email: cartRow.email,
    phone: cartRow.phone,
    name: cartRow.name,
    status: cartRow.status as CartStatus,
    notes: cartRow.notes ?? null,
    createdAt: cartRow.createdAt ?? null,
    updatedAt: cartRow.updatedAt ?? null,
    lastActiveAt: cartRow.lastActiveAt ?? null,
    items: lines,
    subtotal: subtotalOf(lines),
    itemCount: itemCountOf(lines),
  };
}

export async function findCartByEmail(email: string) {
  const db = getDb();
  const normalized = normalizeEmail(email);
  const row = await db.select().from(carts).where(eq(carts.email, normalized)).get();
  return row ?? null;
}

export async function createCart(input: { email: string; phone: string; name: string }) {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(carts).values({
    id,
    email: normalizeEmail(input.email),
    phone: normalizePhone(input.phone),
    name: input.name.trim(),
    status: "active",
    createdAt: now,
    updatedAt: now,
    lastActiveAt: now,
  });

  return id;
}

export async function touchCart(cartId: string) {
  const db = getDb();
  const now = new Date();
  await db
    .update(carts)
    .set({ updatedAt: now, lastActiveAt: now })
    .where(eq(carts.id, cartId));
}

export async function upsertCartItem(cartId: string, productId: string, quantity: number) {
  const db = getDb();
  if (quantity <= 0) return;

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .get();

  const now = new Date();

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity, updatedAt: now })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      id: crypto.randomUUID(),
      cartId,
      productId,
      quantity,
      createdAt: now,
      updatedAt: now,
    });
  }

  await touchCart(cartId);
}

export async function setCartItemQuantity(cartId: string, productId: string, quantity: number) {
  const db = getDb();

  if (quantity <= 0) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
    await touchCart(cartId);
    return;
  }

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .get();

  const now = new Date();
  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity, updatedAt: now })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      id: crypto.randomUUID(),
      cartId,
      productId,
      quantity,
      createdAt: now,
      updatedAt: now,
    });
  }

  await touchCart(cartId);
}

export async function removeCartItem(cartId: string, productId: string) {
  const db = getDb();
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
  await touchCart(cartId);
}

export async function clearCart(cartId: string) {
  const db = getDb();
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  await touchCart(cartId);
}

export async function mergeCartItems(
  cartId: string,
  incoming: Array<{ productId: string; quantity: number }>,
) {
  const db = getDb();
  for (const item of incoming) {
    if (!item.productId || item.quantity <= 0) continue;
    
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, item.productId)))
      .get();

    if (existing) {
      // Use the higher quantity between what's on server and what's in local session
      // this avoids 'doubling' items if user adds same item before and after identifying
      if (item.quantity > existing.quantity) {
        await db
          .update(cartItems)
          .set({ quantity: item.quantity, updatedAt: new Date() })
          .where(eq(cartItems.id, existing.id));
      }
    } else {
      await db.insert(cartItems).values({
        id: crypto.randomUUID(),
        cartId,
        productId: item.productId,
        quantity: item.quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
  await touchCart(cartId);
}

export async function replaceCartItems(
  cartId: string,
  incoming: Array<{ productId: string; quantity: number }>,
) {
  await clearCart(cartId);
  await mergeCartItems(cartId, incoming);
}

export async function deleteCart(cartId: string) {
  const db = getDb();
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  await db.delete(carts).where(eq(carts.id, cartId));
}

export async function updateCartStatus(cartId: string, status: CartStatus) {
  if (!CART_STATUSES.includes(status)) {
    throw new Error(`Invalid cart status: ${status}`);
  }
  const db = getDb();
  await db
    .update(carts)
    .set({ status, updatedAt: new Date() })
    .where(eq(carts.id, cartId));
}

export async function updateCartNotes(cartId: string, notes: string) {
  const db = getDb();
  await db
    .update(carts)
    .set({ notes: notes.trim() || null, updatedAt: new Date() })
    .where(eq(carts.id, cartId));
}

export interface AdminCartSummary {
  id: string;
  email: string;
  name: string;
  phone: string;
  status: CartStatus;
  itemCount: number;
  subtotal: number;
  lastActiveAt: Date | null;
  updatedAt: Date | null;
  createdAt: Date | null;
}

export async function listAdminCarts(opts?: { status?: CartStatus; search?: string }) {
  const db = getDb();

  const conditions = [] as Array<ReturnType<typeof eq>>;
  if (opts?.status) {
    conditions.push(eq(carts.status, opts.status));
  }

  const search = opts?.search?.trim();
  const whereClause = search
    ? and(
        conditions.length ? and(...conditions) : undefined,
        or(like(carts.email, `%${search.toLowerCase()}%`), like(carts.name, `%${search}%`)),
      )
    : conditions.length
      ? and(...conditions)
      : undefined;

  const query = db.select().from(carts).orderBy(desc(carts.lastActiveAt));
  const cartRows = whereClause ? await query.where(whereClause).all() : await query.all();

  if (cartRows.length === 0) return [] as AdminCartSummary[];

  const ids = cartRows.map((c) => c.id);
  const itemRows = await db
    .select({
      cartId: cartItems.cartId,
      quantity: cartItems.quantity,
      price: products.price,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(inArray(cartItems.cartId, ids))
    .all();

  const totalsByCart = new Map<string, { count: number; subtotal: number }>();
  for (const row of itemRows) {
    const entry = totalsByCart.get(row.cartId) ?? { count: 0, subtotal: 0 };
    entry.count += row.quantity;
    entry.subtotal += row.price * row.quantity;
    totalsByCart.set(row.cartId, entry);
  }

  return cartRows.map<AdminCartSummary>((c) => ({
    id: c.id,
    email: c.email,
    name: c.name,
    phone: c.phone,
    status: c.status as CartStatus,
    itemCount: totalsByCart.get(c.id)?.count ?? 0,
    subtotal: totalsByCart.get(c.id)?.subtotal ?? 0,
    lastActiveAt: c.lastActiveAt ?? null,
    updatedAt: c.updatedAt ?? null,
    createdAt: c.createdAt ?? null,
  }));
}

export async function getAdminCartStats() {
  const db = getDb();

  const activeCarts = await db
    .select({ id: carts.id, lastActiveAt: carts.lastActiveAt })
    .from(carts)
    .where(eq(carts.status, "active"))
    .all();

  const activeIds = activeCarts.map((c) => c.id);
  let totalValue = 0;
  if (activeIds.length > 0) {
    const rows = await db
      .select({
        quantity: cartItems.quantity,
        price: products.price,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(inArray(cartItems.cartId, activeIds))
      .all();
    totalValue = rows.reduce((sum, r) => sum + r.price * r.quantity, 0);
  }

  const now = Date.now();
  const abandonedCount = activeCarts.filter((c) => {
    const t = c.lastActiveAt ? c.lastActiveAt.getTime() : 0;
    return now - t > ABANDONED_THRESHOLD_MS;
  }).length;

  return {
    activeCount: activeCarts.length,
    totalValue,
    abandonedCount,
  };
}

export async function validateActiveProduct(productId: string) {
  const db = getDb();
  const row = await db
    .select({ id: products.id, isActive: products.isActive })
    .from(products)
    .where(eq(products.id, productId))
    .get();
  return Boolean(row && row.isActive);
}
