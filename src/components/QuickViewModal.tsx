'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star, ChevronLeft, ChevronRight, Share2, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { LoadingButton } from './LoadingStates';
import type { ProductCardProduct } from './ProductCard';
import type { StoreVariant } from '@/lib/catalog';

interface Product extends ProductCardProduct {
  images?: string[];
  features?: string[];
  specifications?: Record<string, string>;
  reviewCount?: number;
  variants?: StoreVariant[];
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted?: boolean;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false
}: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSelectedVariantId(product?.variants?.[0]?.id ?? '');
    setQuantity(1);
  }, [product]);

  if (!product) return null;

  const variants = product.variants ?? [];
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
  const images = product.images || [];
  const hasMultipleImages = images.length > 1;
  const productUrl = `/products/${product.slug}`;
  const activePrice = selectedVariant?.price ?? product.price;
  const activeCompareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const activeInStock = selectedVariant?.inStock ?? product.inStock;
  const cartProduct: Product = selectedVariant
    ? {
        ...product,
        id: selectedVariant.id,
        slug: selectedVariant.slug,
        name: `${product.name} ${selectedVariant.variantName ?? ''}`.trim(),
        price: selectedVariant.price,
        compareAtPrice: selectedVariant.compareAtPrice,
        image: selectedVariant.image ?? product.image,
        inStock: selectedVariant.inStock,
      }
    : product;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    await onAddToCart(cartProduct, quantity);
    setIsAddingToCart(false);
    onClose();
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-4 lg:inset-8 z-modal flex items-center justify-center p-4 lg:p-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={onClose}
          >
            <div 
              className="relative glass-heavy flex w-full max-w-4xl flex-col overflow-hidden rounded-[40px] lg:flex-row lg:h-[560px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button — removed from absolute position, placed inline in header below */}

              {/* Product Images */}
              <div className="relative bg-gradient-to-br from-[#f7e6df] via-[#fff7f3] to-[#ecd3ca] lg:w-[45%] lg:h-full">
                {images.length > 0 ? (
                  <>
                    <div className="aspect-square lg:aspect-auto lg:h-full flex items-center justify-center p-8">
                      <motion.img
                        key={currentImageIndex}
                        src={images[currentImageIndex]}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>

                    {/* Image Navigation */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={handlePreviousImage}
                          className="focus-ring absolute left-8 top-1/2 -translate-y-1/2 rounded-full bg-white/84 p-3 text-foreground transition-colors hover:text-pink-dark shadow-md"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="focus-ring absolute right-8 top-1/2 -translate-y-1/2 rounded-full bg-white/84 p-3 text-foreground transition-colors hover:text-pink-dark shadow-md"
                          aria-label="Next image"
                        >
                          <ChevronRight size={24} />
                        </button>
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={clsx(
                                'w-3 h-3 rounded-full transition-all duration-300',
                                index === currentImageIndex ? 'bg-pink-dark w-6' : 'bg-white/50 hover:bg-white/80'
                              )}
                              aria-label={`Go to image ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="aspect-square lg:aspect-auto lg:h-full flex items-center justify-center p-12">
                    <div className="text-center">
                      <div className="w-40 h-40 bg-gradient-to-br from-pink/20 to-transparent rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl font-display text-foreground">
                          {product.name.split(' ').slice(0, 2).join(' ')}
                        </span>
                      </div>
                      <p className="text-muted text-lg">Product image coming soon</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-white/40 backdrop-blur-md">
                <div className="space-y-6 lg:space-y-8">
                  {/* Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-pink-dark">
                          {product.category}
                        </p>
                        <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground lg:text-4xl">
                          {product.name}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onToggleWishlist(product.id)}
                          className="focus-ring rounded-full border border-line bg-white p-3 text-foreground transition-all hover:scale-110 hover:text-pink-dark shadow-sm"
                          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart
                            size={18}
                            className={clsx('transition-colors', isWishlisted && 'fill-pink-dark text-pink-dark')}
                          />
                        </button>
                        <button
                          onClick={onClose}
                          className="focus-ring rounded-full border border-line bg-white p-3 text-foreground transition-all hover:bg-foreground hover:text-background shadow-sm"
                          aria-label="Close quick view"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              className={clsx(
                                i < Math.floor(product.rating!)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-line'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest text-muted">
                          {product.rating} ({product.reviewCount || 0} reviews)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold tracking-tight text-foreground">
                      ${activePrice}
                    </span>
                    {activeCompareAtPrice && activeCompareAtPrice > activePrice && (
                      <>
                        <span className="text-2xl text-muted line-through opacity-50">
                          ${activeCompareAtPrice}
                        </span>
                        <span className="bg-pink px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
                          Save ${activeCompareAtPrice - activePrice}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Description</h3>
                    <p className="text-lg leading-relaxed text-muted">
                      {product.description}
                    </p>
                  </div>

                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Key Features</h3>
                      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-4 group">
                            <div className="h-1.5 w-1.5 flex-shrink-0 bg-pink transition-all group-hover:w-4" />
                            <span className="text-sm font-medium text-muted">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Add to Cart Section */}
                  <div className="space-y-6 border-t border-line pt-6">
                    {variants.length > 0 && (
                      <div className="space-y-3">
                        <label
                          htmlFor="quickview-variant"
                          className="block text-xs font-bold uppercase tracking-[0.2em] text-foreground"
                        >
                          Select Tray Size + Curl
                        </label>
                        <select
                          id="quickview-variant"
                          value={selectedVariant?.id ?? ''}
                          onChange={(event) => setSelectedVariantId(event.target.value)}
                          className="w-full border border-line bg-white px-4 py-4 text-sm text-foreground outline-none"
                        >
                          {variants.map((variant) => (
                            <option key={variant.id} value={variant.id}>
                              {(variant.variantName ?? variant.name)} · ${variant.price} ·{' '}
                              {variant.inStock ? `${variant.inventory} in stock` : 'Out of stock'}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Quantity</span>
                      <div className="flex items-center gap-4 border border-line p-1">
                        <button
                          onClick={decrementQuantity}
                          disabled={quantity <= 1}
                          className="focus-ring flex h-10 w-10 items-center justify-center bg-transparent text-foreground transition-colors hover:bg-line disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-foreground">
                          {quantity}
                        </span>
                        <button
                          onClick={incrementQuantity}
                          className="focus-ring flex h-10 w-10 items-center justify-center bg-transparent text-foreground transition-colors hover:bg-line"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <LoadingButton
                        isLoading={isAddingToCart}
                        disabled={!activeInStock}
                        className={clsx(
                          'w-full py-5 text-sm font-bold uppercase tracking-[0.3em] transition-all',
                          activeInStock ? 'btn-primary' : 'cursor-not-allowed bg-line text-muted'
                        )}
                        onClick={handleAddToCart}
                      >
                        {activeInStock ? 'Add to Bag' : 'Out of Stock'}
                      </LoadingButton>
                      
                      <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                        <div className="h-1 w-1 rounded-full bg-pink" />
                        Ready for Fresno pickup in 2-4 hours
                        <div className="h-1 w-1 rounded-full bg-pink" />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <Link
                          href={productUrl}
                          className="flex-1 btn-secondary py-4 text-center text-[10px]"
                          onClick={onClose}
                        >
                          View Full Details
                        </Link>
                        <button
                          onClick={async () => {
                            const fullUrl = `${window.location.origin}${productUrl}`;
                            await navigator.clipboard.writeText(fullUrl);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="flex h-[52px] w-[52px] items-center justify-center border border-foreground text-foreground transition-all hover:bg-foreground hover:text-background"
                          aria-label="Share product"
                        >
                          {copied ? <Check size={16} /> : <Share2 size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
