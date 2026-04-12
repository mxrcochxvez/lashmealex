import "server-only";

import { desc, eq, sql } from "drizzle-orm";

import { orderItems, orders } from "@/db/schema";

import { getDb } from "./cloudflare";

/**
 * Lists orders for the owner dashboard.
 *
 * @returns Orders sorted from newest to oldest.
 */
export async function listAdminOrders() {
  const db = getDb();

  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

/**
 * Builds summary values for the owner dashboard.
 *
 * @returns Order count, paid sales, and units sold.
 */
export async function getAdminOrderStats() {
  const db = getDb();

  const [orderSummary] = await db
    .select({
      orderCount: sql<number>`count(*)`,
      grossSales: sql<number>`coalesce(sum(case when ${orders.status} = 'paid' then ${orders.total} else 0 end), 0)`,
    })
    .from(orders);

  const [itemSummary] = await db
    .select({
      unitsSold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(eq(orders.status, "paid"));

  return {
    orderCount: orderSummary?.orderCount ?? 0,
    grossSales: orderSummary?.grossSales ?? 0,
    unitsSold: itemSummary?.unitsSold ?? 0,
  };
}
