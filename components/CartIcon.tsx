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


  const total: number = items.reduce((sum: number, i: CartItem) => sum + parseFloat(i.price) * i.quantity, 0);
  const totalItems: number = items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);




  const mrpTotal: number = items.reduce((sum: number, item: CartItem) => {
    const regularPrice = item.regular_price;
    const originalPrice = regularPrice ? parseFloat(regularPrice) : parseFloat(item.price);
    return sum + originalPrice * item.quantity;
  }, 0);




  const discountAmount: number = mrpTotal - total;




  // Show notification when cart opens with items
  useEffect(() => {
    if (items.length > 0 && isCartOpen) {
      setShowAddedNotification(true);
      const timer = setTimeout(() => {
        setShowAddedNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [items.length, isCartOpen]);




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
            className="absolute -top-0.5 -right-0.5 text-white text-[11px] min-w-[18px] h-[18px] px-1 rounded-full grid place-items-center font-bold"
            style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
          >
            {totalItems}
          </span>
        )}
      </button>




      {/* Overlay - Maximum z-index */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300"
          onClick={() => setIsCartOpen(false)}
          aria-hidden="true"
        />
      )}




      {/* Cart Drawer - Maximum z-index to stay above all floating elements */}
      <div className={`fixed top-0 right-0 h-full w-[80%] sm:w-[480px] max-w-[480px] z-[9999] shadow-lift transform transition-transform duration-300 ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`} style={{ background: '#FFF6EF' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#FFE9DD]">
          <div className="flex items-center gap-2 sm:gap-3">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#2A0A22' }} />
            <h2 className="font-serif text-base sm:text-lg font-semibold" style={{ color: '#2A0A22' }}>
              Your bag <span style={{ color: '#E11D74' }}>({totalItems})</span>
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-9 h-9 grid place-items-center rounded-full hover:bg-[#FFE9DD] transition-colors touch-manipulation"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" style={{ color: '#2A0A22' }} />
          </button>
        </div>




        {/* Added Notification */}
        {showAddedNotification && (
          <div className="bg-green-50 border-b border-green-100 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-green-800 font-medium">Item added to cart!</span>
          </div>
        )}




        {/* Cart Content */}
        <div className="flex flex-col h-full">
          {/* Items List */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              /* Empty Cart */
              <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4" style={{ background: '#FFE9DD' }}>
                  <Package className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#E11D74' }} />
                </div>
                <h3 className="font-serif text-base sm:text-lg font-semibold mb-1.5" style={{ color: '#2A0A22' }}>Your shelf is empty</h3>
                <p className="text-xs sm:text-sm mb-5" style={{ color: '#2A0A22', opacity: 0.5 }}>Add a little wonder to get started.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mag-btn text-[13px] px-5 py-2.5"
                >
                  Browse the shelf
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="divide-y divide-gray-200">
                  {items.map((item: CartItem) => {
                    const itemRegularPrice = item.regular_price;
                    const hasDiscount: boolean = !!(itemRegularPrice && parseFloat(itemRegularPrice) > parseFloat(item.price));


                    return (
                      <div key={item.id} className="p-3 sm:p-4 hover:bg-[#FFE9DD]/40 transition-colors">
                        <div className="flex gap-3 sm:gap-4">
                          {/* Image */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#FFE9DD]" style={{ background: '#FFE9DD' }}>
                              <img
                                src={item.images?.[0]?.src || '/placeholder.png'}
                                alt={item.name}
                                className="w-full h-full object-contain p-1 sm:p-2"
                              />
                            </div>
                          </div>




                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-2">
                              <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 pr-2" style={{ color: '#2A0A22' }}>
                                {item.name}
                              </h3>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeFromCart(item.id as number);
                                }}
                                className="text-gray-400 hover:text-red-600 active:text-red-700 transition-colors flex-shrink-0 p-1 touch-manipulation"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4 sm:w-4 sm:h-4" />
                              </button>
                            </div>




                            {/* Price */}
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                              <span className="text-sm sm:text-base font-medium text-gray-900">
                                ₹{parseFloat(item.price).toLocaleString()}
                              </span>
                              {hasDiscount && itemRegularPrice && (
                                <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                                  ₹{parseFloat(itemRegularPrice).toLocaleString()}
                                </span>
                              )}
                            </div>




                            {/* Quantity Controls - Mobile Optimized */}
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (item.quantity > 1) {
                                      decrement(item.id as number);
                                    }
                                  }}
                                  disabled={item.quantity <= 1}
                                  className="p-2 sm:p-2 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 text-gray-600" />
                                </button>
                                <span className="w-10 sm:w-10 text-center text-xs sm:text-sm font-medium text-gray-900 px-1">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    increment(item.id as number);
                                  }}
                                  className="p-2 sm:p-2 active:bg-gray-200 transition-colors touch-manipulation"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 text-gray-600" />
                                </button>
                              </div>
                              <span className="text-xs sm:text-sm text-gray-600 font-medium">
                                ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </>
            )}
          </div>




          {/* Footer - Summary & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-[#FFE9DD]" style={{ background: 'rgba(255,255,255,.6)' }}>
              {/* Summary */}
              <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                {discountAmount > 0 && (
                  <>
                    <div className="flex justify-between text-xs sm:text-sm" style={{ color: '#2A0A22', opacity: 0.55 }}>
                      <span>MRP Total</span>
                      <span>₹{mrpTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm font-semibold" style={{ color: '#16a34a' }}>
                      <span>Discount</span>
                      <span>-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-xs sm:text-sm" style={{ color: '#2A0A22', opacity: 0.55 }}>
                  <span>Shipping</span>
                  <span className="font-semibold" style={{ color: '#16a34a' }}>Free</span>
                </div>

                <div className="flex justify-between pt-2 sm:pt-3 border-t border-[#FFE9DD]">
                  <span className="text-sm sm:text-base font-semibold" style={{ color: '#2A0A22' }}>Total</span>
                  <span className="text-base sm:text-lg font-bold" style={{ color: '#2A0A22' }}>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
                <Link
                  href="/checkout"
                  className="mag-btn w-full py-3 text-[14px] justify-center"
                  onClick={() => setIsCartOpen(false)}
                >
                  Checkout · ₹{total.toLocaleString()}
                </Link>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full border-2 py-3 text-[13px] font-semibold rounded-full transition-colors touch-manipulation hover:bg-[#FFE9DD]"
                  style={{ borderColor: '#2A0A22', opacity: 0.25, color: '#2A0A22' }}
                >
                  Continue Shopping
                </button>
              </div>

              {/* Trust Badges */}
              <div className="px-4 sm:px-6 pb-5 pt-2 border-t border-[#FFE9DD]">
                <div className="flex items-center justify-center gap-3 sm:gap-6 text-[11px] font-semibold" style={{ color: '#2A0A22', opacity: 0.45 }}>
                  <span>✓ Secure</span>
                  <span>✓ Free Ship</span>
                  <span>✓ Easy Returns</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
