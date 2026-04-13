'use client';

import { useState } from 'react';
import Header from './Header';
import SearchModal from './SearchModal';

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
  cartItemCount?: number;
  wishlistItemCount?: number;
}

export default function HeaderShell({
  products = [],
  cartItemCount = 0,
  wishlistItemCount = 0,
}: HeaderShellProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Header
        cartItemCount={cartItemCount}
        wishlistItemCount={wishlistItemCount}
        isSearchOpen={isSearchOpen}
        isMenuOpen={isMenuOpen}
        onSearchToggle={() => setIsSearchOpen((v) => !v)}
        onMenuToggle={() => setIsMenuOpen((v) => !v)}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={() => setIsSearchOpen(false)}
        products={products}
      />
    </>
  );
}
