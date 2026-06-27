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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Card */}
      <div
        className={`w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden
          transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        {/* Top bar */}
        <div className="h-1.5 bg-[#ff3131]" />

        <div className="px-8 pt-10 pb-8 text-center">

          {/* Icon */}
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={1.5} />
            </div>
            <span className="absolute -top-1 -right-1 text-xl">🎉</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {isCOD
              ? "Your order has been placed. Our team will contact you for delivery."
              : "Payment successful! Your order is now being processed."}
          </p>

          {/* Order number */}
          {wcOrderId && (
            <button
              onClick={copyOrderId}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-100
                         border border-gray-200 rounded-xl transition-all group"
            >
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Order</span>
              <span className="text-base font-bold text-gray-900">#{wcOrderId}</span>
              {copied
                ? <Check className="w-3.5 h-3.5 text-green-500" />
                : <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />}
            </button>
          )}

          {/* Details */}
          <div className="mt-6 space-y-3 text-left">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Payment</span>
              <span className={`text-sm font-bold ${isCOD ? 'text-orange-600' : 'text-green-600'}`}>
                {isCOD ? 'Cash on Delivery' : 'Paid Online'}
              </span>
            </div>

            {razorpayId && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Payment ID</span>
                <span className="text-xs font-mono text-gray-700 truncate max-w-[180px]">{razorpayId}</span>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Status</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {isCOD ? 'Confirmed' : 'Processing'}
              </span>
            </div>
          </div>

          {/* What's next */}
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-left">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> What's Next
            </p>
            <ul className="space-y-1.5">
              {[
                isCOD ? "We'll call to confirm your order" : "Order confirmation email sent",
                "Books will be packed carefully",
                "Delivery in 3–7 business days",
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-blue-700">
                  <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
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
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#ff3131] hover:bg-[#cc0000]
                       text-white text-sm font-bold uppercase tracking-wide rounded-xl transition-all shadow-md
                       hover:shadow-lg hover:shadow-red-200"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-200
                       text-gray-700 hover:border-gray-300 hover:bg-gray-50 text-sm font-semibold
                       rounded-xl transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        Need help? Email us at{' '}
        <a href="mailto:support@kdbookbazaar.com" className="text-[#ff3131] hover:underline">
          support@kdbookbazaar.com
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
