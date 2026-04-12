'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { LoadingButton } from './LoadingStates';

interface Product {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  images?: string[];
  category: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  features?: string[];
  specifications?: Record<string, string>;
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
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (!product) return null;

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    await onAddToCart(product, quantity);
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
            className="fixed inset-4 lg:inset-8 z-modal flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="glass-heavy flex max-h-full w-full max-w-7xl flex-col overflow-hidden rounded-[40px] lg:flex-row">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="focus-ring absolute right-6 top-6 z-10 rounded-full bg-white/84 p-2.5 text-foreground transition-colors hover:text-pink-dark shadow-lg"
                aria-label="Close quick view"
              >
                <X size={24} />
              </button>

              {/* Product Images */}
              <div className="relative bg-gradient-to-br from-[#f7e6df] via-[#fff7f3] to-[#ecd3ca] lg:w-[55%]">
                {images.length > 0 ? (
                  <>
                    <div className="aspect-square lg:aspect-auto lg:h-full flex items-center justify-center p-12 lg:p-16">
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
              <div className="flex-1 p-10 lg:p-16 overflow-y-auto bg-white/40 backdrop-blur-md">
                <div className="space-y-10">
                  {/* Header */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-pink-dark">
                          {product.category}
                        </p>
                        <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-foreground lg:text-5xl">
                          {product.name}
                        </h2>
                      </div>
                      <button
                        onClick={() => onToggleWishlist(product.id)}
                        className="focus-ring rounded-full border border-line bg-white p-4 text-foreground transition-all hover:scale-110 hover:text-pink-dark shadow-sm"
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart
                          size={24}
                          className={clsx(
                            'transition-colors',
                            isWishlisted && 'fill-pink-dark text-pink-dark'
                          )}
                        />
                      </button>
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
                      ${product.price}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <>
                        <span className="text-2xl text-muted line-through opacity-50">
                          ${product.compareAtPrice}
                        </span>
                        <span className="bg-pink px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
                          Save ${product.compareAtPrice - product.price}
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
                  <div className="space-y-8 border-t border-line pt-10">
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
                        disabled={!product.inStock}
                        className={clsx(
                          'w-full py-5 text-sm font-bold uppercase tracking-[0.3em] transition-all',
                          product.inStock ? 'btn-primary' : 'cursor-not-allowed bg-line text-muted'
                        )}
                        onClick={handleAddToCart}
                      >
                        {product.inStock ? 'Add to Bag' : 'Out of Stock'}
                      </LoadingButton>
                      
                      <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                        <div className="h-1 w-1 rounded-full bg-pink" />
                        Ready for Fresno pickup in 2-4 hours
                        <div className="h-1 w-1 rounded-full bg-pink" />
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
