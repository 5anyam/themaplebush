'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchProducts, type Product as WCProduct } from '../../../../lib/woocommerceApi'
import { useCart, type Product as CartProduct } from '../../../../lib/cart'
import { toast } from '../../../../hooks/use-toast'
import {
  ShoppingCart, Heart, Star, ChevronRight,
  SlidersHorizontal, X, Package, Tag,
  ArrowUpDown, Check,
} from 'lucide-react'

type Product = WCProduct
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest'

const SORT_LABELS: Record<SortOption, string> = {
  'default':    'Default',
  'price-asc':  'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'name-asc':   'Name: A–Z',
  'newest':     'Newest First',
}

export default function CategoryClient({
  categorySlug,
  categoryName,
  allProductsInitial,
}: {
  categorySlug: string
  categoryName: string
  allProductsInitial?: Product[]
}) {
  const router = useRouter()
  const { addToCart } = useCart()

  const [sortBy, setSortBy]           = useState<SortOption>('default')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [priceMax, setPriceMax]       = useState<number | null>(null)
  const [wishlist, setWishlist]       = useState<Set<number>>(new Set())
  const [addingId, setAddingId]       = useState<number | null>(null)

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['all-products'],
    queryFn: async () => await fetchProducts() as Product[],
    initialData: allProductsInitial,
    staleTime: 60_000,
  })

  // ── Filter by category ──
  const categoryProducts = useMemo(() => {
    if (!products) return []
    return products.filter((p) =>
      p.categories?.some(
        (c) => c.slug === categorySlug ||
               c.name.toLowerCase().replace(/\s+/g, '-') === categorySlug
      )
    )
  }, [products, categorySlug])

  // ── Price ceiling ──
  const maxPrice = useMemo(() => {
    if (!categoryProducts.length) return 10000
    return Math.ceil(Math.max(...categoryProducts.map((p) => parseFloat(p.price || '0'))))
  }, [categoryProducts])

  const ceiling = priceMax ?? maxPrice

  // ── Sort + filter ──
  const filtered = useMemo(() => {
    let list = categoryProducts.filter((p) => parseFloat(p.price || '0') <= ceiling)
    switch (sortBy) {
      case 'price-asc':  list = [...list].sort((a, b) => parseFloat(a.price||'0') - parseFloat(b.price||'0')); break
      case 'price-desc': list = [...list].sort((a, b) => parseFloat(b.price||'0') - parseFloat(a.price||'0')); break
      case 'name-asc':   list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break
      case 'newest':     list = [...list].sort((a, b) => b.id - a.id); break
    }
    return list
  }, [categoryProducts, ceiling, sortBy])

  // ── Handlers ──
  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setAddingId(product.id)
    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      regular_price: product.regular_price,
      images: (product.images || []).map((img) => ({ src: img.src, alt: img.alt })),
    }
    addToCart(cartProduct)
    toast({ title: '🛒 Added!', description: `${product.name} added to cart` })
    setTimeout(() => setAddingId(null), 1200)
  }

  const toggleWishlist = (id: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setWishlist((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Skeleton ──
  const SkeletonCard = () => (
    <div className="bg-white  overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-1/3 mt-3" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* ── BREADCRUMB ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <button onClick={() => router.push('/')} className="hover:text-[#ff3131] transition-colors">
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-900 font-medium">{categoryName}</span>
          </div>
        </div>
      </div>

      {/* ── CATEGORY BANNER ── */}
      <div className="bg-gradient-to-r from-[#ff3131] to-[#cc0000] text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-red-200 mb-2 block">
            Browse Collection
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{categoryName}</h1>
          <p className="text-sm text-blue-200">
            {isLoading ? '...' : `${categoryProducts.length} products`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">

        {/* ── TOOLBAR ── */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-900">{filtered.length}</span> results
          </p>

          <div className="flex items-center gap-3">
            {/* Filter (mobile only) */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200  text-sm font-medium text-gray-700 hover:border-[#ff3131]/50 hover:text-[#ff3131] transition-colors bg-white"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filter
            </button>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200  text-sm font-medium text-gray-700 hover:border-[#ff3131]/50 hover:text-[#ff3131] transition-colors bg-white"
              >
                <ArrowUpDown className="w-4 h-4" />
                {SORT_LABELS[sortBy]}
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100  shadow-xl py-2 z-30">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => { setSortBy(key); setShowSortMenu(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors
                        ${sortBy === key
                          ? 'text-[#ff3131] bg-red-50 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {SORT_LABELS[key]}
                      {sortBy === key && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-8">

          {/* ── SIDEBAR FILTERS (Desktop) ── */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="bg-white  border border-gray-100 p-5 shadow-sm sticky top-24">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-5">
                Filters
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                  Max Price
                </label>
                <p className="text-lg font-bold text-[#ff3131] mb-3">
                  ₹{ceiling.toLocaleString('en-IN')}
                </p>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={ceiling}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#ff3131]"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>₹0</span>
                  <span>₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100">
                <button
                  onClick={() => setPriceMax(null)}
                  className="text-xs text-[#ff3131] hover:underline font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </aside>

          {/* ── PRODUCT GRID ── */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
                  <Package className="w-10 h-10 text-[#ff3131]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-xs">
                  Try adjusting your filters or check back later for new arrivals.
                </p>
                <button
                  onClick={() => setPriceMax(null)}
                  className="px-6 py-3 bg-[#ff3131] text-white text-sm font-semibold  hover:bg-[#cc0000] transition-colors shadow-md"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filtered.map((product) => {
                  const price        = parseFloat(product.price || '0')
                  const regularPrice = parseFloat(product.regular_price || '0')
                  const hasSale      = price < regularPrice && regularPrice > 0
                  const discount     = hasSale ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0
                  const image        = product.images?.[0]?.src
                  const isWishlisted = wishlist.has(product.id)
                  const isAdding     = addingId === product.id

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      className="group bg-white  overflow-hidden border border-gray-100 hover:border-[#ff3131]/30 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        {image ? (
                          <img
                            src={image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-200" />
                          </div>
                        )}

                        {/* Sale badge */}
                        {hasSale && discount > 0 && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-[#ff3131] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Tag className="w-2.5 h-2.5" /> {discount}% OFF
                            </span>
                          </div>
                        )}

                        {/* Wishlist */}
                        <button
                          onClick={(e) => toggleWishlist(product.id, e)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md border border-gray-100 hover:border-[#ff3131]/30 transition-all opacity-0 group-hover:opacity-100"
                          aria-label="Wishlist"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 transition-colors ${
                              isWishlisted ? 'fill-[#ff3131] text-[#ff3131]' : 'text-gray-400'
                            }`}
                          />
                        </button>

                        {/* Quick Add */}
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="absolute bottom-2 left-2 right-2 bg-[#ff3131] text-white text-xs font-bold py-2  flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md"
                        >
                          {isAdding ? (
                            <><Check className="w-3.5 h-3.5" /> Added!</>
                          ) : (
                            <><ShoppingCart className="w-3.5 h-3.5" /> Quick Add</>
                          )}
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-3 md:p-4">
                        <p className="text-[11px] text-gray-400 mb-1 truncate uppercase tracking-wide">
                          {product.categories?.[0]?.name || categoryName}
                        </p>
                        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-[#ff3131] transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-[#ff3131] fill-[#ff3131]" />
                          ))}
                          <span className="text-[10px] text-gray-400 ml-1">(4.8)</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-gray-900">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          {hasSale && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{regularPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setShowFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white  z-50 p-6 shadow-2xl lg:hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold uppercase tracking-widest">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
              Max Price
            </label>
            <p className="text-xl font-bold text-[#ff3131] mb-3">
              ₹{ceiling.toLocaleString('en-IN')}
            </p>
            <input
              type="range"
              min={0}
              max={maxPrice}
              value={ceiling}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-[#ff3131] mb-1"
            />
            <div className="flex justify-between text-[11px] text-gray-400 mb-6">
              <span>₹0</span>
              <span>₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setPriceMax(null); setShowFilters(false) }}
                className="flex-1 py-3 border-2 border-gray-200  text-sm font-semibold text-gray-700 hover:border-gray-300 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-3 bg-[#ff3131]  text-sm font-semibold text-white hover:bg-[#cc0000] transition-colors shadow-md"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}