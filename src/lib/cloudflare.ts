import "server-only";

import { getRequestContext } from "@cloudflare/next-on-pages";

import { createDb } from "@/db";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    PRODUCT_IMAGES: R2Bucket;
    ADMIN_PASSWORD?: string;
    ADMIN_SESSION_SECRET?: string;
  }
}

/**
 * Returns the D1-backed Drizzle client for the current Cloudflare request.
 *
 * This exists so storefront and admin code share one runtime-safe entrypoint
 * instead of reaching into the request context directly in every module.
 *
 * @returns The Drizzle client bound to the current Cloudflare D1 database.
 * @throws When the request is not running with a configured `DB` binding.
 */
export function getDb() {
  const context = getRequestContext();

  if (!context.env.DB) {
    throw new Error("Cloudflare D1 binding `DB` is not available for this request.");
  }

  return createDb({ DB: context.env.DB });
}

/**
 * Returns the R2 bucket used for storefront product images.
 *
 * This exists so admin upload, delete, and image-proxy code can share one
 * runtime-safe access point to the configured bucket binding.
 *
 * @returns The Cloudflare R2 bucket bound as `PRODUCT_IMAGES`.
 * @throws When the request is not running with a configured `PRODUCT_IMAGES` binding.
 */
export function getProductImagesBucket() {
  const context = getRequestContext();

  if (!context.env.PRODUCT_IMAGES) {
    throw new Error("Cloudflare R2 binding `PRODUCT_IMAGES` is not available for this request.");
  }

  return context.env.PRODUCT_IMAGES;
}

/**
 * Builds the app-local delivery URL for an R2-backed product image.
 *
 * This keeps catalog records independent from Cloudflare dashboard URLs or
 * public bucket hostnames by serving images through the storefront itself.
 *
 * @param key The object key stored in the product-images bucket.
 * @returns The route path that can be used in storefront image fields.
 */
export function getProductImagePath(key: string) {
  return `/images/${key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;
}
