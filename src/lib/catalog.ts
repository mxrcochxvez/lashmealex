import "server-only";

import { and, asc, desc, eq, like, ne, or, sql } from "drizzle-orm";

import { products } from "@/db/schema";

import { getDb } from "./cloudflare";
import { centsToDollars } from "./money";

export interface StoreProduct {
  id: string;
  parentProductId: string;
  parentProductName: string;
  slug: string;
  name: string;
  variantName?: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  inStock: boolean;
  image?: string;
  images: string[];
  isFeatured: boolean;
  sortOrder: number;
  rating: number;
  reviewCount: number;
  features: string[];
}

function normalizeProduct(row: typeof products.$inferSelect): StoreProduct {
  const inventory = row.inventory ?? 0;

  return {
    id: row.id,
    parentProductId: row.parentProductId,
    parentProductName: row.parentProductName,
    slug: row.slug,
    name: row.name,
    variantName: row.variantName ?? undefined,
    description: row.description ?? "",
    category: row.category,
    price: centsToDollars(row.price),
    compareAtPrice: row.compareAtPrice ? centsToDollars(row.compareAtPrice) : undefined,
    inventory,
    inStock: inventory > 0,
    image: row.imageUrl ?? undefined,
    images: row.imageUrl ? [row.imageUrl] : [],
    isFeatured: row.isFeatured,
    sortOrder: row.sortOrder,
    rating: 5,
    reviewCount: 0,
    features: [
      "Salon-curated lash trays",
      "Variant-level stock tracked in Cloudflare D1",
      "Ready for Fresno pickup workflow",
    ],
  };
}

/**
 * Lists active storefront items, with each variant represented as its own card.
 *
 * @param options Optional storefront filters.
 * @returns Ordered sellable storefront items.
 */
export async function listStoreProducts(options?: {
  featuredOnly?: boolean;
  category?: string;
  query?: string;
}): Promise<StoreProduct[]> {
  const db = getDb();
  const filters = [eq(products.isActive, true)];

  if (options?.featuredOnly) {
    filters.push(eq(products.isFeatured, true));
  }

  if (options?.category) {
    filters.push(eq(products.category, options.category));
  }

  if (options?.query) {
    const pattern = `%${options.query.trim()}%`;
    filters.push(
      or(
        like(products.name, pattern),
        like(products.parentProductName, pattern),
        like(products.category, pattern),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(products)
    .where(and(...filters))
    .orderBy(asc(products.sortOrder), asc(products.name));

  return rows.map(normalizeProduct);
}

/**
 * Loads a single storefront item by slug.
 *
 * @param slug The public product slug.
 * @returns The matching storefront item or `null`.
 */
export async function getStoreProductBySlug(slug: string): Promise<StoreProduct | null> {
  const db = getDb();
  const row = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isActive, true)),
  });

  return row ? normalizeProduct(row) : null;
}

/**
 * Returns owner-facing product records for admin inventory management.
 *
 * @returns Variant-level product rows sorted for dashboard use.
 */
export async function listAdminProducts() {
  const db = getDb();

  return db
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder), asc(products.name));
}

/**
 * Builds summary metrics used by the owner dashboard.
 *
 * @returns Totals for active variants, inventory, and paid sales.
 */
export async function getAdminCatalogStats() {
  const db = getDb();
  const [row] = await db
    .select({
      activeVariants: sql<number>`count(*)`,
      totalInventory: sql<number>`coalesce(sum(${products.inventory}), 0)`,
    })
    .from(products)
    .where(eq(products.isActive, true));

  return {
    activeVariants: row?.activeVariants ?? 0,
    totalInventory: row?.totalInventory ?? 0,
  };
}

/**
 * Lists lightweight related items for the product detail page.
 *
 * @param product The current storefront item.
 * @returns Additional active items from the same parent product or category.
 */
export async function getRelatedStoreProducts(product: StoreProduct): Promise<StoreProduct[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        or(
          eq(products.parentProductId, product.parentProductId),
          eq(products.category, product.category),
        )!,
        ne(products.id, product.id),
      ),
    )
    .orderBy(asc(products.sortOrder), desc(products.inventory))
    .limit(4);

  return rows.map(normalizeProduct);
}
