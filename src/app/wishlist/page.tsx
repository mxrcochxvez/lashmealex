'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, X } from 'lucide-react';
import HeaderShell from '../../components/HeaderShell';
import ProductCard from '../../components/ProductCard';
import { LoadingButton, FadeIn } from '../../components/LoadingStates';
import type { ProductCardProduct } from '../../components/ProductCard';

// Mock wishlist products
type WishlistItem = ProductCardProduct;

interface WishlistCartItem extends ProductCardProduct {
  quantity: number;
}

const wishlistProducts: WishlistItem[] = [
  {
    id: '1',
    slug: 'lashmealex-luxe-strip-set',
    name: 'Lashmealex Luxe Strip Set',
    price: 18,
    compareAtPrice: 24,
    description: 'Soft-volume lash set for everyday wear',
    category: 'Lashes',
    rating: 4.8,
    inStock: true,
    image: '/api/placeholder/300/300'
  },
  {
    id: '3',
    slug: 'lash-care-essentials-kit',
    name: 'Lash Care Essentials Kit',
    price: 32,
    compareAtPrice: 40,
    description: 'Brush, cleanser, and aftercare for extensions',
    category: 'Aftercare',
    rating: 4.9,
    inStock: true,
    image: '/api/placeholder/300/300'
  },
  {
    id: '5',
    slug: 'magnetic-lash-collection',
    name: 'Magnetic Lash Collection',
    price: 28,
    description: 'Easy-to-apply magnetic lashes',
    category: 'Lashes',
    rating: 4.5,
    inStock: true,
    image: '/api/placeholder/300/300'
  }
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(wishlistProducts);
  const [cartItems, setCartItems] = useState<WishlistCartItem[]>([]);
  const [isAddingAllToCart, setIsAddingAllToCart] = useState(false);

  const handleAddToCart = (product: WishlistItem, quantity = 1) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity }]);
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== productId));
  };

  const handleAddAllToCart = async () => {
    setIsAddingAllToCart(true);
    
    // Simulate adding all items to cart
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    wishlistItems.forEach(product => {
      handleAddToCart(product);
    });
    
    setIsAddingAllToCart(false);
    setWishlistItems([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderShell
        wishlistItemCount={wishlistItems.length}
      />

      <main className="w-full px-6 py-16 sm:px-12 lg:px-20 lg:py-24">
        {/* Page Header */}
        <FadeIn>
          <div className="mb-20 border-b border-foreground pb-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
              Saved for Later
            </p>
            <div className="mt-10 flex items-baseline justify-between">
              <h1 className="font-display text-5xl font-medium tracking-tighter text-foreground lg:text-8xl">
                My Wishlist.
              </h1>
              <Heart size={40} className="text-foreground hidden sm:block" />
            </div>
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted">
              Your saved products — ready to add to bag whenever you are.
            </p>
          </div>
        </FadeIn>

        {wishlistItems.length === 0 ? (
          // Empty Wishlist State
          <FadeIn delay={0.2}>
            <div className="text-center py-40 border border-dashed border-line">
              <div className="flex items-center justify-center mb-12">
                <Heart size={64} className="text-muted/30" />
              </div>
              <h2 className="font-display text-4xl font-medium text-foreground mb-6">
                Your Wishlist is Empty
              </h2>
              <p className="text-muted mb-16 max-w-md mx-auto text-lg">
                Discover our professional lash collection and save your favorites here.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/shop" className="btn-primary min-w-[240px]">
                  Start Shopping
                </Link>
                <Link href="/" className="btn-secondary min-w-[240px]">
                  Return Home
                </Link>
              </div>
            </div>
          </FadeIn>
        ) : (
          // Wishlist Items
          <div className="space-y-16">
            {/* Actions Bar */}
            <FadeIn delay={0.2}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-10 p-12 border border-foreground bg-white">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'} Saved
                  </p>
                  <p className="mt-4 text-3xl font-bold text-foreground">
                    Total: ${wishlistItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex w-full sm:w-auto">
                  <LoadingButton
                    isLoading={isAddingAllToCart}
                    className="btn-primary w-full sm:w-auto min-w-[240px]"
                    onClick={handleAddAllToCart}
                  >
                    Add All to Bag
                  </LoadingButton>
                </div>
              </div>
            </FadeIn>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {wishlistItems.map((product, index) => (
                <FadeIn key={product.id} delay={index * 0.1}>
                  <div className="relative group">
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleRemoveFromWishlist}
                      isWishlisted={true}
                    />
                    
                    {/* Quick Remove Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="absolute top-6 left-6 p-2.5 bg-white/90 border border-foreground text-foreground hover:bg-foreground hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Remove from wishlist"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Wishlist Summary */}
            <FadeIn delay={0.4}>
              <div className="border border-foreground bg-white p-16 text-center">
                <h3 className="font-display text-4xl font-medium text-foreground mb-8">
                  Ready to Checkout?
                </h3>
                <p className="text-muted mb-12 max-w-2xl mx-auto text-lg">
                  Add your favorites to the bag and complete your order.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <LoadingButton
                    isLoading={isAddingAllToCart}
                    className="btn-primary min-w-[240px]"
                    onClick={handleAddAllToCart}
                  >
                    Add All to Bag
                  </LoadingButton>
                  <Link href="/shop" className="btn-secondary min-w-[240px]">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        )}
      </main>


      {/* Cart Component - would need to be imported and implemented */}
      {/* <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      /> */}
    </div>
  );
}
