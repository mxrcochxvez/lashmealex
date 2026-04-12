'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import Header from '../../components/Header';
import ProductCard from '../../components/ProductCard';
import FilterSidebar, { FilterOptions } from '../../components/FilterSidebar';
import SearchModal from '../../components/SearchModal';
import QuickViewModal from '../../components/QuickViewModal';
import Cart from '../../components/Cart';
import { LoadingButton, ProductCardSkeleton, FadeIn } from '../../components/LoadingStates';
import { clsx } from 'clsx';

// Mock product data
const products = [
  {
    id: '1',
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
    id: '2',
    name: 'Pro Bond + Seal Duo',
    price: 24,
    description: 'Salon-grade hold and clean finish',
    category: 'Adhesives',
    rating: 4.6,
    inStock: true,
    image: '/api/placeholder/300/300'
  },
  {
    id: '3',
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
    id: '4',
    name: 'Glow Up Brow + Lash Bundle',
    price: 45,
    description: 'Complete brow and lash routine in one box',
    category: 'Kits',
    rating: 4.7,
    inStock: true,
    image: '/api/placeholder/300/300'
  },
  {
    id: '5',
    name: 'Magnetic Lash Collection',
    price: 28,
    description: 'Easy-to-apply magnetic lashes',
    category: 'Lashes',
    rating: 4.5,
    inStock: true,
    image: '/api/placeholder/300/300'
  },
  {
    id: '6',
    name: 'Precision Lash Applicator',
    price: 12,
    description: 'Professional tool for perfect application',
    category: 'Tools',
    rating: 4.4,
    inStock: true,
    image: '/api/placeholder/300/300'
  },
  {
    id: '7',
    name: 'Individual Lash Extensions',
    price: 22,
    description: 'Professional-grade individual lashes',
    category: 'Lashes',
    rating: 4.8,
    inStock: true,
    image: '/api/placeholder/300/300'
  },
  {
    id: '8',
    name: 'Lash Growth Serum',
    price: 35,
    description: 'Nourishing serum for natural lash growth',
    category: 'Aftercare',
    rating: 4.6,
    inStock: false,
    image: '/api/placeholder/300/300'
  }
];

export default function ShopPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    category: [],
    priceRange: [0, 100],
    lashType: [],
    brand: [],
    inStock: false,
    onSale: false
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter products based on current filters
  const filteredProducts = products.filter(product => {
    if (filters.category.length > 0 && !filters.category.includes(product.category.toLowerCase())) {
      return false;
    }
    if (filters.priceRange[0] > 0 && product.price < filters.priceRange[0]) {
      return false;
    }
    if (filters.priceRange[1] < 100 && product.price > filters.priceRange[1]) {
      return false;
    }
    if (filters.inStock && !product.inStock) {
      return false;
    }
    if (filters.onSale && !product.compareAtPrice) {
      return false;
    }
    return true;
  });

  const handleAddToCart = (product: any, quantity = 1) => {
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

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveFromCart(itemId);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleQuickView = (product: any) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCheckout = () => {
    // Implement checkout logic
    console.log('Proceeding to checkout...');
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemCount={cartItemCount}
        wishlistItemCount={wishlist.length}
        onSearchToggle={() => setIsSearchOpen(true)}
        onCartToggle={() => setIsCartOpen(true)}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        isSearchOpen={isSearchOpen}
        isCartOpen={isCartOpen}
        isMenuOpen={isMenuOpen}
      />

      <main className="w-full px-6 py-16 sm:px-12 lg:px-20 lg:py-24">
        <FadeIn>
          <section className="mb-20">
            <div className="space-y-8 max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-pink-dark">
                All Products
              </p>
              <h1 className="font-display text-5xl font-medium tracking-tighter text-foreground lg:text-7xl">
                The Collection.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted">
                Lashes, adhesives, aftercare, and tools — everything you need for a flawless look.
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-12">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="btn-secondary flex w-full items-center justify-center gap-2"
          >
            <Filter size={18} />
            Show Filters
            {Object.values(filters).some((value, index) => 
              index < 5 && (Array.isArray(value) ? value.length > 0 : value === true)
            ) && (
              <span className="w-1.5 h-1.5 bg-pink" />
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start gap-16">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              isOpen={true}
              onClose={() => {}}
              maxPrice={100}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <FadeIn delay={0.2}>
              <div className="mb-12 flex flex-col gap-8 border-b border-line pb-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-muted">
                  {filteredProducts.length} Results
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Sort:</span>
                  <select className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-foreground outline-none border-none cursor-pointer">
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </FadeIn>

            {/* Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))
              ) : (
                filteredProducts.map((product, index) => (
                  <FadeIn key={product.id} delay={index * 0.1}>
                    <ProductCard
                      product={product}
                      onQuickView={handleQuickView}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlist.includes(product.id)}
                    />
                  </FadeIn>
                ))
              )}
            </div>

            {/* No Results */}
            {!isLoading && filteredProducts.length === 0 && (
              <div className="text-center py-32 border border-dashed border-line">
                <h3 className="mb-6 font-display text-4xl font-medium text-foreground">No Products Found</h3>
                <p className="mb-12 text-muted">Refine your search or clear filters to see more.</p>
                <button
                  onClick={() => setFilters({
                    category: [],
                    priceRange: [0, 100],
                    lashType: [],
                    brand: [],
                    inStock: false,
                    onSale: false
                  })}
                  className="btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>


      {/* Mobile Filter Sidebar */}
      <div className="lg:hidden">
        <FilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          maxPrice={100}
        />
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={(query) => console.log('Search:', query)}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
      />

      {/* Cart Sidebar */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
