'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../lib/cart';
import { useAuth } from '../../../lib/AuthContext';
import { Trash2, Minus, Plus, ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';

function parsePrice(price: string): number {
  return parseFloat(price) || 0;
}

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, increment, decrement, removeFromCart } = useCart();

  function handleCheckout() {
    if (!user) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  }

  const total = items.reduce((sum, i) => sum + parsePrice(i.price) * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const mrpTotal = items.reduce((sum, item) => {
    const original = item.regular_price ? parsePrice(item.regular_price) : parsePrice(item.price);
    return sum + original * item.quantity;
  }, 0);
  const discountAmount = mrpTotal - total;
  const freeShipping = total >= 499;

  return (
    <main className="min-h-screen" style={{ background: '#FFF6EF', color: '#2A0A22' }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }} className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-10 relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-serif">Shopping Cart</h1>
          </div>
          <p className="text-white/70 text-sm pl-12">
            {items.length === 0
              ? 'Your cart is empty'
              : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── EMPTY STATE ── */}
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#FFE9DD] shadow-sm">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: '#FFE9DD' }}>
              <ShoppingBag className="w-9 h-9" style={{ color: '#E11D74', opacity: 0.5 }} />
            </div>
            <h2 className="text-lg font-bold mb-2 font-serif" style={{ color: '#2A0A22' }}>Your cart is empty</h2>
            <p className="text-sm mb-7 max-w-xs mx-auto leading-relaxed" style={{ color: '#2A0A22', opacity: 0.5 }}>
              Add products to your cart and they will appear here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-3 text-white rounded-full text-sm font-bold uppercase tracking-wide transition-all shadow-md"
              style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (

          /* ── CART CONTENT ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const hasDiscount =
                  item.regular_price && parsePrice(item.regular_price) > parsePrice(item.price);
                const itemSubtotal = parsePrice(item.price) * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-4 sm:p-5 hover:border-[#E11D74]/30 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0 w-20 h-20 rounded-xl border border-[#FFE9DD] overflow-hidden relative" style={{ background: '#FFF6EF' }}>
                        {item.images?.[0]?.src ? (
                          <Image
                            src={item.images[0].src}
                            alt={item.name}
                            fill
                            className="object-contain p-1.5"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-7 h-7" style={{ color: '#2A0A22', opacity: 0.2 }} />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <h3 className="text-sm font-semibold line-clamp-2 leading-snug" style={{ color: '#2A0A22' }}>
                          {item.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold" style={{ color: '#2A0A22' }}>
                            ₹{parsePrice(item.price).toLocaleString('en-IN')}
                          </span>
                          {hasDiscount && item.regular_price && (
                            <span className="text-xs line-through" style={{ color: '#2A0A22', opacity: 0.4 }}>
                              ₹{parsePrice(item.regular_price).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Quantity + Delete */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center border-2 border-[#FFE9DD] rounded-xl overflow-hidden">
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (item.quantity > 1) decrement(item.id); }}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                              className="px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation hover:bg-[#FFE9DD]"
                              style={{ color: '#2A0A22' }}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-bold" style={{ color: '#2A0A22' }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); increment(item.id); }}
                              aria-label="Increase quantity"
                              className="px-3 py-2 transition-colors touch-manipulation hover:bg-[#FFE9DD]"
                              style={{ color: '#2A0A22' }}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold" style={{ color: '#2A0A22' }}>
                              ₹{itemSubtotal.toLocaleString('en-IN')}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromCart(item.id); }}
                              aria-label="Remove item"
                              className="p-2 rounded-xl transition-colors touch-manipulation hover:bg-red-50 hover:text-red-500"
                              style={{ color: '#2A0A22', opacity: 0.4 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Continue shopping */}
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline mt-2"
                style={{ color: '#E11D74' }}
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* ── ORDER SUMMARY ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm sticky top-8">

                <div className="px-6 pt-6 pb-4 border-b border-[#FFE9DD]">
                  <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#2A0A22', opacity: 0.5 }}>Order Summary</h2>
                </div>

                <div className="p-6 space-y-4">
                  {/* Price breakdown */}
                  <div className="space-y-3 pb-4 border-b border-[#FFE9DD]">
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm" style={{ color: '#2A0A22', opacity: 0.6 }}>
                        <span>MRP Total</span>
                        <span>₹{mrpTotal.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm" style={{ color: '#2A0A22', opacity: 0.6 }}>
                      <span>Subtotal ({totalItems} items)</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-semibold">
                        <span>Discount Saved</span>
                        <span>−₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm" style={{ color: '#2A0A22', opacity: 0.6 }}>
                      <span>Shipping</span>
                      <span className={freeShipping ? 'text-green-600 font-semibold' : ''}>
                        {freeShipping ? 'Free' : `₹49`}
                      </span>
                    </div>
                    {!freeShipping && (
                      <p className="text-xs font-medium" style={{ color: '#FF6A2B' }}>
                        Add ₹{(499 - total).toLocaleString('en-IN')} more for free shipping
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-baseline pb-5 border-b border-[#FFE9DD]">
                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: '#2A0A22' }}>Total</span>
                    <span className="text-xl font-black" style={{ color: '#2A0A22' }}>
                      ₹{(total + (freeShipping ? 0 : 49)).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white rounded-full text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <Link
                      href="/shop"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#FFE9DD] rounded-full text-sm font-bold uppercase tracking-wide transition-all hover:border-[#E11D74]/30 hover:bg-[#FFF6EF]"
                      style={{ color: '#2A0A22' }}
                    >
                      Continue Shopping
                    </Link>
                  </div>

                  {/* Trust badges */}
                  <div className="pt-4 border-t border-[#FFE9DD] space-y-2">
                    {[
                      '100% Secure Checkout',
                      'Free shipping above ₹499',
                      '7-day easy returns',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs" style={{ color: '#2A0A22', opacity: 0.5 }}>
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#E11D74', opacity: 1 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
