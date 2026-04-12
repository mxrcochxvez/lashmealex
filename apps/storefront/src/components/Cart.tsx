'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { LoadingButton } from './LoadingStates';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export default function Cart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 25 ? 0 : 5; // Free shipping over $25
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    await onCheckout();
    setIsCheckingOut(false);
    onClose();
  };

  const incrementQuantity = (itemId: string) => {
    const item = items.find(item => item.id === itemId);
    if (item) {
      onUpdateQuantity(itemId, item.quantity + 1);
    }
  };

  const decrementQuantity = (itemId: string) => {
    const item = items.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      onUpdateQuantity(itemId, item.quantity - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-modal-backdrop backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Cart Sidebar */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-md z-modal bg-white border-l border-foreground"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-8 border-b border-foreground">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-foreground">
                    Your Bag ({items.length})
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="focus-ring p-2 text-foreground transition-colors hover:text-pink-dark"
                  aria-label="Close cart"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-8">
                {items.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingBag size={48} className="mx-auto mb-6 text-muted/30" />
                    <h3 className="mb-4 font-display text-3xl font-medium text-foreground">Your bag is empty</h3>
                    <p className="text-muted mb-10 text-sm">Discover our collection and start your beauty journey.</p>
                    <button
                      onClick={onClose}
                      className="btn-primary w-full"
                    >
                      Browse the Shop
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        className="space-y-4 border-b border-line pb-8 last:border-0"
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <div className="flex gap-6">
                          {/* Product Image */}
                          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center bg-[#f4f4f4]">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-center text-[10px] font-bold uppercase tracking-widest text-muted px-2">
                                {item.name.slice(0, 12)}
                              </span>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h4 className="font-display text-lg font-medium leading-tight text-foreground">
                                {item.name}
                              </h4>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{item.category}</p>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <span className="text-sm font-bold text-foreground">
                                ${item.price}
                              </span>

                              {/* Quantity Controls */}
                              <div className="flex items-center border border-foreground">
                                <button
                                  onClick={() => decrementQuantity(item.id)}
                                  disabled={item.quantity <= 1}
                                  className="focus-ring flex h-8 w-8 items-center justify-center bg-white text-foreground transition-colors hover:bg-foreground hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-foreground">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => incrementQuantity(item.id)}
                                  className="focus-ring flex h-8 w-8 items-center justify-center bg-white text-foreground transition-colors hover:bg-foreground hover:text-white"
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="focus-ring p-1 text-muted transition-colors hover:text-foreground self-start"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-foreground p-8 space-y-8 bg-background">
                  {/* Order Summary */}
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-muted">Subtotal</span>
                      <span className="text-foreground">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-muted">Pickup</span>
                      <span className="text-foreground">Free</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-4 border-t border-line">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">${subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <div className="space-y-4">
                    <LoadingButton
                      isLoading={isCheckingOut}
                      className="w-full btn-primary py-5"
                      onClick={handleCheckout}
                    >
                      Checkout Now
                    </LoadingButton>

                    <button
                      onClick={onClose}
                      className="w-full btn-secondary py-5"
                    >
                      Continue Shopping
                    </button>
                  </div>

                  {/* Pickup Info */}
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Fresno Salon Pickup</p>
                    <p className="text-[9px] uppercase tracking-widest text-muted/60">Ready in 2-4 Hours</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
