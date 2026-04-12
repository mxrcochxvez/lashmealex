'use client';

import { useState } from 'react';
import ProductCard, { type ProductCardProduct } from './ProductCard';
import QuickViewModal from './QuickViewModal';
import { FadeIn } from './LoadingStates';

interface ProductGridWithQuickViewProps {
  products: ProductCardProduct[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function ProductGridWithQuickView({
  products,
  columns = 4,
  className,
}: ProductGridWithQuickViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductCardProduct | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const handleQuickView = (product: ProductCardProduct) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = (product: ProductCardProduct, quantity = 1) => {
    // Future: integrate with cart state
    console.log('Add to cart:', product.name, 'qty:', quantity);
    setIsQuickViewOpen(false);
  };

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 xl:grid-cols-3',
    4: 'md:grid-cols-2 xl:grid-cols-4',
  };

  return (
    <>
      <div className={`grid gap-8 ${gridCols[columns]} ${className ?? ''}`}>
        {products.map((product, index) => (
          <FadeIn key={product.id} delay={index * 0.08}>
            <ProductCard
              product={product}
              onQuickView={handleQuickView}
              onToggleWishlist={handleToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
            />
          </FadeIn>
        ))}
      </div>

      <QuickViewModal
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={
          selectedProduct ? wishlist.includes(selectedProduct.id) : false
        }
      />
    </>
  );
}
