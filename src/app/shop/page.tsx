import ShopClient from './ShopClient';

import { listStoreProducts } from '@/lib/catalog';

interface ShopPageProps {
  searchParams?: Promise<{
    category?: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;
  const products = await listStoreProducts();

  return (
    <ShopClient
      initialProducts={products}
      initialCategory={resolvedSearchParams?.category}
    />
  );
}
