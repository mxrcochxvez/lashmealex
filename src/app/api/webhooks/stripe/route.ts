import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { eq } from "drizzle-orm";

import { getDb, getStripeSecretKey, getStripeWebhookSecret } from "@/lib/cloudflare";
import { getCartWithItems, updateCartStatus } from "@/lib/cart";
import { createOrderFromCart } from "@/lib/orders";
import { orders } from "@/db/schema";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(getStripeSecretKey(), {
      httpClient: Stripe.createFetchHttpClient(),
    });
    event = await stripe.webhooks.constructEventAsync(body, sig, getStripeWebhookSecret());
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const cartId = session.metadata?.cartId;

    if (!cartId) {
      return NextResponse.json({ error: "Missing cartId in metadata" }, { status: 400 });
    }

    const db = getDb();
    const existing = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.stripeSessionId, session.id))
      .get();

    if (existing) {
      return NextResponse.json({ received: true });
    }

    const cart = await getCartWithItems(cartId);
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    await createOrderFromCart(cart, session.id);
    await updateCartStatus(cartId, "converted");

    revalidatePath("/admin");
    revalidatePath("/admin/carts");
  }

  return NextResponse.json({ received: true });
}
