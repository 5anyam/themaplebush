'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, X, ShoppingBag, Sparkles, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../../lib/woocommerceApi';
import { productToSlug } from '../../../lib/slug';

const CATEGORIES = [
  { id: 'all', name: 'All Products', keywords: [] as string[] },
  { id: 'electronics', name: 'Electronics', keywords: ['electronics', 'gadget', 'device', 'cable', 'charger', 'earphone', 'headphone', 'speaker', 'power bank'] },
  { id: 'fashion', name: 'Fashion', keywords: ['shirt', 'dress', 'kurta', 'jeans', 'jacket', 'saree', 'top', 'clothing', 'wear', 'fashion', 'apparel'] },
  { id: 'home-decor', name: 'Home & Decor', keywords: ['home', 'decor', 'lamp', 'candle', 'vase', 'cushion', 'curtain', 'frame', 'wall art', 'rug', 'mat', 'plant', 'shelf'] },
  { id: 'kitchen', name: 'Kitchen', keywords: ['kitchen', 'cookware', 'utensil', 'pan', 'pot', 'bowl', 'plate', 'cup', 'mug', 'bottle', 'flask', 'tiffin'] },
  { id: 'beauty', name: 'Beauty & Care', keywords: ['beauty', 'skincare', 'haircare', 'cream', 'serum', 'shampoo', 'moisturizer', 'lipstick', 'makeup', 'perfume'] },
  { id: 'sports', name: 'Sports & Fitness', keywords: ['sports', 'fitness', 'gym', 'yoga', 'dumbbell', 'cycle', 'treadmill', 'protein', 'band', 'mat'] },
  { id: 'kids', name: 'Kids & Toys', keywords: ['kids', 'toy', 'baby', 'children', 'puzzle', 'board game', 'doll', 'lego', 'educational'] },
  { id: 'bags', name: 'Bags & Luggage', keywords: ['bag', 'backpack', 'handbag', 'purse', 'wallet', 'luggage', 'trolley', 'suitcase', 'pouch'] },
  { id: 'books', name: 'Books & Stationery', keywords: ['book', 'notebook', 'pen', 'stationery', 'diary', 'planner', 'art', 'craft', 'color'] },
];

interface Category {
  id: number;
  name: string;
  slug?: string;
}

interface ImageData {
  src: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  description?: string;
  short_description?: string;
  images: ImageData[];
  categories?: Category[];
}

function getQuery(): string {
  if (typeof window === 'undefined') return '';
  const p = new URLSearchParams(window.location.search);
  return p.get('q')?.trim() || '';
}

function detectCategory(productName: string, categories?: Category[]): string {
  const lowerName = productName.toLowerCase();
  const categoryNames = categories?.map((c) => c.name.toLowerCase()).join(' ') || '';
  const searchText = `${lowerName} ${categoryNames}`;

  for (const cat of CATEGORIES) {
    if (cat.id === 'all') continue;
    for (const keyword of cat.keywords) {
      if (searchText.includes(keyword)) return cat.id;
    }
  }
  return 'all';
}

function hasDiscount(product: Product): boolean {
  const price = parseFloat(product.price || '0');
  const regularPrice = parseFloat(product.regular_price || product.price || '0');
  return regularPrice > price;
}

function getDiscountPercentage(product: Product): number {
  if (!hasDiscount(product)) return 0;
  const price = parseFloat(product.price || '0');
  const regularPrice = parseFloat(product.regular_price || product.price || '0');
  return Math.round(((regularPrice - price) / regularPrice) * 100);
}

export default function SearchPage() {
  const [query, setQuery] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['all-products'],
    queryFn: async () => {
      const result = await fetchProducts();
      return (result || []) as Product[];
    },
    staleTime: 60_000,
    gcTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    const urlQuery = getQuery();
    setQuery(urlQuery);
    setSearchInput(urlQuery);
    const onPop = () => {
      const newQuery = getQuery();
      setQuery(newQuery);
      setSearchInput(newQuery);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const newUrl = `${window.location.pathname}?q=${encodeURIComponent(searchInput.trim())}`;
      window.history.pushState({}, '', newUrl);
      setQuery(searchInput.trim());
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setQuery('');
    window.history.pushState({}, '', window.location.pathname);
  };

  const results = useMemo(() => {
    if (!products || products.length === 0) return [];
    let filtered = products;

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const slugMatch = p.slug.toLowerCase().includes(q);
        const categoryMatch =
          p.categories?.some(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              (c.slug && c.slug.toLowerCase().includes(q))
          ) ?? false;
        const descMatch =
          (p.short_description?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)) ??
          false;
        return nameMatch || slugMatch || categoryMatch || descMatch;
      });
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter(
        (p) => detectCategory(p.name, p.categories) === activeCategory
      );
    }

    return filtered;
  }, [products, query, activeCategory]);

  const categoryCounts = useMemo(() => {
    if (!products) return {} as Record<string, number>;
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      const cat = detectCategory(p.name, p.categories);
      counts[cat] = (counts[cat] ?? 0) + 1;
    });
    return counts;
  }, [products]);

  // ── LOADING ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF6EF' }}>
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-[#FFE9DD] border-t-[#E11D74] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#E11D74' }} />
            </div>
          </div>
          <p className="text-sm" style={{ color: '#2A0A22', opacity: 0.5 }}>Loading products...</p>
        </div>
      </div>
    );
  }

  // ── ERROR ──
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF6EF' }}>
        <div className="text-center max-w-sm p-8 bg-white rounded-2xl border border-[#FFE9DD] shadow-sm">
          <h2 className="text-lg font-bold mb-2 font-serif" style={{ color: '#2A0A22' }}>Unable to Load Products</h2>
          <p className="text-sm" style={{ color: '#2A0A22', opacity: 0.5 }}>Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: '#FFF6EF', color: '#2A0A22' }}>

      {/* ── HERO / SEARCH HEADER ── */}
      <div style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }} className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-10 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-serif">
              Shop on <span className="text-white/80">The Curio Shelf</span>
            </h1>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mb-5">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full px-5 py-3.5 pl-12 pr-12 text-sm font-medium bg-white border-2 border-transparent focus:border-[#E11D74] focus:outline-none focus:ring-2 focus:ring-[#E11D74]/10 rounded-xl transition-all placeholder:text-gray-400 shadow-sm"
                style={{ color: '#2A0A22' }}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E11D74] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Results count + mobile filter */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/70">
              {query ? (
                <>
                  <span className="text-white font-semibold">{results.length}</span> results for{' '}
                  <span className="text-white font-semibold">&quot;{query}&quot;</span>
                </>
              ) : (
                <>
                  <span className="text-white font-semibold">{results.length}</span> products available
                </>
              )}
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 text-white text-xs font-semibold rounded-xl hover:bg-white/30 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── SIDEBAR ── */}
          <aside className={`lg:w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-8 space-y-4">

              {/* Categories */}
              <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-4">
                <h2 className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: '#2A0A22', opacity: 0.5 }}>
                  Categories
                </h2>
                <nav className="space-y-0.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-between ${
                        activeCategory === cat.id
                          ? 'text-white font-semibold'
                          : 'hover:bg-[#FFE9DD]'
                      }`}
                      style={
                        activeCategory === cat.id
                          ? { background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)', color: '#fff' }
                          : { color: '#2A0A22' }
                      }
                    >
                      <span>{cat.name}</span>
                      {(categoryCounts[cat.id] ?? 0) > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          activeCategory === cat.id
                            ? 'bg-white/20 text-white'
                            : 'bg-[#FFE9DD]'
                        }`}
                          style={activeCategory === cat.id ? {} : { color: '#2A0A22', opacity: 0.5 }}
                        >
                          {categoryCounts[cat.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Trust badges */}
              <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: '#2A0A22', opacity: 0.5 }}>
                  Why The Curio Shelf
                </h3>
                <ul className="space-y-2.5">
                  {[
                    '100% genuine products',
                    'Fast Pan-India delivery',
                    'Free shipping above ₹499',
                    '7-day easy returns',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs" style={{ color: '#2A0A22', opacity: 0.5 }}>
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#E11D74', opacity: 1 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </aside>

          {/* ── PRODUCT GRID ── */}
          <div className="flex-1">
            {results.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#FFE9DD] shadow-sm">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#FFE9DD' }}>
                  <Search className="w-7 h-7" style={{ color: '#2A0A22', opacity: 0.3 }} />
                </div>
                <h3 className="text-base font-bold mb-2 font-serif" style={{ color: '#2A0A22' }}>No products found</h3>
                <p className="text-sm mb-6" style={{ color: '#2A0A22', opacity: 0.4 }}>Try adjusting your search or category</p>
                <button
                  onClick={() => { setActiveCategory('all'); clearSearch(); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-full text-sm font-bold transition-all shadow-md hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {results.map((product) => {
                  const productUrl = `/product/${productToSlug(product)}`;
                  const productImage = product.images?.[0]?.src ?? null;
                  const discounted = hasDiscount(product);
                  const discountPct = getDiscountPercentage(product);

                  return (
                    <Link
                      key={product.id}
                      href={productUrl}
                      className="group bg-white rounded-2xl border border-[#FFE9DD] hover:border-[#E11D74]/30 hover:shadow-lg hover:shadow-[#FFE9DD] transition-all duration-300 overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden" style={{ background: '#FFF6EF' }}>
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: '#FFE9DD' }}>
                            <ShoppingBag className="w-8 h-8" style={{ color: '#2A0A22', opacity: 0.2 }} />
                          </div>
                        )}

                        {/* Discount Badge */}
                        {discounted && (
                          <div
                            className="absolute top-2.5 left-2.5 flex items-center gap-1 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-md z-10"
                            style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #E11D74 100%)' }}
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            {discountPct}% OFF
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3.5 space-y-2">
                        {product.categories && product.categories.length > 0 && (
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#E11D74' }}>
                            {product.categories[0].name}
                          </span>
                        )}

                        <h3 className="text-sm font-semibold line-clamp-2 leading-snug transition-colors duration-200 group-hover:opacity-80" style={{ color: '#2A0A22' }}>
                          {product.name}
                        </h3>

                        <div className="pt-2 border-t border-[#FFE9DD] flex items-baseline gap-2">
                          <span className="text-base font-bold" style={{ color: '#2A0A22' }}>
                            ₹{parseFloat(product.price).toLocaleString('en-IN')}
                          </span>
                          {discounted && (
                            <span className="text-xs line-through" style={{ color: '#2A0A22', opacity: 0.4 }}>
                              ₹{parseFloat(product.regular_price).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
