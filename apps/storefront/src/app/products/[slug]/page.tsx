import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

// Mock product data - replace with actual Medusa data fetching
interface ProductData {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  features: string[];
  specifications: Record<string, string>;
  seo: { title: string; description: string };
}

const products: ProductData[] = [
  {
    id: '1',
    slug: 'lashmealex-luxe-strip-set',
    name: 'Lashmealex Luxe Strip Set',
    price: 18,
    compareAtPrice: 24,
    description: 'Premium strip lashes designed for everyday elegance. These lightweight, comfortable lashes feature a delicate band that blends seamlessly with your natural lash line for a flawless finish.',
    images: ['/api/placeholder/600/600', '/api/placeholder/600/600', '/api/placeholder/600/600'],
    category: 'Lashes',
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    features: [
      'Handmade from premium synthetic fibers',
      'Reusable up to 25+ times with proper care',
      'Cruelty-free and vegan',
      'Lightweight and comfortable for all-day wear',
      'Easy to apply for beginners and professionals'
    ],
    specifications: {
      'Material': 'Premium synthetic silk',
      'Length': '12mm',
      'Style': 'Natural cat-eye',
      'Band': 'Clear flexible band',
      'Included': '1 pair of lashes + applicator'
    },
    seo: {
      title: 'Lashmealex Luxe Strip Set - Premium False Lashes',
      description: 'Shop the Lashmealex Luxe Strip Set. Premium synthetic strip lashes for natural, everyday elegance. Reusable, cruelty-free, and perfect for all skill levels.'
    }
  },
  {
    id: '2',
    slug: 'pro-bond-seal-duo',
    name: 'Pro Bond + Seal Duo',
    price: 24,
    description: 'Salon-grade lash adhesive and sealant in one convenient duo. The bond provides strong, long-lasting hold while the sealant locks everything in place for a clean, professional finish.',
    images: ['/api/placeholder/600/600'],
    category: 'Adhesives',
    rating: 4.6,
    reviewCount: 87,
    inStock: true,
    features: [
      'Strong hold lasts up to 48 hours',
      'Quick-dry formula — sets in under 60 seconds',
      'Latex-free and gentle on sensitive eyes',
      'Waterproof sealant for all-day wear',
      'Precision applicator tip for easy use'
    ],
    specifications: {
      'Volume': '5ml bond + 5ml sealant',
      'Hold Time': 'Up to 48 hours',
      'Dry Time': 'Under 60 seconds',
      'Formula': 'Latex-free',
      'Included': 'Bond, sealant, and micro brush set'
    },
    seo: {
      title: 'Pro Bond + Seal Duo - Lash Adhesive | Lashmealex',
      description: 'Professional-grade lash adhesive and sealant duo. Strong hold, latex-free, and quick-drying for flawless lash application.'
    }
  },
  {
    id: '3',
    slug: 'lash-care-essentials-kit',
    name: 'Lash Care Essentials Kit',
    price: 32,
    compareAtPrice: 40,
    description: 'Everything you need to keep your lash extensions looking fresh. Includes a gentle foam cleanser, cleansing brush, and aftercare serum to extend the life of your lashes.',
    images: ['/api/placeholder/600/600'],
    category: 'Aftercare',
    rating: 4.9,
    reviewCount: 203,
    inStock: true,
    features: [
      'Oil-free foam cleanser safe for extensions',
      'Soft cleansing brush won\'t damage lash bonds',
      'Nourishing aftercare serum promotes lash health',
      'Travel-friendly sizes',
      'Includes printed care guide'
    ],
    specifications: {
      'Cleanser': '50ml foam',
      'Brush': 'Ultra-soft nylon bristles',
      'Serum': '10ml dropper bottle',
      'Suitable For': 'All extension types',
      'Included': 'Cleanser, brush, serum, care guide'
    },
    seo: {
      title: 'Lash Care Essentials Kit | Lashmealex',
      description: 'Complete lash aftercare kit with foam cleanser, cleansing brush, and nourishing serum. Keep your extensions looking fresh.'
    }
  },
  {
    id: '4',
    slug: 'glow-up-brow-lash-bundle',
    name: 'Glow Up Brow + Lash Bundle',
    price: 45,
    description: 'A complete brow and lash routine in one curated box. Includes our best-selling strip lashes, a precision brow pencil, and setting gel for a polished, put-together look.',
    images: ['/api/placeholder/600/600'],
    category: 'Kits',
    rating: 4.7,
    reviewCount: 56,
    inStock: true,
    features: [
      'Includes 1 pair Luxe Strip Lashes',
      'Precision micro-tip brow pencil',
      'Clear brow setting gel for all-day hold',
      'Curated color-matched set',
      'Gift-ready packaging'
    ],
    specifications: {
      'Lashes': '1 pair Luxe Strip Set',
      'Brow Pencil': 'Retractable micro-tip',
      'Brow Gel': '4ml clear setting gel',
      'Shades': 'Universal',
      'Included': 'Lashes, pencil, gel, gift box'
    },
    seo: {
      title: 'Glow Up Brow + Lash Bundle | Lashmealex',
      description: 'Complete brow and lash bundle with strip lashes, precision brow pencil, and setting gel. The perfect gift for beauty lovers.'
    }
  },
  {
    id: '5',
    slug: 'magnetic-lash-collection',
    name: 'Magnetic Lash Collection',
    price: 28,
    description: 'Easy-to-apply magnetic lashes for a seamless, glue-free look. Features ultra-thin magnets that snap securely onto the magnetic liner for a comfortable, natural appearance.',
    images: ['/api/placeholder/600/600'],
    category: 'Lashes',
    rating: 4.5,
    reviewCount: 42,
    inStock: true,
    features: [
      'No glue needed — magnetic application',
      'Ultra-thin 5-magnet design for secure hold',
      'Includes magnetic eyeliner',
      'Reusable up to 30+ times',
      'Waterproof magnetic liner included'
    ],
    specifications: {
      'Material': 'Synthetic silk with micro-magnets',
      'Magnets': '5 per lash strip',
      'Liner': '3ml waterproof magnetic liner',
      'Style': 'Natural volume',
      'Included': '2 pairs lashes + magnetic liner'
    },
    seo: {
      title: 'Magnetic Lash Collection | Lashmealex',
      description: 'Glue-free magnetic lashes with waterproof magnetic liner. Easy application, reusable, and comfortable all day.'
    }
  },
  {
    id: '6',
    slug: 'precision-lash-applicator',
    name: 'Precision Lash Applicator',
    price: 12,
    description: 'Professional-grade lash applicator tool for perfect placement every time. The ergonomic design and precision tips make applying strip and individual lashes effortless.',
    images: ['/api/placeholder/600/600'],
    category: 'Tools',
    rating: 4.4,
    reviewCount: 67,
    inStock: true,
    features: [
      'Ergonomic grip for steady application',
      'Precision curved tips for exact placement',
      'Works with strip and individual lashes',
      'Stainless steel construction',
      'Easy to clean and sanitize'
    ],
    specifications: {
      'Material': 'Stainless steel',
      'Length': '11cm',
      'Tip': 'Curved precision',
      'Weight': '18g',
      'Included': 'Applicator + storage case'
    },
    seo: {
      title: 'Precision Lash Applicator Tool | Lashmealex',
      description: 'Professional lash applicator with ergonomic grip and precision tips. Perfect for strip and individual lash application.'
    }
  },
  {
    id: '7',
    slug: 'individual-lash-extensions',
    name: 'Individual Lash Extensions',
    price: 22,
    description: 'Professional-grade individual lashes for custom, salon-quality looks at home. Mix and match lengths to create your perfect eye shape with seamless, natural-looking results.',
    images: ['/api/placeholder/600/600'],
    category: 'Lashes',
    rating: 4.8,
    reviewCount: 91,
    inStock: true,
    features: [
      'Mixed tray: 8mm, 10mm, 12mm, 14mm',
      'Ultra-lightweight 0.07mm thickness',
      'C-curl for natural lift',
      'Matte black finish blends with natural lashes',
      'Professional studio quality'
    ],
    specifications: {
      'Curl': 'C-curl',
      'Thickness': '0.07mm',
      'Lengths': '8mm / 10mm / 12mm / 14mm',
      'Count': '120 clusters per tray',
      'Material': 'Premium PBT fiber'
    },
    seo: {
      title: 'Individual Lash Extensions | Lashmealex',
      description: 'Professional-grade individual lash extensions in mixed lengths. Create custom, salon-quality looks at home.'
    }
  },
  {
    id: '8',
    slug: 'lash-growth-serum',
    name: 'Lash Growth Serum',
    price: 35,
    description: 'Nourishing peptide serum that promotes natural lash growth and strengthens existing lashes. Apply nightly for visibly longer, thicker lashes in as little as 4 weeks.',
    images: ['/api/placeholder/600/600'],
    category: 'Aftercare',
    rating: 4.6,
    reviewCount: 158,
    inStock: false,
    features: [
      'Biotin and peptide-enriched formula',
      'Visible results in 4-6 weeks',
      'Gentle enough for sensitive eyes',
      'Strengthens and conditions existing lashes',
      'Precision brush applicator'
    ],
    specifications: {
      'Volume': '5ml',
      'Key Ingredients': 'Biotin, peptides, panthenol',
      'Application': 'Nightly along lash line',
      'Results': '4-6 weeks for visible growth',
      'Included': 'Serum with precision applicator'
    },
    seo: {
      title: 'Lash Growth Serum | Lashmealex',
      description: 'Peptide-enriched lash growth serum for longer, thicker natural lashes. Visible results in 4-6 weeks.'
    }
  }
];

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = products.find(p => p.slug === resolvedParams.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.'
    };
  }

  return {
    title: product.seo?.title || `${product.name} | Lashmealex Shop`,
    description: product.seo?.description || product.description,
    openGraph: {
      title: product.name,
      description: product.seo?.description || product.description,
      images: product.images ? [product.images[0]] : [],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.seo?.description || product.description,
      images: product.images ? [product.images[0]] : []
    }
  };
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const product = products.find(p => p.slug === resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}
