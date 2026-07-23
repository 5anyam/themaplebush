'use client';

import { Truck, Clock, MapPin, Bell, Shield, Package, ChevronRight, Mail, CheckCircle, LucideIcon } from 'lucide-react';
import Link from 'next/link';

const GRADIENT = 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)';

interface ShippingItem {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface BadgeItem {
  icon: LucideIcon;
  text: string;
}

const shippingItems: ShippingItem[] = [
  {
    icon: Clock,
    title: 'Order Processing',
    description: 'All confirmed orders are prepared for dispatch within 24–48 business hours. You will receive a dispatch confirmation via SMS and email.',
    highlight: '24–48 Hours',
  },
  {
    icon: Truck,
    title: 'Trusted Courier Partners',
    description: 'We collaborate with trusted national courier partners — Delhivery, BlueDart, Ekart, and more — to ensure quick and safe delivery to your doorstep.',
    highlight: 'Reliable Delivery',
  },
  {
    icon: MapPin,
    title: 'Delivery Timeline',
    description: 'Metro cities: 2–3 days. Tier 2 cities: 3–5 days. Remote or rural areas: 5–7 business days, depending on your location and courier availability.',
    highlight: '2–7 Days',
  },
  {
    icon: Bell,
    title: 'Live Order Tracking',
    description: 'Once your package is dispatched, you will receive an SMS and email with a live tracking link so you can follow every stage of its journey.',
    highlight: 'Real-Time Updates',
  },
  {
    icon: Shield,
    title: 'Customer Support',
    description: 'In the unlikely event of a delay or delivery concern, our customer care team will step in immediately to provide updates and prompt solutions.',
    highlight: 'Mon–Sat Support',
  },
  {
    icon: Package,
    title: 'Secure Packaging',
    description: 'Every order is carefully packed with protective materials to ensure it arrives in perfect condition. High-value items are shipped with tamper-proof seals.',
    highlight: 'Safe Delivery',
  },
];

const faqItems: FAQItem[] = [
  {
    question: 'When will my order be shipped?',
    answer: 'All confirmed orders are processed and shipped within 24–48 business hours. You will receive a confirmation SMS and email once your order is dispatched.',
  },
  {
    question: 'How can I track my order?',
    answer: 'Once shipped, you will receive an SMS and email with your tracking number and a direct link to track your package in real-time on the courier\'s website. You can also track from My Orders in your account.',
  },
  {
    question: 'Do you ship to remote locations?',
    answer: 'Yes! We ship Pan India, including remote and rural areas. Delivery may take 5–7 business days for such locations.',
  },
  {
    question: 'What if my order is delayed?',
    answer: 'Our team monitors all shipments. In case of any delay, we will proactively contact you with updates and work with the courier to resolve the issue as quickly as possible.',
  },
  {
    question: 'Are there any shipping charges?',
    answer: 'Free shipping is available on all orders above ₹499. For orders below ₹499, a flat shipping fee of ₹49 is applicable. COD orders may have an additional handling charge.',
  },
  {
    question: 'Can I change my delivery address after placing an order?',
    answer: 'Please contact our support team immediately if you need to change your delivery address. We can accommodate changes only if the order has not been dispatched yet.',
  },
];

const badges: BadgeItem[] = [
  { icon: CheckCircle, text: 'Secure Packaging' },
  { icon: Truck, text: 'Trusted Couriers' },
  { icon: Shield, text: 'Safe Delivery' },
  { icon: Bell, text: 'Real-Time Tracking' },
];

export default function ShippingPolicy() {
  return (
    <main className="min-h-screen" style={{ background: '#FFF6EF', color: '#2A0A22' }}>

      {/* Logo bar */}
      <div className="border-b border-[#FFE9DD]" style={{ background: '#FAF0E8' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><img src="/logo.jpeg" alt="The Curio Shelf" className="h-9 w-auto" /></Link>
          <Link href="/collections" className="text-[12px] font-semibold hover:text-[#E11D74] transition-colors" style={{ color: 'rgba(42,10,34,0.5)' }}>Shop Now →</Link>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="py-14 px-4 relative overflow-hidden" style={{ background: GRADIENT }}>
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-5">
            <Truck className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Fast & Secure Delivery</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-white mb-3 tracking-tight">Shipping Policy</h1>
          <p className="text-white/80 text-sm leading-relaxed max-w-2xl">
            Timely, secure, and transparent delivery — every step of the way, across all of India.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-6">
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#2A0A22' }}>
            At <span className="font-semibold" style={{ color: '#E11D74' }}>The Curio Shelf</span>, we understand that a seamless shopping experience extends beyond your purchase — it is about timely, secure, and transparent delivery every step of the way.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
            Every order we ship reflects our commitment to precision, responsibility, and reliability. Shipping is not the end of the sale — it is the beginning of confidence delivered.
          </p>
        </div>

        {/* Shipping Items */}
        <div className="space-y-4">
          {shippingItems.map((item, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300" style={{ background: '#FFE9DD' }}>
                  <item.icon className="w-5 h-5" style={{ color: '#E11D74' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-bold" style={{ color: '#2A0A22' }}>{item.title}</h3>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 border" style={{ color: '#E11D74', background: '#FFE9DD', borderColor: '#FFE9DD' }}>
                      {item.highlight}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#2A0A22', opacity: 0.7 }}>{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Coverage */}
        <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-6">
          <h3 className="text-sm font-bold font-serif uppercase tracking-wide mb-5" style={{ color: '#2A0A22' }}>Pan-India Delivery Coverage</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { region: 'Metro Cities', time: '2–3 Business Days', icon: '🏙️', examples: 'Delhi, Mumbai, Bangalore, Chennai' },
              { region: 'Tier 2 Cities', time: '3–5 Business Days', icon: '🌆', examples: 'Jaipur, Lucknow, Bhopal, Surat' },
              { region: 'Remote Areas', time: '5–7 Business Days', icon: '🏞️', examples: 'Northeast, J&K, Andaman' },
            ].map((area, index) => (
              <div
                key={index}
                className="text-center p-5 rounded-xl border hover:shadow-sm transition-all"
                style={{ background: '#FFF6EF', borderColor: '#FFE9DD' }}
              >
                <div className="text-3xl mb-2">{area.icon}</div>
                <h4 className="text-sm font-bold mb-1" style={{ color: '#2A0A22' }}>{area.region}</h4>
                <p className="text-xs font-semibold mb-2" style={{ color: '#E11D74' }}>{area.time}</p>
                <p className="text-[11px]" style={{ color: '#2A0A22', opacity: 0.5 }}>{area.examples}</p>
              </div>
            ))}
          </div>
          {/* Free shipping note */}
          <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-xs text-green-700 font-medium">
              Free shipping on all orders above <span className="font-bold">₹499</span>. Flat ₹49 below that.
            </p>
          </div>
        </div>

        {/* Closing quote */}
        <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: GRADIENT }}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <p className="relative z-10 text-sm text-white/80 leading-relaxed italic text-center max-w-2xl mx-auto">
            At <span className="text-white font-semibold not-italic">The Curio Shelf</span>, every shipment is more than a parcel — it is a promise delivered with care, speed, and reliability.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FFE9DD' }}>
              <Truck className="w-4 h-4" style={{ color: '#E11D74' }} />
            </div>
            <h2 className="text-base font-bold font-serif" style={{ color: '#2A0A22' }}>Shipping FAQs</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((faq, index) => (
              <details
                key={index}
                className="group border rounded-xl overflow-hidden transition-all"
                style={{ borderColor: '#FFE9DD' }}
              >
                <summary className="px-5 py-4 cursor-pointer flex items-center justify-between text-sm font-semibold transition-colors list-none" style={{ background: '#FFF6EF', color: '#2A0A22' }}>
                  <span>{faq.question}</span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 group-open:rotate-90 transition-transform duration-200" style={{ color: '#E11D74' }} />
                </summary>
                <div className="px-5 py-4 text-sm leading-relaxed border-t" style={{ color: '#2A0A22', borderColor: '#FFE9DD' }}>
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-6">
          <h3 className="text-base font-bold font-serif mb-1" style={{ color: '#2A0A22' }}>Questions About Your Delivery?</h3>
          <p className="text-sm mb-5" style={{ color: '#2A0A22', opacity: 0.5 }}>Our support team is ready to help — Mon–Sat, 10 AM–7 PM IST.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:hello@thecurioshelf.in"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white rounded-full text-sm font-bold uppercase tracking-wide transition-all shadow-md"
              style={{ background: GRADIENT }}
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <Link
              href="/returns-and-refunds-policy"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide transition-all border"
              style={{ background: '#FFE9DD', color: '#2A0A22', borderColor: '#FFE9DD' }}
            >
              Return Policy
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Trust badges */}
        <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-5">
          <div className="flex flex-wrap justify-center items-center gap-6">
            {badges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FFE9DD' }}>
                  <badge.icon className="w-4 h-4" style={{ color: '#E11D74' }} />
                </div>
                <span className="text-xs font-medium" style={{ color: '#2A0A22', opacity: 0.7 }}>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center pb-4" style={{ color: '#2A0A22', opacity: 0.4 }}>
          © {new Date().getFullYear()} The Curio Shelf. All rights reserved. &nbsp;·&nbsp;{' '}
          <Link href="/returns-and-refunds-policy" className="hover:underline" style={{ color: '#E11D74' }}>Return Policy</Link>
          {' '}&nbsp;·&nbsp;{' '}
          <Link href="/cancellation-policy" className="hover:underline" style={{ color: '#E11D74' }}>Cancellation Policy</Link>
        </p>
      </div>
    </main>
  );
}
