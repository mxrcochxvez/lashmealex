'use client';

import { useState } from 'react';
import Header from './Header';
import SearchModal from './SearchModal';
import Cart from './Cart';
import { useCart } from '@/context/CartContext';

interface SearchProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  slug?: string;
}

interface HeaderShellProps {
  products?: SearchProduct[];
}

export default function HeaderShell({ products = [] }: HeaderShellProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { items, isOpen, openCart, closeCart, updateQuantity, removeItem, itemCount } = useCart();

  return (
    <>
      <Header
        cartItemCount={itemCount}
        isSearchOpen={isSearchOpen}
        onSearchToggle={() => setIsSearchOpen((v) => !v)}
        onCartToggle={openCart}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={() => setIsSearchOpen(false)}
        products={products}
      />
      <Cart
        isOpen={isOpen}
        onClose={closeCart}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={async () => closeCart()}
      />
    </>
  );
}
