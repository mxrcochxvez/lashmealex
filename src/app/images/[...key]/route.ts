import { notFound } from 'next/navigation';

import { getProductImagesBucket } from '@/lib/cloudflare';

interface ProductImageRouteProps {
  params: Promise<{
    key: string[];
  }>;
}

/**
 * Streams a product image out of R2 through the app runtime.
 *
 * This route keeps storefront image URLs stable and local to the app, while
 * still storing the underlying assets in Cloudflare R2.
 *
 * @param _request The incoming request object.
 * @param context Route params containing the object key segments.
 * @returns A streamed image response or a 404 when the object does not exist.
 */
export async function GET(_request: Request, context: ProductImageRouteProps) {
  const { key } = await context.params;

  if (!key || key.length === 0) {
    notFound();
  }

  const objectKey = key.map((segment) => decodeURIComponent(segment)).join('/');
  const object = await getProductImagesBucket().get(objectKey);

  if (!object || !object.body) {
    notFound();
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  return new Response(object.body, {
    headers,
  });
}
