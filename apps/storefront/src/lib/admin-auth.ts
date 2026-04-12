import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "lashmealex_admin_session";

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD ?? null;
}

function getSessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET ?? null;
}

function buildSessionToken(password: string, secret: string): string {
  return createHash("sha256").update(`${password}:${secret}`).digest("hex");
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

  const expected = buildSessionToken(password, secret);

  try {
    return timingSafeEqual(sha256(token), sha256(expected));
  } catch {
    return false;
  }
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

  try {
    const matches = timingSafeEqual(sha256(passwordInput), sha256(password));

    if (!matches) {
      return false;
    }
  } catch {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, buildSessionToken(password, secret), {
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
