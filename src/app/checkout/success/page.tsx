import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="font-display text-5xl font-medium text-foreground">Thank You</h1>
          <p className="text-sm text-muted leading-relaxed">
            Your order has been received. We&apos;ll send a confirmation to your email and reach out
            when your lashes are ready for pickup.
          </p>
        </div>

        <div className="border border-foreground p-6 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Pickup Info</p>
          <p className="text-sm font-semibold text-foreground">Fresno Salon</p>
          <p className="text-xs text-muted">Ready in 2–4 Hours</p>
        </div>

        <Link href="/shop" className="btn-primary w-full block py-5">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
