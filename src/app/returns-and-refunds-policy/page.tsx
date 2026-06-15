'use client';

import { Shield, Package, CheckCircle, Clock, RefreshCw, AlertCircle, Mail, Phone, ChevronRight, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface PolicyItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

const policyItems: PolicyItem[] = [
  {
    icon: Clock,
    title: '7-Day Return Window',
    description: 'Eligible returns must be requested within 7 days of delivery through our customer care team, WhatsApp, or email support.',
  },
  {
    icon: Package,
    title: 'Product Condition',
    description: 'Returned items must be unused, in original packaging with all accessories intact, and accompanied by a valid proof of purchase.',
  },
  {
    icon: CheckCircle,
    title: 'Inspection & Approval',
    description: 'Once your item is received and inspected, we will notify you within 24–48 hours regarding the approval or rejection of your return.',
  },
  {
    icon: RefreshCw,
    title: 'Refund Processing',
    description: 'Approved refunds will be processed to your original payment method within 5–7 business days. COD orders are refunded via bank transfer.',
  },
  {
    icon: Shield,
    title: 'Exchange & Replacement',
    description: 'For exchanges, replacements, or damaged deliveries, our support team will coordinate immediate corrective action to ensure your complete satisfaction.',
  },
  {
    icon: AlertCircle,
    title: 'Non-Returnable Items',
    description: 'Certain products such as custom-made items, perishables, or hygiene-sensitive goods are not eligible for return unless defective upon arrival.',
  },
];

const faqItems: FAQItem[] = [
  {
    question: 'How do I initiate a return?',
    answer: 'Contact our customer care team via WhatsApp, call, or email within 7 days of delivery with your order number and reason for return. You can also raise a return request from My Orders in your account.',
  },
  {
    question: 'Who pays for return shipping?',
    answer: 'For defective, damaged, or incorrect items, we cover the return shipping cost. For other returns (change of mind, size issues), the customer is responsible for return shipping.',
  },
  {
    question: 'How long does a refund take?',
    answer: 'Once your return is approved and received, refunds are processed within 5–7 business days to your original payment method. UPI and wallet refunds may be faster (2–3 days).',
  },
  {
    question: 'Can I exchange my item?',
    answer: 'Yes! Our support team will help coordinate exchanges for size, color, or product variations based on availability. Exchanges are processed within 3–5 business days.',
  },
  {
    question: 'What if my order arrived damaged?',
    answer: 'Please take photos or a video of the damaged item and packaging immediately. Contact us within 48 hours of delivery and we will arrange a free replacement or full refund.',
  },
];

export default function ReturnRefundPolicy() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── HERO ── */}
      <section className="bg-[#1a1a1a] py-14 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <Shield className="w-3.5 h-3.5 text-[#ff3131]" />
            <span className="text-xs font-semibold text-orange-200 uppercase tracking-wider">Customer Protection</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Return & Refund Policy
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed max-w-2xl">
            Your satisfaction is our priority. We ensure a transparent, hassle-free return and refund process on every order.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            At <span className="font-semibold text-[#ff3131]">KD Book Bazaar</span>, we stand behind every product we deliver. Each item is inspected before dispatch to meet our quality standards. However, if your order does not meet your expectations, we ensure a smooth and transparent resolution process — no hassle, no stress.
          </p>
        </div>

        {/* Policy Items */}
        <div className="space-y-4">
          {policyItems.map((item, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-[#ff3131]/20 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff3131] transition-colors duration-300">
                  <item.icon className="w-5 h-5 text-[#ff3131] group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Refund timeline table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Refund Timeline by Payment Method</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: 'UPI / Net Banking', value: '2–3 business days' },
              { label: 'Credit / Debit Card', value: '5–7 business days' },
              { label: 'Wallets (Paytm etc.)', value: '1–2 business days' },
              { label: 'COD (Bank Transfer)', value: '5–7 business days' },
            ].map((row, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs font-semibold text-gray-700">{row.label}</p>
                <p className="text-xs text-[#ff3131] font-medium mt-0.5">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing quote */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff3131]/10 rounded-full blur-2xl pointer-events-none" />
          <p className="relative z-10 text-sm text-blue-200 leading-relaxed italic text-center max-w-2xl mx-auto">
            At <span className="text-[#ff3131] font-semibold not-italic">KD Book Bazaar</span>, every return is an opportunity to reaffirm our promise of quality, trust, and unmatched service. We are not satisfied until you are.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-[#ff3131]" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((faq, index) => (
              <details
                key={index}
                className="group border border-gray-100 rounded-xl overflow-hidden hover:border-[#ff3131]/20 transition-all"
              >
                <summary className="px-5 py-4 cursor-pointer flex items-center justify-between text-sm font-semibold text-gray-900 bg-gray-50 hover:bg-red-50/30 transition-colors list-none">
                  <span>{faq.question}</span>
                  <ChevronRight className="w-4 h-4 text-[#ff3131] flex-shrink-0 group-open:rotate-90 transition-transform duration-200" />
                </summary>
                <div className="px-5 py-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-900 mb-1">Need Help with a Return?</h3>
          <p className="text-sm text-gray-500 mb-5">Our support team is ready to assist you — Mon–Sat, 10 AM–7 PM IST.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:support@kdbookbazaar.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ff3131] hover:bg-[#cc0000] text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:shadow-orange-200"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <a
              href="https://wa.me/919911636888"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md"
            >
              💬 WhatsApp Us
            </a>
            <a
              href="tel:+919911636888"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
            >
              <Phone className="w-4 h-4" />
              Call Us
            </a>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">
          © {new Date().getFullYear()} KD Book Bazaar. All rights reserved. &nbsp;·&nbsp;{' '}
          <Link href="/cancellation-policy" className="text-[#ff3131] hover:underline">Cancellation Policy</Link>
          {' '}&nbsp;·&nbsp;{' '}
          <Link href="/terms-and-conditions" className="text-[#ff3131] hover:underline">Terms & Conditions</Link>
        </p>
      </div>
    </main>
  );
}
