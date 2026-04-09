import type { Metadata } from "next";
import styles from "./page.module.css";

const featuredProducts = [
  {
    name: "Lashmealex Luxe Strip Set",
    price: "$18",
    note: "Soft-volume lash set for everyday wear",
  },
  {
    name: "Pro Bond + Seal Duo",
    price: "$24",
    note: "Salon-grade hold and clean finish",
  },
  {
    name: "Lash Care Essentials Kit",
    price: "$32",
    note: "Brush, cleanser, and aftercare for extensions",
  },
  {
    name: "Glow Up Brow + Lash Bundle",
    price: "$45",
    note: "A curated beauty pickup bundle",
  },
];

const pickupHighlights = [
  "Pickup-first checkout for the Fresno salon location",
  "Apple Pay ready checkout path",
  "Venmo-friendly payment flow planned for launch",
];

export const metadata: Metadata = {
  title: "Beauty Products and Pickup",
  description:
    "Shop Lashmealex beauty products online, pick them up locally, and book salon services through the existing GlossGenius site.",
};

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.ambient} aria-hidden="true" />
        <header className={styles.topbar}>
          <div>
            <p className={styles.kicker}>lashmealex shop</p>
            <p className={styles.subkicker}>Beauty products with local pickup</p>
          </div>
          <a
            className={styles.bookButton}
            href="https://lashmealex.glossgenius.com/"
            target="_blank"
            rel="noreferrer"
          >
            Book appointments
          </a>
        </header>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Fresno, CA</p>
            <h1>Elegant lash care products, built to match the Lashmealex brand.</h1>
            <p className={styles.lead}>
              This storefront is the product side of the business. Clients can
              shop beauty essentials, choose pickup at the salon, and still head
              over to GlossGenius for appointments and booking.
            </p>

            <div className={styles.ctas}>
              <a className={styles.primaryCta} href="#shop">
                Shop featured products
              </a>
              <a
                className={styles.secondaryCta}
                href="https://lashmealex.glossgenius.com/"
                target="_blank"
                rel="noreferrer"
              >
                Go to booking site
              </a>
            </div>

            <ul className={styles.highlights} aria-label="Store highlights">
              {pickupHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <aside className={styles.heroCard} aria-label="Storefront snapshot">
            <p className={styles.cardLabel}>Today&apos;s pickup focus</p>
            <div className={styles.cardPriceRow}>
              <span>Pickup-ready orders</span>
              <strong>Open</strong>
            </div>
            <div className={styles.cardDivider} />
            <p className={styles.cardTitle}>Fast checkout, premium presentation</p>
            <p className={styles.cardText}>
              Designed to keep the brand polished, SEO-friendly, and easy to
              manage once inventory starts moving.
            </p>
            <div className={styles.cardStats}>
              <div>
                <strong>4</strong>
                <span>mock products</span>
              </div>
              <div>
                <strong>1</strong>
                <span>booking handoff</span>
              </div>
              <div>
                <strong>SSR</strong>
                <span>SEO-ready shell</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.section} id="shop">
        <div className={styles.sectionHeading}>
          <p className={styles.sectionLabel}>featured products</p>
          <h2>Mock catalog layout for the first product drops.</h2>
          <p>
            These cards are placeholders for the initial merchandising system
            and can later connect to Medusa inventory and product data.
          </p>
        </div>

        <div className={styles.productGrid}>
          {featuredProducts.map((product) => (
            <article className={styles.productCard} key={product.name}>
              <div className={styles.productImage} aria-hidden="true">
                <span>{product.name.split(" ").slice(0, 2).join(" ")}</span>
              </div>
              <div className={styles.productBody}>
                <div className={styles.productMeta}>
                  <strong>{product.name}</strong>
                  <span>{product.price}</span>
                </div>
                <p>{product.note}</p>
                <a href="https://lashmealex.glossgenius.com/" target="_blank" rel="noreferrer">
                  Book a service instead
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.dualPanel}>
          <article className={styles.panel}>
            <p className={styles.sectionLabel}>pickup</p>
            <h2>Pickup-only checkout for launch.</h2>
            <p>
              The first version should stay simple: customers buy products
              online, choose salon pickup, and receive clear instructions during
              checkout and confirmation.
            </p>
          </article>

          <article className={styles.panelAccent}>
            <p className={styles.sectionLabel}>booking handoff</p>
            <h2>Services continue on the existing GlossGenius site.</h2>
            <p>
              This app is a companion storefront. It should push service traffic
              back to the current booking experience instead of duplicating it.
            </p>
            <a
              className={styles.inlineLink}
              href="https://lashmealex.glossgenius.com/"
              target="_blank"
              rel="noreferrer"
            >
              Open booking site
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}
