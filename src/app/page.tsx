import type {Metadata} from "next";
import Link from "next/link";

import Header from "../components/Header";
import {FadeIn} from "../components/LoadingStates";
import ProductGridWithQuickView from "../components/ProductGridWithQuickView";
import {getHeroProduct, listStoreProducts} from "@/lib/catalog";

export const dynamic = "force-dynamic";

const categories = [
  {name: "Lashes", href: "/shop?category=lashes"},
];

export const metadata: Metadata = {
  title: "Lashmealex — Lashes, Aftercare & Beauty Essentials",
  description:
    "Shop professional-grade lashes, adhesives, aftercare, and beauty tools from Lashmealex. Curated by a Fresno lash artist.",
};

export default async function Home() {
  const storeProducts = await listStoreProducts();
  const heroProduct = await getHeroProduct();
  const featuredProducts = storeProducts.filter((product) => product.isFeatured).slice(0, 8);
  const newArrivals = [...storeProducts].sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="px-6 py-16 sm:px-12 lg:px-20 lg:py-24">
          <div className="w-full">
            <div className="grid gap-0 border border-foreground lg:grid-cols-[1.1fr_0.9fr]">
              <FadeIn direction="left" className="h-full">
                <div className="h-full border-b border-foreground bg-white px-10 py-16 sm:px-16 sm:py-20 lg:border-b-0 lg:border-r">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
                    Lashmealex
                  </p>
                  <h1 className="mt-10 font-display text-[3.5rem] font-medium leading-[1] tracking-tighter text-foreground sm:text-[5.5rem]">
                    Your Lash <br />Essentials.
                  </h1>

                  <div className="mt-14 flex flex-col gap-6 sm:flex-row">
                    <Link href="/shop" className="btn-primary min-w-[200px] !bg-pink-dark !border-pink-dark hover:!bg-foreground hover:!border-foreground">
                      Shop Now
                    </Link>
                    <Link href="/#bestsellers" className="btn-secondary min-w-[200px]">
                      Best Sellers
                    </Link>
                  </div>

                  <div className="mt-20 grid gap-12 border-t border-line pt-12 sm:grid-cols-3">
                    {["Premium Quality", "Salon Curated", "Same-Day Pickup"].map((item) => (
                      <div key={item} className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-pink-dark">—</p>
                        <p className="text-[11px] font-bold uppercase leading-relaxed tracking-wider text-muted">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="right" delay={0.1} className="h-full">
                <div className="flex h-full flex-col bg-[#f0f0f0]">
                  <div className="flex-1 bg-white p-10 sm:p-16">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
                      Featured
                    </p>
                    <h2 className="mt-8 font-display text-4xl font-medium leading-tight tracking-tight text-foreground">
                      {heroProduct?.name ?? "Lash Extensions."}
                    </h2>
                    <p className="mt-8 text-sm leading-relaxed text-muted">
                      {heroProduct?.description || "Browse our full range of curls, diameters, and lengths — each one stocked individually so you always know exactly what's available."}
                    </p>
                    <Link
                      href={heroProduct ? `/products/${heroProduct.slug}` : "/shop"}
                      className="btn-ghost mt-10 w-fit"
                    >
                      View Details
                    </Link>
                  </div>
                  <div className="relative h-80 overflow-hidden">
                    {heroProduct?.image ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${heroProduct.image}')` }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[url('https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png')] bg-cover bg-center" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#d9b09f]/20 to-transparent mix-blend-multiply" />
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <section
          id="bestsellers"
          className="border-y border-foreground bg-white px-6 py-16 sm:px-12 lg:px-20 lg:py-24"
        >
          <div className="w-full">
            <FadeIn className="mb-20 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
                  The Essentials
                </p>
                <h2 className="mt-8 font-display text-[3.5rem] font-medium leading-none tracking-tighter text-foreground sm:text-[4.5rem]">
                  Best Sellers.
                </h2>
                <p className="mt-8 text-lg text-muted">
                  Our most-loved lash trays, chosen by clients and restocked weekly.
                </p>
              </div>

              <Link href="/shop" className="btn-ghost w-fit">
                View All
              </Link>
            </FadeIn>

            <ProductGridWithQuickView products={featuredProducts} columns={4} />
          </div>
        </section>

        <section className="px-6 py-16 sm:px-12 lg:px-20 lg:py-24">
          <div className="w-full">
            <FadeIn>
              <div className="mb-16">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
                  Browse
                </p>
                <h2 className="mt-8 font-display text-[3rem] font-medium leading-none tracking-tighter text-foreground sm:text-[4rem]">
                  Shop by Category.
                </h2>
              </div>
            </FadeIn>

            <div className="grid gap-0 border border-foreground sm:grid-cols-2 lg:grid-cols-5">
              {categories.map((cat, index) => (
                <FadeIn key={cat.name} delay={index * 0.06}>
                  <Link
                    href={cat.href}
                    className="group flex flex-col justify-between border-b border-foreground bg-white p-8 transition-all duration-200 hover:bg-foreground hover:text-background sm:border-b-0 sm:border-r last:border-r-0 last:border-b-0"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted group-hover:text-background/60">
                      {storeProducts.length} products
                    </p>
                    <div className="mt-8 flex items-center justify-between">
                      <p className="font-display text-2xl font-medium tracking-tight group-hover:text-background">
                        {cat.name}
                      </p>
                      <span
                        className="text-muted opacity-0 transition-all duration-200 group-hover:text-background/60 group-hover:opacity-100"
                        aria-hidden="true"
                      >
                        &rarr;
                      </span>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section
          id="new-arrivals"
          className="border-y border-foreground bg-white px-6 py-16 sm:px-12 lg:px-20 lg:py-24"
        >
          <div className="w-full">
            <FadeIn className="mb-20 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
                  Just Dropped
                </p>
                <h2 className="mt-8 font-display text-[3.5rem] font-medium leading-none tracking-tighter text-foreground sm:text-[4.5rem]">
                  New Arrivals.
                </h2>
                <p className="mt-8 text-lg text-muted">
                  The latest additions to our lash collection — fresh curls, new lengths, and
                  restocked favorites.
                </p>
              </div>

              <Link href="/shop" className="btn-ghost w-fit">
                Shop All
              </Link>
            </FadeIn>

            <ProductGridWithQuickView products={newArrivals} columns={4} />
          </div>
        </section>

        <section className="px-6 py-16 sm:px-12 lg:px-20 lg:py-24">
          <div className="w-full">
            <FadeIn>
              <div className="grid border border-foreground lg:grid-cols-2">
                <div className="bg-white px-10 py-16 sm:px-16 sm:py-20 lg:border-r lg:border-foreground">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
                    Fresno, CA
                  </p>
                  <h2 className="mt-10 font-display text-[3rem] font-medium leading-[1] tracking-tighter text-foreground sm:text-[4rem]">
                    Visit the Salon.
                  </h2>
                  <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted">
                    Book a lash appointment or swing by for same-day order pickup.
                    We&apos;re open Wednesday through Saturday — walk-ins welcome.
                  </p>

                  <div className="mt-14">
                    <a
                      href="https://lashmealex.glossgenius.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary min-w-[200px]"
                    >
                      Book an Appointment
                    </a>
                  </div>
                </div>

                <div className="bg-foreground p-10 text-background sm:p-16">
                  <div className="space-y-16">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-light opacity-80">
                        Hours
                      </p>
                      <p className="mt-6 font-display text-3xl font-medium tracking-tight">
                        Wed – Sat
                      </p>
                    </div>
                    <div className="h-px bg-white/15" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-light opacity-80">
                        Location
                      </p>
                      <p className="mt-6 font-display text-3xl font-medium tracking-tight">
                        Fresno, CA
                      </p>
                    </div>
                    <div className="h-px bg-white/15" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-light opacity-80">
                        Online Orders
                      </p>
                      <p className="mt-6 font-display text-3xl font-medium tracking-tight">
                        Same-Day Pickup
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <footer className="border-t border-foreground bg-[#faf7f5] px-6 py-16 sm:px-12 lg:px-20">
        <div className="grid gap-16 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="font-display text-3xl tracking-tighter text-foreground">lashmealex</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Professional lashes and beauty essentials, curated in Fresno, CA.
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">Shop</p>
            <div className="mt-6 space-y-4">
              <Link href="/shop" className="block text-sm text-muted transition-colors hover:text-foreground">
                All Products
              </Link>
              <Link href="/shop?category=lashes" className="block text-sm text-muted transition-colors hover:text-foreground">
                Lashes
              </Link>
              <Link href="/admin" className="block text-sm text-muted transition-colors hover:text-foreground">
                Owner Dashboard
              </Link>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">Info</p>
            <div className="mt-6 space-y-4">
              <a
                href="https://lashmealex.glossgenius.com/"
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-muted transition-colors hover:text-foreground"
              >
                Book Appointment
              </a>
              <Link href="/shop" className="block text-sm text-muted transition-colors hover:text-foreground">
                Shipping & Pickup
              </Link>
              <Link href="/shop" className="block text-sm text-muted transition-colors hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">Connect</p>
            <div className="mt-6 space-y-4">
              <a
                href="https://instagram.com/lashmealex"
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-muted transition-colors hover:text-foreground"
              >
                Instagram
              </a>
              <a
                href="https://lashmealex.glossgenius.com/"
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-muted transition-colors hover:text-foreground"
              >
                GlossGenius
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-line pt-8">
          <p className="text-xs text-muted">&copy; {new Date().getFullYear()} Lashmealex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
