'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../../../../components/ProductCard';
import { fetchProducts } from '../../../../lib/woocommerceApi';
import { useState, useMemo } from 'react';
import { Grid, List, ChevronDown, Search, ShoppingBag, X, AlertCircle } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  images?: { src: string }[];
  categories?: { id: number; name: string; slug: string }[];
}

type SortOption = 'default' | 'price-low' | 'price-high' | 'name';

function toTitleCase(slug: string): string {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const categoryName = toTitleCase(slug);

  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, refetch } = useQuery<Product[]>({
    queryKey: ['category-products', slug],
    queryFn: async () => {
      const result = await fetchProducts();
      return (result || []) as Product[];
    },
  });

  const sortedProducts = useMemo(() => {
    const byCategory = data?.filter((p) =>
      p.categories?.some((c) => c.slug === slug)
    ) ?? [];

    const bySearch = searchQuery.trim()
      ? byCategory.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : byCategory;

    return [...bySearch].sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high': return parseFloat(b.price) - parseFloat(a.price);
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
  }, [data, slug, searchQuery, sortBy]);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── HERO ── */}
      <div className="bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-blue-300 mb-3 font-semibold">
            Browse Collection
          </p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-[#ff3131] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {categoryName}
            </h1>
          </div>
          <p className="text-sm text-blue-200 max-w-lg pl-12 leading-relaxed">
            Discover our premium selection of{' '}
            <span className="text-white font-medium">{categoryName.toLowerCase()}</span>{' '}
            designed for style and protection.
          </p>
        </div>
      </div>

      {/* ── STICKY FILTER BAR ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in this category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 focus:bg-white transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff3131] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
              {/* Count */}
              {!isLoading && (
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                  {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
                </span>
              )}

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-3 pr-8 py-2.5 border-2 border-gray-100 rounded-xl bg-gray-50 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 cursor-pointer transition-all"
                >
                  <option value="default">Sort By</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                  <option value="name">Name: A → Z</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${
                    viewMode === 'grid' ? 'bg-[#ff3131] text-white' : 'text-gray-400 hover:text-[#ff3131]'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${
                    viewMode === 'list' ? 'bg-[#ff3131] text-white' : 'text-gray-400 hover:text-[#ff3131]'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded-full animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Failed to Load Products</h3>
            <p className="text-sm text-gray-400 mb-6">Something went wrong. Please try again.</p>
            <button
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff3131] hover:bg-[#cc0000] text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && sortedProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-sm text-gray-400 mb-6">Try adjusting your search or filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setSortBy('default'); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff3131] hover:bg-[#cc0000] text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        )}

        {/* Products */}
        {!isLoading && !isError && sortedProducts.length > 0 && (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'flex flex-col gap-4'
            }
          >
            {sortedProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tailwind-safe keyframe via global style */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </main>
  );
}
