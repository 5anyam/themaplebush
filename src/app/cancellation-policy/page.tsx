'use client';

import { FileText, CalendarX, RefreshCw, Mail, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CancellationPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── HERO ── */}
      <section className="bg-[#1a1a1a] py-14 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <FileText className="w-3.5 h-3.5 text-[#ff3131]" />
            <span className="text-xs font-semibold text-orange-200 uppercase tracking-wider">Legal Policy</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Order Cancellation Policy
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed max-w-2xl">
            At KD Book Bazaar, customer satisfaction is our top priority. Please review our cancellation terms carefully before placing your order.
          </p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="max-w-3xl mx-auto px-4 py-12 space-y-6">

        {/* Alert banner */}
        <div className="flex items-start gap-3 bg-red-50 border border-[#ff3131]/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-[#ff3131] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            Orders can only be cancelled <span className="font-semibold text-[#ff3131]">before they are shipped</span>. Once dispatched, cancellation is not possible — please refer to our Returns & Refund Policy instead.
          </p>
        </div>

        {/* Policy Cards */}
        {[
          {
            icon: CalendarX,
            title: 'Cancellation Window',
            content: (
              <p className="text-sm text-gray-600 leading-relaxed">
                You can cancel your order within{' '}
                <span className="font-semibold text-[#ff3131]">12 hours</span> of placing it, or until your order is processed and shipped — whichever comes first. After dispatch, cancellation requests will not be accepted.
              </p>
            ),
          },
          {
            icon: RefreshCw,
            title: 'How to Cancel',
            content: (
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>To cancel your order, contact us through any of the following:</p>
                <ul className="space-y-2">
                  {[
                    <>Email us at <a href="mailto:support@kdbookbazaar.com" className="text-[#ff3131] font-semibold hover:underline">support@kdbookbazaar.com</a></>,
                    <>Log in to your account → My Orders → Cancel Order</>,
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-[#ff3131] rounded-full flex-shrink-0 mt-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  Please share your <span className="font-medium text-gray-700">name, order number, and reason for cancellation</span> when contacting us.
                </p>
              </div>
            ),
          },
          {
            icon: Shield,
            title: 'Refund Process',
            content: (
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  If your cancellation is approved before processing or dispatch, your payment will be refunded to your original payment method within{' '}
                  <span className="font-semibold text-[#ff3131]">5–7 business days</span>.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  {[
                    { label: 'UPI / Net Banking', value: '2–3 business days' },
                    { label: 'Credit / Debit Card', value: '5–7 business days' },
                    { label: 'Wallets', value: '1–2 business days' },
                    { label: 'COD Orders', value: 'No charge applicable' },
                  ].map((row, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-700">{row.label}</p>
                      <p className="text-xs text-[#ff3131] font-medium mt-0.5">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-[#ff3131]/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <card.icon className="w-5 h-5 text-[#ff3131]" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-900 mb-3">{card.title}</h2>
                {card.content}
              </div>
            </div>
          </div>
        ))}

        {/* Contact strip */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Need Help?</p>
          <div className="flex flex-wrap gap-6">
            <a
              href="mailto:support@kdbookbazaar.com"
              className="flex items-center gap-2.5 text-sm text-gray-700 hover:text-[#ff3131] transition-colors group"
            >
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-[#ff3131] transition-colors">
                <Mail className="w-4 h-4 text-[#ff3131] group-hover:text-white transition-colors" />
              </div>
              support@kdbookbazaar.com
            </a>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center pb-4">
          For post-delivery issues, please visit our{' '}
          <Link href="/returns-and-refunds-policy" className="text-[#ff3131] hover:underline font-medium">
            Returns & Refund Policy
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
