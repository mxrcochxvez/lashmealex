import "server-only";

import { getRequestContext } from "@cloudflare/next-on-pages";

import { createDb } from "@/db";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
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
