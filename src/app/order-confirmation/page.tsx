'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle, Package, Home, ShoppingBag, Copy, Check } from "lucide-react";

function OrderConfirmationContent() {
  const params = useSearchParams();

  const wcOrderId  = params.get('wcOrderId');
  const razorpayId = params.get('orderId');
  const isCOD      = params.get('cod') === 'true';
  const [copied, setCopied] = useState(false);
  const [show, setShow]     = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  const copyOrderId = () => {
    if (!wcOrderId) return;
    navigator.clipboard.writeText(`#${wcOrderId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#FFF6EF', color: '#2A0A22' }}>

      {/* Card */}
      <div
        className={`w-full max-w-md bg-white rounded-3xl shadow-sm border border-[#FFE9DD] overflow-hidden
          transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        {/* Top bar */}
        <div className="h-1.5" style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }} />

        <div className="px-8 pt-10 pb-8 text-center">

          {/* Icon */}
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={1.5} />
            </div>
            <span className="absolute -top-1 -right-1 text-xl">🎉</span>
          </div>

          <h1 className="text-2xl font-bold mb-2 font-serif" style={{ color: '#2A0A22' }}>Order Confirmed!</h1>
          <p className="text-sm leading-relaxed" style={{ color: '#2A0A22', opacity: 0.5 }}>
            {isCOD
              ? "Your order has been placed. Our team will contact you for delivery."
              : "Payment successful! Your order is now being processed."}
          </p>

          {/* Order number */}
          {wcOrderId && (
            <button
              onClick={copyOrderId}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all group border border-[#FFE9DD] hover:border-[#E11D74]/30 hover:bg-[#FFF6EF]"
              style={{ background: '#FFF6EF' }}
            >
              <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#2A0A22', opacity: 0.5 }}>Order</span>
              <span className="text-base font-bold" style={{ color: '#2A0A22' }}>#{wcOrderId}</span>
              {copied
                ? <Check className="w-3.5 h-3.5 text-green-500" />
                : <Copy className="w-3.5 h-3.5 group-hover:opacity-80 transition-opacity" style={{ color: '#2A0A22', opacity: 0.4 }} />}
            </button>
          )}

          {/* Details */}
          <div className="mt-6 space-y-3 text-left">
            <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#FFF6EF' }}>
              <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: '#2A0A22', opacity: 0.5 }}>Payment</span>
              <span className={`text-sm font-bold ${isCOD ? 'text-orange-600' : 'text-green-600'}`}>
                {isCOD ? 'Cash on Delivery' : 'Paid Online'}
              </span>
            </div>

            {razorpayId && (
              <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#FFF6EF' }}>
                <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: '#2A0A22', opacity: 0.5 }}>Payment ID</span>
                <span className="text-xs font-mono truncate max-w-[180px]" style={{ color: '#2A0A22', opacity: 0.7 }}>{razorpayId}</span>
              </div>
            )}

            <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#FFF6EF' }}>
              <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: '#2A0A22', opacity: 0.5 }}>Status</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {isCOD ? 'Confirmed' : 'Processing'}
              </span>
            </div>
          </div>

          {/* What's next */}
          <div className="mt-6 p-4 rounded-2xl border border-[#FFE9DD] text-left" style={{ background: '#FFE9DD' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: '#2A0A22' }}>
              <Package className="w-3.5 h-3.5" style={{ color: '#E11D74' }} /> What&apos;s Next
            </p>
            <ul className="space-y-1.5">
              {[
                isCOD ? "We'll call to confirm your order" : "Order confirmation email sent",
                "Books will be packed carefully",
                "Delivery in 3–7 business days",
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-2 text-xs" style={{ color: '#2A0A22', opacity: 0.7 }}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 text-white" style={{ background: '#E11D74' }}>
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-8 pb-8 space-y-3">
          <Link
            href="/collections"
            className="flex items-center justify-center gap-2 w-full py-3.5 text-white text-sm font-bold uppercase tracking-wide rounded-full transition-all shadow-md hover:shadow-lg hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[#FFE9DD] text-sm font-semibold rounded-full transition-all hover:border-[#E11D74]/30 hover:bg-[#FFF6EF]"
            style={{ color: '#2A0A22' }}
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs text-center" style={{ color: '#2A0A22', opacity: 0.4 }}>
        Need help? Email us at{' '}
        <a href="mailto:support@thecurioshelf.com" className="hover:underline font-medium" style={{ color: '#E11D74', opacity: 1 }}>
          support@thecurioshelf.com
        </a>
      </p>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <OrderConfirmationContent />
    </Suspense>
  );
}
