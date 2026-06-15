'use client';

import { Truck, Clock, MapPin, Bell, Shield, Package, ChevronRight, Mail, CheckCircle, Phone, LucideIcon } from 'lucide-react';
import Link from 'next/link';

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
    <main className="min-h-screen bg-gray-50">

      {/* ── HERO ── */}
      <section className="bg-[#1a1a1a] py-14 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <Truck className="w-3.5 h-3.5 text-[#ff3131]" />
            <span className="text-xs font-semibold text-orange-200 uppercase tracking-wider">Fast & Secure Delivery</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Shipping Policy</h1>
          <p className="text-blue-200 text-sm leading-relaxed max-w-2xl">
            Timely, secure, and transparent delivery — every step of the way, across all of India.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            At <span className="font-semibold text-[#ff3131]">KD Book Bazaar</span>, we understand that a seamless shopping experience extends beyond your purchase — it is about timely, secure, and transparent delivery every step of the way.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Every order we ship reflects our commitment to precision, responsibility, and reliability. Shipping is not the end of the sale — it is the beginning of confidence delivered.
          </p>
        </div>

        {/* Shipping Items */}
        <div className="space-y-4">
          {shippingItems.map((item, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-[#ff3131]/20 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff3131] transition-colors duration-300">
                  <item.icon className="w-5 h-5 text-[#ff3131] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                    <span className="text-[10px] font-bold text-[#ff3131] bg-red-50 px-2.5 py-1 rounded-full flex-shrink-0 border border-[#ff3131]/20">
                      {item.highlight}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Coverage */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-5">Pan-India Delivery Coverage</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { region: 'Metro Cities', time: '2–3 Business Days', icon: '🏙️', examples: 'Delhi, Mumbai, Bangalore, Chennai' },
              { region: 'Tier 2 Cities', time: '3–5 Business Days', icon: '🌆', examples: 'Jaipur, Lucknow, Bhopal, Surat' },
              { region: 'Remote Areas', time: '5–7 Business Days', icon: '🏞️', examples: 'Northeast, J&K, Andaman' },
            ].map((area, index) => (
              <div
                key={index}
                className="text-center p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#ff3131]/20 hover:shadow-sm transition-all"
              >
                <div className="text-3xl mb-2">{area.icon}</div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{area.region}</h4>
                <p className="text-xs text-[#ff3131] font-semibold mb-2">{area.time}</p>
                <p className="text-[11px] text-gray-400">{area.examples}</p>
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
        <div className="bg-[#1a1a1a] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff3131]/10 rounded-full blur-2xl pointer-events-none" />
          <p className="relative z-10 text-sm text-blue-200 leading-relaxed italic text-center max-w-2xl mx-auto">
            At <span className="text-[#ff3131] font-semibold not-italic">KD Book Bazaar</span>, every shipment is more than a parcel — it is a promise delivered with care, speed, and reliability.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-[#ff3131]" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Shipping FAQs</h2>
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
          <h3 className="text-base font-bold text-gray-900 mb-1">Questions About Your Delivery?</h3>
          <p className="text-sm text-gray-500 mb-5">Our support team is ready to help — Mon–Sat, 10 AM–7 PM IST.</p>
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
            <Link
              href="/returns-and-refunds-policy"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
            >
              Return Policy
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Trust badges */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-wrap justify-center items-center gap-6">
            {badges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                  <badge.icon className="w-4 h-4 text-[#ff3131]" />
                </div>
                <span className="text-xs font-medium text-gray-600">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">
          © {new Date().getFullYear()} KD Book Bazaar. All rights reserved. &nbsp;·&nbsp;{' '}
          <Link href="/returns-and-refunds-policy" className="text-[#ff3131] hover:underline">Return Policy</Link>
          {' '}&nbsp;·&nbsp;{' '}
          <Link href="/cancellation-policy" className="text-[#ff3131] hover:underline">Cancellation Policy</Link>
        </p>
      </div>
    </main>
  );
}
