import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { FadeIn } from "../components/LoadingStates";

const featuredProducts = [
  {
    id: "1",
    name: "Lashmealex Luxe Strip Set",
    price: 18,
    compareAtPrice: 24,
    description: "Soft-volume lash set for everyday wear",
    category: "Lashes",
    rating: 4.8,
    inStock: true,
  },
  {
    id: "2",
    name: "Pro Bond + Seal Duo",
    price: 24,
    description: "Salon-grade hold and clean finish",
    category: "Adhesives",
    rating: 4.6,
    inStock: true,
  },
  {
    id: "3",
    name: "Lash Care Essentials Kit",
    price: 32,
    compareAtPrice: 40,
    description: "Brush, cleanser, and aftercare for extensions",
    category: "Aftercare",
    rating: 4.9,
    inStock: true,
  },
  {
    id: "4",
    name: "Glow Up Brow + Lash Bundle",
    price: 45,
    description: "Complete brow and lash routine in one box",
    category: "Kits",
    rating: 4.7,
    inStock: true,
  },
];

const newArrivals = [
  {
    id: "5",
    name: "Magnetic Lash Collection",
    price: 28,
    description: "Easy-to-apply magnetic lashes for a seamless look",
    category: "Lashes",
    rating: 4.5,
    inStock: true,
  },
  {
    id: "6",
    name: "Precision Lash Applicator",
    price: 12,
    description: "Professional tool for perfect lash application",
    category: "Tools",
    rating: 4.4,
    inStock: true,
  },
  {
    id: "7",
    name: "Individual Lash Extensions",
    price: 22,
    description: "Professional-grade individual lashes for custom looks",
    category: "Lashes",
    rating: 4.8,
    inStock: true,
  },
  {
    id: "8",
    name: "Lash Growth Serum",
    price: 35,
    description: "Nourishing serum for natural lash growth",
    category: "Aftercare",
    rating: 4.6,
    inStock: true,
  },
];

const categories = [
  { name: "Lashes", count: 24, href: "/shop?category=lashes" },
  { name: "Adhesives", count: 8, href: "/shop?category=adhesives" },
  { name: "Aftercare", count: 12, href: "/shop?category=aftercare" },
  { name: "Tools", count: 10, href: "/shop?category=tools" },
  { name: "Kits & Bundles", count: 6, href: "/shop?category=kits" },
];

export const metadata: Metadata = {
  title: "Lashmealex — Lashes, Aftercare & Beauty Essentials",
  description:
    "Shop professional-grade lashes, adhesives, aftercare, and beauty tools from Lashmealex. Curated by a Fresno lash artist.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="px-6 py-16 sm:px-12 lg:px-20 lg:py-24">
          <div className="w-full">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr] border border-foreground">
              <FadeIn direction="left" className="h-full">
                <div className="h-full border-b border-foreground bg-white px-10 py-16 sm:px-16 sm:py-20 lg:border-b-0 lg:border-r">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
                    Lashmealex
                  </p>
                  <h1 className="mt-10 font-display text-[3.5rem] font-medium leading-[1] tracking-tighter text-foreground sm:text-[5.5rem]">
                    Your Lash <br />Essentials.
                  </h1>
                  <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted">
                    Professional lashes, adhesives, and aftercare — curated by a working
                    lash artist. Shop the products we actually use in salon.
                  </p>

                  <div className="mt-14 flex flex-col gap-6 sm:flex-row">
                    <Link href="/shop" className="btn-primary min-w-[200px]">
                      Shop Now
                    </Link>
                    <Link href="/#bestsellers" className="btn-secondary min-w-[200px]">
                      Best Sellers
                    </Link>
                  </div>

                  <div className="mt-20 grid gap-12 border-t border-line pt-12 sm:grid-cols-3">
                    {["Salon-Curated", "Professional Grade", "Same-Day Ready"].map((item) => (
                      <div key={item} className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-pink-dark">—</p>
                        <p className="text-[11px] font-bold uppercase tracking-wider leading-relaxed text-muted">{item}</p>
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
                      The Luxe Strip Set. <br />Handcrafted Volume.
                    </h2>
                    <p className="mt-8 text-sm leading-relaxed text-muted">
                      Our best-selling soft-volume lashes — lightweight, reusable, and designed for all-day comfort.
                    </p>
                    <Link href="/shop" className="btn-ghost mt-10 w-fit">
                      View Details
                    </Link>
                  </div>
                  <div className="relative h-80 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#d9b09f]/20 to-transparent mix-blend-multiply" />
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Best Sellers */}
        <section id="bestsellers" className="px-6 py-16 sm:px-12 lg:px-20 lg:py-24 bg-white border-y border-foreground">
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
                  The products our clients reach for again and again.
                </p>
              </div>

              <Link href="/shop" className="btn-ghost w-fit">
                View All
              </Link>
            </FadeIn>

            <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
              {featuredProducts.map((product, index) => (
                <FadeIn key={product.id} delay={index * 0.08}>
                  <ProductCard product={product} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Shop by Category */}
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
                      {cat.count} products
                    </p>
                    <div className="mt-8 flex items-center justify-between">
                      <p className="font-display text-2xl font-medium tracking-tight group-hover:text-background">
                        {cat.name}
                      </p>
                      <span className="text-muted opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-background/60" aria-hidden="true">&rarr;</span>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section id="new-arrivals" className="px-6 py-16 sm:px-12 lg:px-20 lg:py-24 bg-white border-y border-foreground">
          <div className="w-full">
            <FadeIn className="mb-20 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
                  Just Added
                </p>
                <h2 className="mt-8 font-display text-[3.5rem] font-medium leading-none tracking-tighter text-foreground sm:text-[4.5rem]">
                  New Arrivals.
                </h2>
                <p className="mt-8 text-lg text-muted">
                  Fresh drops and restocks — see what&apos;s new this week.
                </p>
              </div>

              <Link href="/shop" className="btn-ghost w-fit">
                Shop All New
              </Link>
            </FadeIn>

            <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
              {newArrivals.map((product, index) => (
                <FadeIn key={product.id} delay={index * 0.08}>
                  <ProductCard product={product} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Salon Banner */}
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
                    Book a lash appointment or pick up your order in person.
                    We&apos;re open Wednesday through Saturday.
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

                <div className="bg-foreground p-10 sm:p-16 text-background">
                  <div className="space-y-16">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-light opacity-80">Hours</p>
                      <p className="mt-6 font-display text-3xl font-medium tracking-tight">Wed – Sat</p>
                    </div>
                    <div className="h-px bg-white/15" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-light opacity-80">Location</p>
                      <p className="mt-6 font-display text-3xl font-medium tracking-tight">Fresno, CA</p>
                    </div>
                    <div className="h-px bg-white/15" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-pink-light opacity-80">Online Orders</p>
                      <p className="mt-6 font-display text-3xl font-medium tracking-tight">Same-Day Pickup</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* Footer */}
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
              <Link href="/shop" className="block text-sm text-muted transition-colors hover:text-foreground">All Products</Link>
              <Link href="/shop?category=lashes" className="block text-sm text-muted transition-colors hover:text-foreground">Lashes</Link>
              <Link href="/shop?category=aftercare" className="block text-sm text-muted transition-colors hover:text-foreground">Aftercare</Link>
              <Link href="/shop?category=tools" className="block text-sm text-muted transition-colors hover:text-foreground">Tools</Link>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">Info</p>
            <div className="mt-6 space-y-4">
              <a href="https://lashmealex.glossgenius.com/" target="_blank" rel="noreferrer" className="block text-sm text-muted transition-colors hover:text-foreground">Book Appointment</a>
              <Link href="/shop" className="block text-sm text-muted transition-colors hover:text-foreground">Shipping & Pickup</Link>
              <Link href="/shop" className="block text-sm text-muted transition-colors hover:text-foreground">Contact</Link>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground">Connect</p>
            <div className="mt-6 space-y-4">
              <a href="https://instagram.com/lashmealex" target="_blank" rel="noreferrer" className="block text-sm text-muted transition-colors hover:text-foreground">Instagram</a>
              <a href="https://lashmealex.glossgenius.com/" target="_blank" rel="noreferrer" className="block text-sm text-muted transition-colors hover:text-foreground">GlossGenius</a>
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
