'use client';

import { useState, useMemo } from 'react';
import ProductCard from '../../../components/ProductCard';
import { Product } from './page';
import { SlidersHorizontal, X, Search, ShoppingBag, Mail } from 'lucide-react';

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
    'w-full px-4 py-2.5 border border-[#E8E6E1] bg-white text-sm text-[#2A2825] focus:outline-none focus:border-[#B86B52] transition-colors rounded-none font-light';

  return (
    <main className="min-h-screen bg-[#FAFAF8] font-sans">

      {/* ── HERO / HEADER ── */}
      <div className="bg-[#F7F5F0] border-b border-[#E8E6E1]">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-8 h-[1px] bg-[#B86B52]" />
            <span className="text-xs font-semibold text-[#B86B52] uppercase tracking-[0.2em]">Curation</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-light text-[#2A2825] mb-6">
            The Shop <span className="italic">Collection</span>
          </h1>
          <p className="text-[#6B665E] text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-10 font-light">
            Thoughtfully selected decor and gifts, designed to bring a sense of calm and beauty to your everyday living.
          </p>

          {/* Minimalist Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A09B]" />
            <input
              type="text"
              placeholder="Search the collection..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white border border-[#E8E6E1] text-sm text-[#2A2825] focus:outline-none focus:border-[#2A2825] transition-all placeholder:text-[#A3A09B] font-light shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A09B] hover:text-[#B86B52]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-3 px-6 py-3 bg-[#2A2825] text-white text-xs font-medium uppercase tracking-widest transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Filter Collection'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── SIDEBAR ── */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-28 space-y-8">
              
              <div className="flex items-center justify-between border-b border-[#E8E6E1] pb-4">
                <h2 className="text-[10px] font-bold text-[#2A2825] uppercase tracking-[0.2em]">Refine By</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[10px] text-[#B86B52] font-bold uppercase tracking-widest hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold text-[#A3A09B] uppercase tracking-[0.2em] mb-4">
                  Category
                </label>
                <div className="space-y-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-[10px] font-bold text-[#A3A09B] uppercase tracking-[0.2em] mb-4">
                  Price Range (₹)
                </label>
                <div className="flex flex-col gap-3">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-[10px] font-bold text-[#A3A09B] uppercase tracking-[0.2em] mb-4">
                  Sort Order
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className={inputClass}
                >
                  <option value="name">Alphabetical (A–Z)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="pt-6 border-t border-[#E8E6E1] space-y-3">
                  <p className="text-[10px] font-bold text-[#A3A09B] uppercase tracking-[0.2em]">Currently Applied</p>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F7F5F0] border border-[#E8E6E1] text-[10px] text-[#2A2825] uppercase tracking-wider">
                        "{searchTerm}" <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                      </span>
                    )}
                    {selectedCategory && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F7F5F0] border border-[#E8E6E1] text-[10px] text-[#2A2825] uppercase tracking-wider">
                        {selectedCategory} <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ── PRODUCTS ── */}
          <div className="flex-1">
            {/* Results bar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8E6E1]">
              <p className="text-xs text-[#6B665E] tracking-widest uppercase">
                Showing <span className="text-[#2A2825] font-bold">{filteredProducts.length}</span> results
              </p>
              <div className="hidden sm:block h-[1px] flex-1 mx-8 bg-[#E8E6E1]" />
              <p className="hidden sm:block text-[10px] text-[#A3A09B] uppercase tracking-[0.2em]">
                {products.length} Items Total
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-white border border-[#E8E6E1]">
                <div className="w-12 h-12 bg-[#F7F5F0] flex items-center justify-center mx-auto mb-6">
                  <Search className="w-5 h-5 text-[#A3A09B]" />
                </div>
                <h3 className="text-lg font-serif text-[#2A2825] mb-2 font-light">No matches found</h3>
                <p className="text-xs text-[#6B665E] mb-8 font-light tracking-wide">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-[#2A2825] text-white text-[11px] font-medium uppercase tracking-widest hover:bg-[#403D39] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
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

      {/* ── CONTACT SECTION (Earthy Palette) ── */}
      <div className="mt-20 bg-[#2A2825] py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <p className="text-[#A88C7D] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Customer Care</p>
          <h2 className="text-2xl md:text-3xl font-serif font-light text-white mb-6">Need styling assistance?</h2>
          <p className="text-[#D5D2CC] text-sm mb-10 max-w-md mx-auto leading-relaxed font-light">
            Our interior experts are available to help you choose the perfect pieces for your unique space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@kdbookbazaar.com"
              className="px-8 py-4 bg-[#B86B52] text-white text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-[#A35A44] transition-colors"
            >
              Email Consultant
            </a>
            <a
              href="https://wa.me/919911636888"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-white/20 text-white text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-white hover:text-[#2A2825] transition-colors"
            >
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}