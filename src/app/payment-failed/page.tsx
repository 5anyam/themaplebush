'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { XCircle, AlertCircle, RotateCcw, Home, Mail } from "lucide-react";

function PaymentFailedContent() {
  const params    = useSearchParams();
  const wcOrderId = params.get('wcOrderId');
  const amount    = params.get('amount');
  const error     = params.get('error');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  const isCancelled = error?.toLowerCase().includes('cancel');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

      <div
        className={`w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden
          transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        {/* Top accent bar */}
        <div className={`h-1.5 ${isCancelled ? 'bg-orange-400' : 'bg-[#ff3131]'}`} />

        <div className="px-8 pt-10 pb-8 text-center">

          {/* Icon */}
          <div className="inline-flex mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isCancelled ? 'bg-orange-50' : 'bg-red-50'
            }`}>
              {isCancelled
                ? <AlertCircle className="w-10 h-10 text-orange-500" strokeWidth={1.5} />
                : <XCircle className="w-10 h-10 text-[#ff3131]" strokeWidth={1.5} />
              }
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isCancelled ? 'Payment Cancelled' : 'Payment Failed'}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            {isCancelled
              ? "You cancelled the payment. Your order has not been placed. No charges were made."
              : "We couldn't process your payment. Please try again with a different method."}
          </p>

          {/* No deduction badge */}
          <div className="mt-5 inline-flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-700">No money was deducted</span>
          </div>

          {/* Info rows */}
          <div className="mt-6 space-y-3 text-left">
            {wcOrderId && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Order Ref</span>
                <span className="text-sm font-bold text-gray-900">#{wcOrderId}</span>
              </div>
            )}
            {amount && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Amount</span>
                <span className="text-sm font-bold text-gray-900">
                  ₹{parseFloat(amount).toLocaleString('en-IN')}
                </span>
              </div>
            )}
            {error && !isCancelled && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-xs font-semibold text-red-600 mb-1">Reason</p>
                <p className="text-xs text-red-500 leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {!isCancelled && (
            <div className="mt-5 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-left">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">
                Things to try
              </p>
              <ul className="space-y-1.5">
                {[
                  "Check your card/UPI balance",
                  "Try a different payment method",
                  "Use COD (Cash on Delivery) option",
                ].map((tip, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-blue-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="px-8 pb-8 space-y-3">
          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#ff3131] hover:bg-[#cc0000]
                       text-white text-sm font-bold uppercase tracking-wide rounded-xl transition-all
                       shadow-md hover:shadow-lg hover:shadow-red-200"
          >
            <RotateCcw className="w-4 h-4" />
            {isCancelled ? 'Return to Checkout' : 'Try Again'}
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

      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
        <Mail className="w-3.5 h-3.5" />
        <span>
          Need help? Email us at{' '}
          <a href="mailto:support@kdbookbazaar.com" className="text-[#ff3131] hover:underline">
            support@kdbookbazaar.com
          </a>
        </span>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense>
      <PaymentFailedContent />
    </Suspense>
  );
}
