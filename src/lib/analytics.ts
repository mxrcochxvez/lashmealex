// Cloudflare Web Analytics — custom event tracking (client-side only)
// Beacon is loaded conditionally by ConsentContext after the user accepts cookies.

declare global {
  interface Window {
    __cfBeacon?: {
      track: (name: string, data?: Record<string, unknown>) => void;
    };
  }
}

function trackEvent(name: string, data?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    window.__cfBeacon?.track(name, data);
  } catch {
    // Never let analytics errors surface to users
  }
}

export const analytics = {
  /** Fired on initial mount of a product detail page. */
  productViewed(productId: string, productName: string, priceCents: number) {
    trackEvent('product_viewed', { productId, productName, priceCents });
  },

  /** Fired when the user picks a different variant. */
  variantSelected(variantId: string, variantName: string, priceCents: number) {
    trackEvent('variant_selected', { variantId, variantName, priceCents });
  },

  /** Fired when an item lands in the cart. */
  addToCart(productId: string, productName: string, priceCents: number, quantity: number) {
    trackEvent('add_to_cart', { productId, productName, priceCents, quantity });
  },

  /**
   * Fired when the user submits the cart identity form.
   * Captures name / email / phone so sessions can be tied to known customers.
   */
  cartIdentitySubmitted(name: string, email: string, phone: string) {
    trackEvent('cart_identity_submitted', { name, email, phone });
  },

  /** Fired when the user clicks "Checkout Now". */
  checkoutInitiated(subtotalCents: number, itemCount: number) {
    trackEvent('checkout_initiated', { subtotalCents, itemCount });
  },

  /** Fired on the /checkout/success page. */
  purchaseComplete() {
    trackEvent('purchase_complete');
  },
};
