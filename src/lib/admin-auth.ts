import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "lashmealex_admin_session";

async function sha256Hex(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD ?? null;
}

function getSessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET ?? null;
}

async function buildSessionToken(password: string, secret: string): Promise<string> {
  return sha256Hex(`${password}:${secret}`);
}

/**
 * Returns whether the request is authenticated as the owner admin user.
 *
 * @returns `true` when the admin cookie matches the configured credentials.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const password = getAdminPassword();
  const secret = getSessionSecret();

  if (!password || !secret) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  const expected = await buildSessionToken(password, secret);

  return token === expected;
}

/**
 * Redirects to the admin login page when the request is not authenticated.
 *
 * @throws Redirects to `/admin/login`.
 */
export async function requireAdmin() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }
}

/**
 * Attempts to sign an owner into the admin area.
 *
 * @param passwordInput The submitted admin password.
 * @returns `true` on success, otherwise `false`.
 */
export async function loginAdmin(passwordInput: string): Promise<boolean> {
  const password = getAdminPassword();
  const secret = getSessionSecret();

  if (!password || !secret) {
    return false;
  }

  const passwordHash = await sha256Hex(password);
  const inputHash = await sha256Hex(passwordInput);

  if (passwordHash !== inputHash) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, await buildSessionToken(password, secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return true;
}

/**
 * Clears the admin session cookie.
 */
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
