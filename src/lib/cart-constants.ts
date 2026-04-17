export const CART_STORAGE_KEY = "lashmealex_cart_id";

export const CART_STATUSES = ["active", "converted", "abandoned"] as const;
export type CartStatus = (typeof CART_STATUSES)[number];

export const ABANDONED_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const MAX_PENDING_ITEMS = 50;

export interface PendingCartItem {
  productId: string;
  quantity: number;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string): string {
  return value.replace(/\D+/g, "");
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPhone(value: string): boolean {
  const digits = normalizePhone(value);
  return digits.length === 10 || digits.length === 11;
}
