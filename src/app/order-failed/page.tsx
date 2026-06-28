'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { XCircle, RotateCcw, Home, Mail } from "lucide-react";

function OrderFailedContent() {
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#FFF6EF', color: '#2A0A22' }}>

      <div
        className={`w-full max-w-md bg-white rounded-3xl shadow-sm border border-[#FFE9DD] overflow-hidden
          transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        {/* Top bar */}
        <div className="h-1.5 bg-[#FFE9DD]" />

        <div className="px-8 pt-10 pb-8 text-center">

          {/* Icon */}
          <div className="inline-flex mb-6">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2 font-serif" style={{ color: '#2A0A22' }}>
            {isCancelled ? 'Payment Cancelled' : 'Payment Failed'}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#2A0A22', opacity: 0.5 }}>
            {isCancelled
              ? "You cancelled the payment. Your order has not been placed."
              : "Something went wrong while processing your payment."}
          </p>

          {/* Reassurance */}
          <div className="mt-5 inline-flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-700">No money was deducted</span>
          </div>

          {/* Details */}
          <div className="mt-6 space-y-3 text-left">
            {wcOrderId && (
              <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#FFF6EF' }}>
                <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: '#2A0A22', opacity: 0.5 }}>Order Ref</span>
                <span className="text-sm font-bold" style={{ color: '#2A0A22' }}>#{wcOrderId}</span>
              </div>
            )}
            {amount && (
              <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: '#FFF6EF' }}>
                <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: '#2A0A22', opacity: 0.5 }}>Amount</span>
                <span className="text-sm font-bold" style={{ color: '#2A0A22' }}>₹{parseFloat(amount).toLocaleString('en-IN')}</span>
              </div>
            )}
            {error && !isCancelled && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-xs text-red-500 font-medium leading-relaxed">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-8 pb-8 space-y-3">
          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2 w-full py-3.5 text-white text-sm font-bold uppercase tracking-wide rounded-full transition-all shadow-md hover:shadow-lg hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
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

      <div className="mt-6 flex items-center gap-2 text-xs" style={{ color: '#2A0A22', opacity: 0.4 }}>
        <Mail className="w-3.5 h-3.5" />
        <span>Need help? Email us at{' '}
          <a href="mailto:support@thecurioshelf.com" className="hover:underline font-medium" style={{ color: '#E11D74', opacity: 1 }}>
            support@thecurioshelf.com
          </a>
        </span>
      </div>
    </div>
  );
}

export default function OrderFailedPage() {
  return (
    <Suspense>
      <OrderFailedContent />
    </Suspense>
  );
}
