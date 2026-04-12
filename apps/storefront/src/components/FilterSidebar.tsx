'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

export interface FilterOptions {
  category: string[];
  priceRange: [number, number];
  lashType: string[];
  brand: string[];
  inStock: boolean;
  onSale: boolean;
}

interface FilterSidebarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onClose: () => void;
  maxPrice?: number;
}

const categories = [
  { id: 'lashes', label: 'Lashes', count: 3 },
  { id: 'adhesives', label: 'Adhesives', count: 1 },
  { id: 'tools', label: 'Tools', count: 1 },
  { id: 'aftercare', label: 'Aftercare', count: 2 },
  { id: 'kits', label: 'Kits', count: 1 }
];

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-line pb-4 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-left hover:text-pink transition-colors"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h3>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
  count,
  disabled = false
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
  disabled?: boolean;
}) {
  return (
    <label
      className={clsx(
        'flex items-center justify-between py-2 cursor-pointer',
        'hover:text-pink transition-colors',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={clsx(
            'w-4 h-4 rounded border-2 bg-transparent transition-colors focus-ring',
            'border-line',
            checked && 'border-pink bg-pink',
            disabled && 'cursor-not-allowed'
          )}
        />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted">({count})</span>
      )}
    </label>
  );
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  isOpen,
  onClose,
  maxPrice = 100
}: FilterSidebarProps) {
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.category, categoryId]
      : filters.category.filter(id => id !== categoryId);
    onFiltersChange({ ...filters, category: newCategories });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: [],
      priceRange: [0, maxPrice],
      lashType: [],
      brand: [],
      inStock: false,
      onSale: false
    });
  };

  const hasActiveFilters = 
    filters.category.length > 0 ||
    filters.inStock ||
    filters.onSale;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-modal-backdrop lg:hidden backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={clsx(
          'fixed top-0 left-0 h-full w-80 z-modal bg-white border-r border-foreground',
          'transform transition-transform duration-300',
          'lg:relative lg:transform-none lg:z-auto lg:w-full lg:h-auto lg:border-none lg:bg-transparent lg:sticky lg:top-28',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-full lg:h-auto flex flex-col">
          <div className="flex items-center justify-between p-8 border-b border-foreground lg:border-b lg:border-foreground lg:px-0 lg:pt-0 lg:pb-8 lg:mb-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-foreground">Filters</h2>
            <div className="flex items-center gap-4">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] font-bold uppercase tracking-widest text-pink-dark transition-colors hover:text-pink underline underline-offset-4"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="focus-ring p-2 text-foreground transition-colors hover:text-pink-dark lg:hidden"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex-1 overflow-y-auto p-8 lg:px-0 lg:py-6 space-y-10">
            <FilterSection title="Category">
              {categories.map((category) => (
                <Checkbox
                  key={category.id}
                  label={category.label}
                  checked={filters.category.includes(category.id)}
                  onChange={(checked) => handleCategoryChange(category.id, checked)}
                  count={category.count}
                />
              ))}
            </FilterSection>

            <FilterSection title="Availability">
              <Checkbox
                label="In Stock Only"
                checked={filters.inStock}
                onChange={(checked) => onFiltersChange({ ...filters, inStock: checked })}
              />
              <Checkbox
                label="On Sale"
                checked={filters.onSale}
                onChange={(checked) => onFiltersChange({ ...filters, onSale: checked })}
              />
            </FilterSection>
          </div>

          {/* Footer - fixed on mobile, inline on desktop */}
          <div className="p-8 border-t border-foreground bg-white lg:px-0 lg:pt-6 lg:pb-0 lg:border-t lg:border-foreground lg:bg-transparent">
            <button
              onClick={onClose}
              className="w-full btn-primary lg:hidden"
            >
              Apply Selection
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="hidden lg:block w-full text-center text-[10px] font-bold uppercase tracking-widest text-pink-dark transition-colors hover:text-pink underline underline-offset-4 mt-2"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
