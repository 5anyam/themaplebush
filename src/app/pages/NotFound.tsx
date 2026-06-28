'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Search, Home } from 'lucide-react';

export default function NotFound() {
  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      window.location.pathname
    );
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 text-center">

        {/* Brand Icon */}
        <div className="w-16 h-16 bg-[#ff3131] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-200">
          <ShoppingBag className="w-8 h-8 text-white" />
        </div>

        {/* 404 */}
        <div>
          <p className="text-8xl font-black text-[#1a1a1a] leading-none mb-2">404</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ff3131] hover:bg-[#cc0000] text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:shadow-orange-200"
          >
            <Home className="w-4 h-4" />
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/search"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
          >
            <Search className="w-4 h-4" />
            Browse Products
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          Need help?{' '}
          <a href="mailto:hello@thecurioshelf.in" className="text-[#E11D74] hover:underline font-medium">
            Contact Support
          </a>
        </p>
      </div>
    </main>
  );
}
