'use client';

import { useState, useMemo } from 'react';
import ProductCard from '../../../components/ProductCard';
import { Product } from './page';
import { SlidersHorizontal, X, Search } from 'lucide-react';

const GRADIENT = 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)';

interface ShopPageClientProps {
  products: Product[];
}

type ProductWithSlug = Product & {
  slug: string;
  regular_price: string;
};

type SortOption = 'name' | 'price-low' | 'price-high';

interface PriceRange {
  min: string;
  max: string;
}

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^\d.]/g, '')) || 0;
}

export default function ShopPageClient({ products }: ShopPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => p.categories?.forEach((c) => cats.add(c.name)));
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedCategory && !product.categories?.some((c) => c.name === selectedCategory)) return false;
      if (priceRange.min || priceRange.max) {
        const price = parsePrice(product.price);
        if (priceRange.min && price < parseFloat(priceRange.min)) return false;
        if (priceRange.max && price > parseFloat(priceRange.max)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return parsePrice(a.price) - parsePrice(b.price);
        case 'price-high': return parsePrice(b.price) - parsePrice(a.price);
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
  };

  const hasActiveFilters = !!(searchTerm || selectedCategory || priceRange.min || priceRange.max);

  const inputClass =
    'w-full px-4 py-2.5 border text-sm focus:outline-none focus:ring-2 transition-colors rounded-xl';

  return (
    <main className="min-h-screen font-sans" style={{ background: '#FFF6EF', color: '#2A0A22' }}>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden" style={{ background: GRADIENT }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 text-center relative z-10">
          <span className="inline-block mb-4 px-4 py-1.5 bg-white/20 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-full">
            All Products
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-serif text-white mb-4">
            Our <span className="text-white/80">Collection</span>
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-10">
            Explore our complete range of bags, pouches, and organisers — thoughtfully crafted and made in India.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white/15 border border-white/25 text-white focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all placeholder:text-white/40 rounded-xl backdrop-blur-sm text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-2.5 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all"
            style={{ background: GRADIENT }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Filter Products'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── SIDEBAR ── */}
          <aside className={`lg:w-60 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-28 space-y-6">

              <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-5 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2A0A22' }}>Filter Products</h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-[11px] font-bold uppercase tracking-wider hover:underline"
                      style={{ color: '#E11D74' }}
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#2A0A22', opacity: 0.5 }}>
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={inputClass}
                    style={{ borderColor: '#FFE9DD', background: '#FFF6EF', color: '#2A0A22' }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#2A0A22', opacity: 0.5 }}>
                    Price Range (₹)
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                      className={inputClass}
                      style={{ borderColor: '#FFE9DD', background: '#FFF6EF', color: '#2A0A22' }}
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                      className={inputClass}
                      style={{ borderColor: '#FFE9DD', background: '#FFF6EF', color: '#2A0A22' }}
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#2A0A22', opacity: 0.5 }}>
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className={inputClass}
                    style={{ borderColor: '#FFE9DD', background: '#FFF6EF', color: '#2A0A22' }}
                  >
                    <option value="name">Alphabetical (A–Z)</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                {/* Active Filter Tags */}
                {hasActiveFilters && (
                  <div className="pt-4 border-t border-[#FFE9DD] space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#2A0A22', opacity: 0.4 }}>Active Filters</p>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full text-white" style={{ background: GRADIENT }}>
                          &ldquo;{searchTerm}&rdquo; <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                        </span>
                      )}
                      {selectedCategory && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full text-white" style={{ background: GRADIENT }}>
                          {selectedCategory} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── PRODUCTS GRID ── */}
          <div className="flex-1">
            {/* Results bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: '#2A0A22', opacity: 0.6 }}>
                Showing <span className="font-bold" style={{ color: '#2A0A22', opacity: 1 }}>{filteredProducts.length}</span> of{' '}
                <span className="font-bold" style={{ color: '#2A0A22' }}>{products.length}</span> products
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: '#E11D74' }}
                >
                  Clear filters
                </button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-[#FFE9DD]">
                <Search className="w-12 h-12 mx-auto mb-4" style={{ color: '#FFE9DD' }} />
                <h3 className="text-lg font-bold font-serif mb-2" style={{ color: '#2A0A22' }}>No products found</h3>
                <p className="text-sm mb-6" style={{ color: '#2A0A22', opacity: 0.5 }}>
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 text-white text-sm font-bold rounded-full transition-colors"
                  style={{ background: GRADIENT }}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      slug: product.slug || `product-${product.id}`,
                    } as ProductWithSlug}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className="mt-16 py-16 relative overflow-hidden" style={{ background: GRADIENT }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center px-4 relative z-10">
          <p className="text-white text-[11px] font-bold uppercase tracking-[0.3em] mb-3">Need Help?</p>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-white mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-white/70 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Contact us and we&apos;ll help you find the perfect carry good or arrange a special order.
          </p>
          <a
            href="mailto:hello@thecurioshelf.in"
            className="inline-block px-8 py-3.5 bg-white text-sm font-bold uppercase tracking-widest rounded-full hover:bg-white/90 transition-colors shadow-lg"
            style={{ color: '#E11D74' }}
          >
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}
