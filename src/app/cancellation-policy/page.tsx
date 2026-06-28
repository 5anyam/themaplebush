'use client';

import { FileText, CalendarX, RefreshCw, Mail, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const GRADIENT = 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)';

export default function CancellationPolicyPage() {
  return (
    <main className="min-h-screen" style={{ background: '#FFF6EF', color: '#2A0A22' }}>

      {/* ── HERO ── */}
      <section className="py-14 px-4 relative overflow-hidden" style={{ background: GRADIENT }}>
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-5">
            <FileText className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Legal Policy</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-white mb-4 tracking-tight">
            Order Cancellation Policy
          </h1>
          <p className="text-white/80 text-sm leading-relaxed max-w-2xl">
            At The Curio Shelf, customer satisfaction is our top priority. Please review our cancellation terms carefully before placing your order.
          </p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="max-w-3xl mx-auto px-4 py-12 space-y-6">

        {/* Alert banner */}
        <div className="flex items-start gap-3 rounded-xl p-4 border" style={{ background: '#FFE9DD', borderColor: '#FFE9DD' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#E11D74' }} />
          <p className="text-sm" style={{ color: '#2A0A22' }}>
            Orders can only be cancelled <span className="font-semibold" style={{ color: '#E11D74' }}>before they are shipped</span>. Once dispatched, cancellation is not possible — please refer to our Returns & Refund Policy instead.
          </p>
        </div>

        {/* Policy Cards */}
        {[
          {
            icon: CalendarX,
            title: 'Cancellation Window',
            content: (
              <p className="text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
                You can cancel your order within{' '}
                <span className="font-semibold" style={{ color: '#E11D74' }}>12 hours</span> of placing it, or until your order is processed and shipped — whichever comes first. After dispatch, cancellation requests will not be accepted.
              </p>
            ),
          },
          {
            icon: RefreshCw,
            title: 'How to Cancel',
            content: (
              <div className="space-y-3 text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
                <p>To cancel your order, contact us through any of the following:</p>
                <ul className="space-y-2">
                  {[
                    <>Email us at <a href="mailto:hello@thecurioshelf.in" className="font-semibold hover:underline" style={{ color: '#E11D74' }}>hello@thecurioshelf.in</a></>,
                    <>Log in to your account → My Orders → Cancel Order</>,
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ background: '#E11D74' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs rounded-lg p-3 border" style={{ color: '#2A0A22', background: '#FFF6EF', borderColor: '#FFE9DD' }}>
                  Please share your <span className="font-medium">name, order number, and reason for cancellation</span> when contacting us.
                </p>
              </div>
            ),
          },
          {
            icon: Shield,
            title: 'Refund Process',
            content: (
              <div className="space-y-3 text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
                <p>
                  If your cancellation is approved before processing or dispatch, your payment will be refunded to your original payment method within{' '}
                  <span className="font-semibold" style={{ color: '#E11D74' }}>5–7 business days</span>.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  {[
                    { label: 'UPI / Net Banking', value: '2–3 business days' },
                    { label: 'Credit / Debit Card', value: '5–7 business days' },
                    { label: 'Wallets', value: '1–2 business days' },
                    { label: 'COD Orders', value: 'No charge applicable' },
                  ].map((row, i) => (
                    <div key={i} className="rounded-xl p-3 border" style={{ background: '#FFF6EF', borderColor: '#FFE9DD' }}>
                      <p className="text-xs font-semibold" style={{ color: '#2A0A22' }}>{row.label}</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: '#E11D74' }}>{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFE9DD' }}>
                <card.icon className="w-5 h-5" style={{ color: '#E11D74' }} />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold font-serif mb-3" style={{ color: '#2A0A22' }}>{card.title}</h2>
                {card.content}
              </div>
            </div>
          </div>
        ))}

        {/* Contact strip */}
        <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-6">
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#2A0A22' }}>Need Help?</p>
          <div className="flex flex-wrap gap-6">
            <a
              href="mailto:hello@thecurioshelf.in"
              className="flex items-center gap-2.5 text-sm transition-colors group"
              style={{ color: '#2A0A22' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: '#FFE9DD' }}>
                <Mail className="w-4 h-4" style={{ color: '#E11D74' }} />
              </div>
              hello@thecurioshelf.in
            </a>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-center pb-4" style={{ color: '#2A0A22', opacity: 0.4 }}>
          For post-delivery issues, please visit our{' '}
          <Link href="/returns-and-refunds-policy" className="font-medium hover:underline" style={{ color: '#E11D74' }}>
            Returns & Refund Policy
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
