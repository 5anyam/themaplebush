'use client';
import Link from "next/link";
import { useCart } from "../lib/cart";
import { Trash2, Minus, Plus, Package, X, ShoppingBag, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface CartItem {
  id: number | string;
  name: string;
  price: string;
  regular_price?: string;
  quantity: number;
  images?: Array<{ src: string }>;
}

export default function CartDrawer() {
  const { items, increment, decrement, removeFromCart, isCartOpen, setIsCartOpen } = useCart();
  const [showAddedNotification, setShowAddedNotification] = useState<boolean>(false);
  /* mounted = whether the drawer is in the DOM; sliding = whether it should be translated in */
  const [mounted, setMounted] = useState(false);
  const [sliding, setSliding] = useState(false);

  /* Sync isCartOpen → mount + slide animation */
  useEffect(() => {
    if (isCartOpen) {
      setMounted(true);
      /* tiny delay so the translate transition fires after the element is in the DOM */
      const t = requestAnimationFrame(() => setSliding(true));
      return () => cancelAnimationFrame(t);
    } else {
      /* slide out first, then unmount after transition */
      setSliding(false);
      const t = setTimeout(() => setMounted(false), 310);
      return () => clearTimeout(t);
    }
  }, [isCartOpen]);

  const total: number = items.reduce((sum: number, i: CartItem) => sum + parseFloat(i.price) * i.quantity, 0);
  const totalItems: number = items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);

  const mrpTotal: number = items.reduce((sum: number, item: CartItem) => {
    const rp = item.regular_price;
    return sum + (rp ? parseFloat(rp) : parseFloat(item.price)) * item.quantity;
  }, 0);

  const discountAmount: number = mrpTotal - total;

  useEffect(() => {
    if (items.length > 0 && isCartOpen) {
      setShowAddedNotification(true);
      const timer = setTimeout(() => setShowAddedNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [items.length, isCartOpen]);

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative w-10 h-10 grid place-items-center rounded-full hover:bg-[#FFE9DD] transition-colors touch-manipulation"
        aria-label="Open shopping cart"
      >
        <ShoppingBag className="w-5 h-5" style={{ color: '#2A0A22' }} />
        {totalItems > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full grid place-items-center font-bold leading-none"
            style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
          >
            {totalItems}
          </span>
        )}
      </button>

      {/* Backdrop — only in DOM when drawer is mounted */}
      {mounted && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300"
          style={{ opacity: sliding ? 1 : 0 }}
          onClick={() => setIsCartOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer — only mounted when open; slides in/out via CSS transition */}
      {mounted && (
      <div
        className="fixed top-0 right-0 h-[100dvh] w-[92%] sm:w-[420px] max-w-[420px] z-[9999] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out"
        style={{ background: '#FFF6EF', transform: sliding ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-[#FFE9DD]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" style={{ color: '#2A0A22' }} />
            <h2 className="font-serif text-[15px] font-semibold" style={{ color: '#2A0A22' }}>
              Your bag{' '}
              <span style={{ color: '#E11D74' }}>({totalItems})</span>
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 grid place-items-center rounded-full hover:bg-[#FFE9DD] transition-colors touch-manipulation"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" style={{ color: '#2A0A22' }} />
          </button>
        </div>

        {/* ── Added notification ── */}
        {showAddedNotification && (
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-green-50 border-b border-green-100">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-xs text-green-800 font-medium">Item added to your bag!</span>
          </div>
        )}

        {/* ── Scrollable items ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#FFE9DD' }}>
                <Package className="w-8 h-8" style={{ color: '#E11D74' }} />
              </div>
              <h3 className="font-serif text-base font-semibold mb-1" style={{ color: '#2A0A22' }}>Your shelf is empty</h3>
              <p className="text-xs mb-5" style={{ color: '#2A0A22', opacity: 0.5 }}>Add a little wonder to get started.</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mag-btn text-[13px] px-5 py-2.5"
              >
                Browse the shelf
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#FFE9DD]">
              {items.map((item: CartItem) => {
                const rp = item.regular_price;
                const hasDiscount = !!(rp && parseFloat(rp) > parseFloat(item.price));
                return (
                  <div key={item.id} className="p-3 hover:bg-[#FFE9DD]/30 transition-colors">
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-[#FFE9DD]" style={{ background: '#FFE9DD' }}>
                        <img
                          src={item.images?.[0]?.src || '/placeholder.png'}
                          alt={item.name}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1 mb-1">
                          <h3 className="text-[13px] font-semibold line-clamp-2 leading-snug" style={{ color: '#2A0A22' }}>
                            {item.name}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromCart(item.id as number); }}
                            className="flex-shrink-0 p-1 rounded-full hover:bg-red-50 transition-colors touch-manipulation"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" style={{ color: '#2A0A22', opacity: 0.4 }} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[13px] font-bold" style={{ color: '#2A0A22' }}>
                            ₹{parseFloat(item.price).toLocaleString()}
                          </span>
                          {hasDiscount && rp && (
                            <span className="text-[11px] line-through" style={{ color: '#2A0A22', opacity: 0.4 }}>
                              ₹{parseFloat(rp).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Qty controls + subtotal */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center rounded-full overflow-hidden border border-[#FFE9DD]" style={{ background: 'white' }}>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (item.quantity > 1) decrement(item.id as number); }}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 grid place-items-center transition-colors hover:bg-[#FFE9DD] disabled:opacity-40 touch-manipulation"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" style={{ color: '#2A0A22' }} />
                            </button>
                            <span className="w-7 text-center text-[13px] font-semibold" style={{ color: '#2A0A22' }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); increment(item.id as number); }}
                              className="w-8 h-8 grid place-items-center transition-colors hover:bg-[#FFE9DD] touch-manipulation"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" style={{ color: '#2A0A22' }} />
                            </button>
                          </div>
                          <span className="text-[12px] font-semibold" style={{ color: '#2A0A22', opacity: 0.6 }}>
                            ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer (always at bottom) ── */}
        {items.length > 0 && (
          <div className="flex-shrink-0 border-t border-[#FFE9DD]" style={{ background: 'rgba(255,246,239,0.97)' }}>
            {/* Price summary */}
            <div className="px-4 pt-3 pb-2 space-y-1.5">
              {discountAmount > 0 && (
                <>
                  <div className="flex justify-between text-[12px]" style={{ color: '#2A0A22', opacity: 0.55 }}>
                    <span>MRP Total</span>
                    <span>₹{mrpTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[12px] font-semibold" style={{ color: '#16a34a' }}>
                    <span>Discount</span>
                    <span>−₹{discountAmount.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-[12px]" style={{ color: '#2A0A22', opacity: 0.55 }}>
                <span>Shipping</span>
                <span className="font-semibold" style={{ color: '#16a34a' }}>Free</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#FFE9DD]">
                <span className="text-[14px] font-semibold" style={{ color: '#2A0A22' }}>Total</span>
                <span className="text-[16px] font-bold" style={{ color: '#2A0A22' }}>₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-4 pb-4 pt-1 space-y-2">
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="mag-btn w-full py-3.5 text-[14px] justify-center font-bold"
              >
                Checkout · ₹{total.toLocaleString()}
              </Link>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3 text-[13px] font-semibold rounded-full border-2 transition-colors hover:bg-[#FFE9DD] touch-manipulation"
                style={{ borderColor: 'rgba(42,10,34,0.2)', color: '#2A0A22' }}
              >
                Continue Shopping
              </button>
            </div>

            {/* Trust strip */}
            <div className="pb-4 pt-1 border-t border-[#FFE9DD] mx-4">
              <div className="flex items-center justify-center gap-4 text-[11px] font-semibold" style={{ color: '#2A0A22', opacity: 0.4 }}>
                <span>✓ Secure</span>
                <span>✓ Free Shipping</span>
                <span>✓ Easy Returns</span>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </>
  );
}
