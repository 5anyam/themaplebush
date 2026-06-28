// app/sale/SaleClient.tsx
'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchProducts, type Product as WCProduct } from '../../../lib/woocommerceApi'
import { useCart, type Product as CartProduct } from '../../../lib/cart'
import { toast } from '../../../hooks/use-toast'
import {
  ShoppingCart, Heart, Star, ChevronRight,
  Tag, Check, Package, ArrowUpDown,
  SlidersHorizontal, X, Flame, Zap,
} from 'lucide-react'

type Product = WCProduct
type SortOption = 'discount-desc' | 'price-asc' | 'price-desc' | 'newest'

const GRADIENT = 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)'

const SORT_LABELS: Record<SortOption, string> = {
  'discount-desc': 'Best Discount',
  'price-asc':     'Price: Low to High',
  'price-desc':    'Price: High to Low',
  'newest':        'Newest First',
}

export default function SaleClient({
  allProductsInitial,
}: {
  allProductsInitial?: Product[]
}) {
  const router = useRouter()
  const { addToCart } = useCart()

  const [sortBy, setSortBy]             = useState<SortOption>('discount-desc')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilters, setShowFilters]   = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [priceMax, setPriceMax]         = useState<number | null>(null)
  const [wishlist, setWishlist]         = useState<Set<number>>(new Set())
  const [addingId, setAddingId]         = useState<number | null>(null)

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['all-products'],
    queryFn: async () => await fetchProducts() as Product[],
    initialData: allProductsInitial,
    staleTime: 60_000,
  })

  // ── Only sale products ──
  const saleProducts = useMemo(() => {
    if (!products) return []
    return products.filter((p) => {
      const price   = parseFloat(p.price || '0')
      const regular = parseFloat(p.regular_price || '0')
      return price > 0 && regular > 0 && price < regular
    })
  }, [products])

  // ── Categories from sale products ──
  const categories = useMemo(() => {
    const map = new Map<string, string>()
    saleProducts.forEach((p) =>
      p.categories?.forEach((c) => {
        if (c.slug) map.set(c.slug, c.name)   // 👈 slug exist kare tabhi add karo
      })
    )
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }))
  }, [saleProducts])

  const maxPrice = useMemo(() => {
    if (!saleProducts.length) return 10000
    return Math.ceil(Math.max(...saleProducts.map((p) => parseFloat(p.price || '0'))))
  }, [saleProducts])

  const ceiling = priceMax ?? maxPrice

  // ── Filter + sort ──
  const filtered = useMemo(() => {
    let list = saleProducts.filter((p) => {
      const price = parseFloat(p.price || '0')
      const matchCat = activeCategory === 'all' ||
        p.categories?.some((c) => c.slug === activeCategory)
      return matchCat && price <= ceiling
    })
    switch (sortBy) {
      case 'discount-desc':
        list = [...list].sort((a, b) => {
          const discA = ((parseFloat(a.regular_price||'0') - parseFloat(a.price||'0')) / parseFloat(a.regular_price||'1')) * 100
          const discB = ((parseFloat(b.regular_price||'0') - parseFloat(b.price||'0')) / parseFloat(b.regular_price||'1')) * 100
          return discB - discA
        })
        break
      case 'price-asc':
        list = [...list].sort((a, b) => parseFloat(a.price||'0') - parseFloat(b.price||'0'))
        break
      case 'price-desc':
        list = [...list].sort((a, b) => parseFloat(b.price||'0') - parseFloat(a.price||'0'))
        break
      case 'newest':
        list = [...list].sort((a, b) => b.id - a.id)
        break
    }
    return list
  }, [saleProducts, activeCategory, ceiling, sortBy])

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

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#FFE9DD] animate-pulse">
      <div className="aspect-square" style={{ background: '#FFE9DD' }} />
      <div className="p-4 space-y-2">
        <div className="h-3 rounded w-3/4" style={{ background: '#FFE9DD' }} />
        <div className="h-3 rounded w-1/2" style={{ background: '#FFE9DD' }} />
        <div className="h-4 rounded w-1/3 mt-3" style={{ background: '#FFE9DD' }} />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-12" style={{ background: '#FFF6EF', color: '#2A0A22' }}>

      {/* ── BREADCRUMB ── */}
      <div className="bg-white border-b border-[#FFE9DD]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#2A0A22', opacity: 0.5 }}>
            <button onClick={() => router.push('/')} className="hover:opacity-100 transition-opacity">
              Home
            </button>
            <ChevronRight className="w-3 h-3" style={{ color: '#FFE9DD' }} />
            <span className="font-semibold" style={{ color: '#E11D74', opacity: 1 }}>Sale</span>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden" style={{ background: GRADIENT }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-white animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/80">
                Limited Time Deals
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-serif text-white mb-2 leading-tight">
              SALE <span className="text-white/70">FEST</span>
            </h1>
            <p className="text-sm text-white/70 max-w-md">
              Up to <span className="text-white font-bold">70% OFF</span> on products across all categories. Grab them before they&apos;re gone.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6 md:gap-10">
            {[
              { value: isLoading ? '...' : `${saleProducts.length}+`, label: 'Products on Sale' },
              { value: 'Up to 70%', label: 'Max Discount' },
              { value: 'Free', label: 'Shipping' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-[11px] text-white/60 uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div className="bg-white border-b border-[#FFE9DD] sticky top-[calc(var(--header-h,80px))] z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all`}
              style={
                activeCategory === 'all'
                  ? { background: GRADIENT, color: 'white' }
                  : { background: '#FFE9DD', color: '#2A0A22' }
              }
            >
              All Deals
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap`}
                style={
                  activeCategory === cat.slug
                    ? { background: GRADIENT, color: 'white' }
                    : { background: '#FFE9DD', color: '#2A0A22' }
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">

        {/* ── TOOLBAR ── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm" style={{ color: '#2A0A22', opacity: 0.6 }}>
            <span className="font-semibold" style={{ color: '#2A0A22', opacity: 1 }}>{filtered.length}</span> deals found
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors bg-white"
              style={{ borderColor: '#FFE9DD', color: '#2A0A22' }}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filter
            </button>
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors bg-white"
                style={{ borderColor: '#FFE9DD', color: '#2A0A22' }}
              >
                <ArrowUpDown className="w-4 h-4" />
                {SORT_LABELS[sortBy]}
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#FFE9DD] rounded-xl shadow-xl py-2 z-30">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => { setSortBy(key); setShowSortMenu(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors`}
                      style={
                        sortBy === key
                          ? { color: '#E11D74', background: '#FFE9DD', fontWeight: 500 }
                          : { color: '#2A0A22' }
                      }
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

          {/* ── SIDEBAR (Desktop) ── */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#FFE9DD] p-5 shadow-sm sticky top-36">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: '#2A0A22' }}>
                <Zap className="w-3.5 h-3.5" style={{ color: '#E11D74' }} /> Filters
              </h3>

              {/* Category filter */}
              <div className="mb-5">
                <label className="block text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#2A0A22', opacity: 0.6 }}>
                  Category
                </label>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`text-left text-xs px-3 py-2 rounded-lg transition-colors font-medium`}
                    style={
                      activeCategory === 'all'
                        ? { background: '#FFE9DD', color: '#E11D74' }
                        : { color: '#2A0A22', opacity: 0.7 }
                    }
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`text-left text-xs px-3 py-2 rounded-lg transition-colors font-medium`}
                      style={
                        activeCategory === cat.slug
                          ? { background: '#FFE9DD', color: '#E11D74' }
                          : { color: '#2A0A22', opacity: 0.7 }
                      }
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="pt-5 border-t border-[#FFE9DD]">
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: '#2A0A22', opacity: 0.6 }}>
                  Max Price
                </label>
                <p className="text-lg font-bold mb-3" style={{ color: '#E11D74' }}>
                  ₹{ceiling.toLocaleString('en-IN')}
                </p>
                <input
                  type="range" min={0} max={maxPrice} value={ceiling}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#E11D74]"
                />
                <div className="flex justify-between text-[11px] mt-1" style={{ color: '#2A0A22', opacity: 0.4 }}>
                  <span>₹0</span>
                  <span>₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => { setActiveCategory('all'); setPriceMax(null) }}
                className="mt-5 text-xs font-medium hover:underline"
                style={{ color: '#E11D74' }}
              >
                Clear All Filters
              </button>
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
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: '#FFE9DD' }}>
                  <Package className="w-10 h-10" style={{ color: '#E11D74' }} />
                </div>
                <h2 className="text-xl font-bold font-serif mb-2" style={{ color: '#2A0A22' }}>No Deals Found</h2>
                <p className="text-sm mb-6 max-w-xs" style={{ color: '#2A0A22', opacity: 0.5 }}>
                  Try changing filters or check back soon for new offers.
                </p>
                <button
                  onClick={() => { setActiveCategory('all'); setPriceMax(null) }}
                  className="px-6 py-3 text-white text-sm font-semibold rounded-full shadow-md"
                  style={{ background: GRADIENT }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filtered.map((product) => {
                  const price        = parseFloat(product.price || '0')
                  const regularPrice = parseFloat(product.regular_price || '0')
                  const discount     = Math.round(((regularPrice - price) / regularPrice) * 100)
                  const saving       = regularPrice - price
                  const image        = product.images?.[0]?.src
                  const isWishlisted = wishlist.has(product.id)
                  const isAdding     = addingId === product.id

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      className="group bg-white rounded-2xl overflow-hidden border border-[#FFE9DD] hover:shadow-lg transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden" style={{ background: '#FFF6EF' }}>
                        {image ? (
                          <img
                            src={image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12" style={{ color: '#FFE9DD' }} />
                          </div>
                        )}

                        {/* Discount badge */}
                        <div className="absolute top-2 left-2">
                          <span className="text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md" style={{ background: GRADIENT }}>
                            <Tag className="w-2.5 h-2.5" /> {discount}% OFF
                          </span>
                        </div>

                        {/* Wishlist */}
                        <button
                          onClick={(e) => toggleWishlist(product.id, e)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md border border-[#FFE9DD] transition-all opacity-0 group-hover:opacity-100"
                          aria-label="Wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 transition-colors`} style={{ color: isWishlisted ? '#E11D74' : '#2A0A22', fill: isWishlisted ? '#E11D74' : 'none' }} />
                        </button>

                        {/* Quick Add */}
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md"
                          style={{ background: GRADIENT }}
                        >
                          {isAdding
                            ? <><Check className="w-3.5 h-3.5" /> Added!</>
                            : <><ShoppingCart className="w-3.5 h-3.5" /> Quick Add</>
                          }
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-3 md:p-4">
                        <p className="text-[11px] mb-1 truncate uppercase tracking-wide" style={{ color: '#2A0A22', opacity: 0.4 }}>
                          {product.categories?.[0]?.name}
                        </p>
                        <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-2" style={{ color: '#2A0A22' }}>
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3" style={{ color: '#FF6A2B', fill: '#FF6A2B' }} />
                          ))}
                          <span className="text-[10px] ml-1" style={{ color: '#2A0A22', opacity: 0.4 }}>(4.8)</span>
                        </div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-base font-bold" style={{ color: '#2A0A22' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs line-through" style={{ color: '#2A0A22', opacity: 0.4 }}>
                            ₹{regularPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[11px] text-green-600 font-semibold mt-1">
                          You save ₹{saving.toLocaleString('en-IN')}
                        </p>
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
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 shadow-2xl lg:hidden max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#2A0A22' }}>Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" style={{ color: '#2A0A22', opacity: 0.5 }} />
              </button>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#2A0A22', opacity: 0.6 }}>
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={activeCategory === 'all' ? { background: GRADIENT, color: 'white' } : { background: '#FFE9DD', color: '#2A0A22' }}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setActiveCategory(cat.slug)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={activeCategory === cat.slug ? { background: GRADIENT, color: 'white' } : { background: '#FFE9DD', color: '#2A0A22' }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: '#2A0A22', opacity: 0.6 }}>
                Max Price — ₹{ceiling.toLocaleString('en-IN')}
              </label>
              <input
                type="range" min={0} max={maxPrice} value={ceiling}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-[#E11D74] mt-3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setActiveCategory('all'); setPriceMax(null); setShowFilters(false) }}
                className="flex-1 py-3 border-2 rounded-full text-sm font-semibold"
                style={{ borderColor: '#FFE9DD', color: '#2A0A22' }}
              >
                Clear
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-3 rounded-full text-sm font-semibold text-white shadow-md"
                style={{ background: GRADIENT }}
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
