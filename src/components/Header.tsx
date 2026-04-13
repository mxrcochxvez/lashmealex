'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ShoppingBag, Menu, X, Heart, User, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

interface HeaderProps {
  cartItemCount?: number;
  wishlistItemCount?: number;
  onSearchToggle?: () => void;
  onCartToggle?: () => void;
  onMenuToggle?: () => void;
  isSearchOpen?: boolean;
  isCartOpen?: boolean;
  isMenuOpen?: boolean;
}

const navigationItems = [
  { label: 'Shop', href: '/shop' },
];



export default function Header({
  cartItemCount = 0,
  wishlistItemCount = 0,
  onSearchToggle,
  onCartToggle,
  onMenuToggle,
  isSearchOpen = false,
  isCartOpen = false,
  isMenuOpen = false,
}: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  const isActiveRoute = (href: string) => {
    const [basePath] = href.split('#');

    if (!basePath || basePath === '/') {
      return pathname === '/';
    }

    return pathname === basePath || pathname.startsWith(`${basePath}/`);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-sticky transition-all duration-300',
          isScrolled ? 'border-b border-foreground bg-background' : 'bg-transparent'
        )}
      >
        <div className="mx-auto flex h-16 w-full items-center justify-between px-6 sm:px-12 lg:h-24 lg:px-20">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="focus-ring p-2 text-foreground transition-colors hover:text-pink-dark lg:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link href="/" className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center bg-foreground text-xs font-bold uppercase tracking-[0.2em] text-white">
                LM
              </div>
              <div className="hidden sm:block">
                <p className="font-display text-3xl leading-none text-foreground tracking-tighter">lashmealex</p>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-10 lg:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  'relative text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-pink-dark',
                  isActiveRoute(item.href) ? 'text-pink-dark' : 'text-foreground'
                )}
              >
                {item.label}
                {isActiveRoute(item.href) && (
                  <span className="absolute -bottom-2 left-0 h-px w-full bg-pink-dark" aria-hidden="true" />
                )}
              </Link>
            ))}

          </nav>

          <div className="hidden lg:block h-6 w-px bg-line mx-2" aria-hidden="true" />

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onSearchToggle}
              className={clsx(
                'focus-ring p-2 text-foreground transition-colors hover:text-pink-dark',
                isSearchOpen && 'text-pink-dark'
              )}
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            <button className="relative p-2 text-foreground transition-colors hover:text-pink-dark focus-ring">
              <Heart size={19} />
              {wishlistItemCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center bg-foreground text-[9px] font-bold text-white">
                  {wishlistItemCount}
                </span>
              )}
            </button>

            <button
              onClick={onCartToggle}
              className={clsx(
                'relative p-2 text-foreground transition-colors hover:text-pink-dark focus-ring',
                isCartOpen && 'text-pink-dark'
              )}
              aria-label="Shopping cart"
            >
              <ShoppingBag size={19} />
              {cartItemCount > 0 && (
                <motion.span
                  className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center bg-foreground text-[9px] font-bold text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {cartItemCount}
                </motion.span>
              )}
            </button>

            <button className="hidden p-2 text-foreground transition-colors hover:text-pink-dark focus-ring sm:flex">
              <User size={19} />
            </button>

            <a
              href="https://lashmealex.glossgenius.com/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 border border-foreground bg-transparent px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-foreground transition-all hover:bg-foreground hover:text-background sm:inline-flex"
            >
              <Calendar size={13} />
              Book
            </a>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="border-t border-foreground bg-background lg:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="space-y-6 px-5 py-8 sm:px-7">
                {navigationItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={clsx(
                      'block border-l-2 pl-4 text-sm font-bold uppercase tracking-[0.2em] transition-colors hover:text-pink-dark',
                      isActiveRoute(item.href)
                        ? 'border-pink-dark text-pink-dark'
                        : 'border-transparent text-foreground'
                    )}
                    onClick={() => onMenuToggle?.()}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="border-t border-line pt-6">
                  <Link href="/shop" className="btn-primary w-full" onClick={() => onMenuToggle?.()}>
                    Shop products
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
