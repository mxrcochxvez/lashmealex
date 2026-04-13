import "server-only";

import { and, asc, desc, eq, like, ne, or, sql } from "drizzle-orm";

import { products } from "@/db/schema";

import { getDb } from "./cloudflare";
import { centsToDollars } from "./money";

export interface StoreVariant {
  id: string;
  slug: string;
  name: string;
  variantName?: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  inStock: boolean;
  image?: string;
}

export interface StoreProduct {
  id: string;
  parentProductId: string;
  parentProductName: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  inStock: boolean;
  image?: string;
  images: string[];
  isFeatured: boolean;
  isHero: boolean;
  sortOrder: number;
  rating: number;
  reviewCount: number;
  features: string[];
  variants: StoreVariant[];
}

export interface AdminProductGroup {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  variantCount: number;
  totalInventory: number;
  isFeatured: boolean;
  hasActiveVariant: boolean;
  variants: Array<typeof products.$inferSelect>;
}

function toParentSlug(parentProductId: string): string {
  return parentProductId.replace(/_/g, "-");
}

function normalizeVariant(row: typeof products.$inferSelect): StoreVariant {
  const inventory = row.inventory ?? 0;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    variantName: row.variantName ?? undefined,
    price: centsToDollars(row.price),
    compareAtPrice: row.compareAtPrice ? centsToDollars(row.compareAtPrice) : undefined,
    inventory,
    inStock: inventory > 0,
    image: row.imageUrl ?? undefined,
  };
}

function groupProducts(rows: Array<typeof products.$inferSelect>): StoreProduct[] {
  const grouped = new Map<string, Array<typeof products.$inferSelect>>();

  for (const row of rows) {
    const existing = grouped.get(row.parentProductId);

    if (existing) {
      existing.push(row);
      continue;
    }

    grouped.set(row.parentProductId, [row]);
  }

  return Array.from(grouped.values()).map((groupRows) => {
    const sortedRows = [...groupRows].sort((a, b) => a.sortOrder - b.sortOrder);
    const primaryRow = sortedRows[0];
    const variants = sortedRows.map(normalizeVariant);
    const prices = variants.map((variant) => variant.price);
    const compareAtPrices = variants
      .map((variant) => variant.compareAtPrice)
      .filter((value): value is number => value !== undefined);
    const inventories = variants.map((variant) => variant.inventory);
    const activeImages = sortedRows
      .map((row) => row.imageUrl)
      .filter((value): value is string => Boolean(value));

    return {
      id: primaryRow.parentProductId,
      parentProductId: primaryRow.parentProductId,
      parentProductName: primaryRow.parentProductName,
      slug: toParentSlug(primaryRow.parentProductId),
      name: primaryRow.parentProductName,
      description: primaryRow.description ?? "",
      category: primaryRow.category,
      price: Math.min(...prices),
      compareAtPrice: compareAtPrices.length > 0 ? Math.max(...compareAtPrices) : undefined,
      inventory: inventories.reduce((sum, inventory) => sum + inventory, 0),
      inStock: variants.some((variant) => variant.inStock),
      image: activeImages[0],
      images: activeImages.length > 0 ? Array.from(new Set(activeImages)) : [],
      isFeatured: sortedRows.some((row) => row.isFeatured),
      isHero: sortedRows.some((row) => row.isHero),
      sortOrder: primaryRow.sortOrder,
      rating: 5,
      reviewCount: 0,
      features: [
        "Salon-curated lash trays",
        "Real-time stock — what you see is what we have",
        "Choose your exact size and curl on the product page",
      ],
      variants,
    };
  });
}

function groupAdminProducts(rows: Array<typeof products.$inferSelect>): AdminProductGroup[] {
  const grouped = new Map<string, Array<typeof products.$inferSelect>>();

  for (const row of rows) {
    const existing = grouped.get(row.parentProductId);

    if (existing) {
      existing.push(row);
      continue;
    }

    grouped.set(row.parentProductId, [row]);
  }

  return Array.from(grouped.values()).map((groupRows) => {
    const sortedRows = [...groupRows].sort((a, b) => a.sortOrder - b.sortOrder);
    const primaryRow = sortedRows[0];

    return {
      id: primaryRow.parentProductId,
      slug: toParentSlug(primaryRow.parentProductId),
      name: primaryRow.parentProductName,
      category: primaryRow.category,
      description: primaryRow.description ?? "",
      image: primaryRow.imageUrl ?? undefined,
      variantCount: sortedRows.length,
      totalInventory: sortedRows.reduce((sum, row) => sum + row.inventory, 0),
      isFeatured: sortedRows.some((row) => row.isFeatured),
      hasActiveVariant: sortedRows.some((row) => row.isActive),
      variants: sortedRows,
    };
  });
}

/**
 * Lists active storefront items grouped by parent product.
 *
 * @param options Optional storefront filters.
 * @returns Ordered storefront products with variant collections attached.
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

  return groupProducts(rows);
}

/**
 * Loads a single storefront item by its parent-product slug.
 *
 * @param slug The public product slug.
 * @returns The matching storefront item or `null`.
 */
export async function getStoreProductBySlug(slug: string): Promise<StoreProduct | null> {
  const rows = await listStoreProducts();

  return rows.find((product) => product.slug === slug) ?? null;
}

export async function getHeroProduct(): Promise<StoreProduct | null> {
  const rows = await listStoreProducts();
  return rows.find((product) => product.isHero) ?? rows.find((product) => product.isFeatured) ?? rows[0] ?? null;
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
 * Returns owner-facing parent products grouped for dashboard navigation.
 *
 * @returns Parent products with attached variant rows.
 */
export async function listAdminProductGroups(): Promise<AdminProductGroup[]> {
  const rows = await listAdminProducts();

  return groupAdminProducts(rows);
}

/**
 * Returns a single parent product group for owner editing.
 *
 * @param slug The parent product slug.
 * @returns The grouped product and its variants or `null`.
 */
export async function getAdminProductGroupBySlug(slug: string): Promise<AdminProductGroup | null> {
  const groups = await listAdminProductGroups();

  return groups.find((group) => group.slug === slug) ?? null;
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
      inventoryValue: sql<number>`coalesce(sum(${products.inventory} * ${products.price}), 0)`,
    })
    .from(products)
    .where(eq(products.isActive, true));

  return {
    activeVariants: row?.activeVariants ?? 0,
    totalInventory: row?.totalInventory ?? 0,
    inventoryValue: row?.inventoryValue ?? 0,
  };
}

/**
 * Lists lightweight related parent products for the product detail page.
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
    .limit(8);

  return groupProducts(rows)
    .filter((relatedProduct) => relatedProduct.parentProductId !== product.parentProductId)
    .slice(0, 4);
}
