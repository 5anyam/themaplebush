'use client';

import React from 'react';
import { Shield, Lock, Eye, UserCheck, FileText, Mail, MapPin, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const GRADIENT = 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)';

const sections = [
  {
    icon: UserCheck,
    number: '1',
    title: 'Personal Information We Collect',
    content: (
      <ul className="space-y-2 text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
        {[
          'Name, contact details (email, phone number), shipping & billing address',
          'Product preferences, purchase history, and wishlist items',
          'Payment information (securely processed via trusted payment gateways)',
          'Device information, IP address, cookies, and browsing behavior on our Platform',
          'Product reviews, ratings, testimonials, and feedback',
          'Social media interactions and customer support communications',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ background: '#E11D74' }} />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: Eye,
    number: '2',
    title: 'How We Collect Information',
    content: (
      <ul className="space-y-2 text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
        {[
          'When you purchase products or create an account on The Curio Shelf',
          'During newsletter signups, product wishlist additions, or promotional registrations',
          'Through product reviews, customer surveys, and feedback forms',
          'Via cookies and analytics tools to enhance your shopping experience',
          'From trusted partners like payment processors and delivery service providers',
          'Customer service interactions, return requests, and order support',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ background: '#E11D74' }} />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: ShoppingBag,
    number: '3',
    title: 'Purpose of Use',
    content: (
      <ul className="space-y-2 text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
        {[
          'Process and deliver your orders with secure packaging and real-time tracking',
          'Provide personalized product recommendations based on your preferences',
          'Offer exceptional customer support for orders, returns, and refunds',
          'Send exclusive offers, new product launches, and deal notifications',
          'Improve our website performance and create a seamless shopping experience',
          'Prevent fraud and ensure secure transactions on our platform',
          'Send order updates, shipment notifications, and delivery confirmations',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ background: '#E11D74' }} />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: Shield,
    number: '4',
    title: 'Sharing of Personal Information',
    content: (
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
        <p>
          We may share your data with trusted service providers including payment processors, logistics partners, and analytics platforms. We comply with legal requirements when necessary.
        </p>
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
          <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">
            We <span className="font-bold">never sell</span> your personal information to third parties. Your privacy is our priority.
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: FileText,
    number: '5',
    title: 'Cookies and Tracking Technologies',
    content: (
      <p className="text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
        We use cookies to remember your preferences, analyze shopping patterns, and provide relevant product recommendations. You can manage cookies through your browser settings, though this may affect certain features like saved carts and wishlists.
      </p>
    ),
  },
  {
    icon: Lock,
    number: '6',
    title: 'Data Security',
    content: (
      <p className="text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
        We implement industry-standard encryption, SSL-certified secure payment gateways, and advanced firewalls to protect your personal and payment information. We regularly update our security protocols to stay ahead of potential threats and ensure your data remains safe at all times.
      </p>
    ),
  },
  {
    icon: UserCheck,
    number: '7',
    title: 'Your Rights and Choices',
    content: (
      <ul className="space-y-2 text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
        {[
          'Access, update, or correct your personal information anytime from your account',
          'Unsubscribe from marketing emails and promotional communications',
          'Request deletion of your account and associated data',
          'Opt-out of personalized product recommendations',
          'Download your order history and purchase records',
          'Manage cookie preferences through your browser settings',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ background: '#E11D74' }} />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: Shield,
    number: '8',
    title: 'Age Restrictions',
    content: (
      <p className="text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
        Our products and services are intended for individuals 18 years of age or older. We do not knowingly collect personal information from minors under 18. If you are under 18, please seek parental consent before making purchases or creating an account.
      </p>
    ),
  },
  {
    icon: FileText,
    number: '9',
    title: 'Policy Updates',
    content: (
      <p className="text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
        We may update this Privacy Policy as we introduce new products, features, or expand our offerings. Updates will be reflected with a revised effective date at the top of this page. We will notify you of significant changes through email or prominent notifications on our website.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen" style={{ background: '#FFF6EF', color: '#2A0A22' }}>

      {/* ── HERO ── */}
      <section className="py-14 px-4 relative overflow-hidden" style={{ background: GRADIENT }}>
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-5">
            <Shield className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Your Privacy Matters</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-white mb-3 tracking-tight">Privacy Policy</h1>
          <p className="text-white/80 text-sm mb-1">Effective Date: November 14, 2025</p>
          <p className="text-white/80 text-sm leading-relaxed max-w-2xl">
            At The Curio Shelf, we are committed to protecting your personal information and ensuring transparency about how we collect, use, and safeguard your data.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-6">
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#2A0A22' }}>
            <span className="font-semibold" style={{ color: '#E11D74' }}>The Curio Shelf</span> (Company, we, our, or us) is committed to protecting your privacy as you shop across our range of bags, pouches, organisers, and carry goods — all made in India. This Privacy Policy outlines how we collect, use, disclose, and safeguard your Personal Information through our platform at{' '}
            <a href="https://www.thecurioshelf.in" className="font-medium hover:underline" style={{ color: '#E11D74' }}>
              www.thecurioshelf.in
            </a>{' '}
            (the Platform).
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#2A0A22' }}>
            By accessing or using our Platform, purchasing our products, or engaging with our services, you agree to the terms of this Privacy Policy and consent to the practices described herein.
          </p>
        </div>

        {/* Policy sections */}
        {sections.map((section, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-6 hover:shadow-md transition-all duration-300"
            style={{ borderColor: '#FFE9DD' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFE9DD' }}>
                <section.icon className="w-5 h-5" style={{ color: '#E11D74' }} />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold font-serif mb-3" style={{ color: '#2A0A22' }}>
                  {section.number}. {section.title}
                </h2>
                <div className="rounded-xl border border-[#FFE9DD] p-4" style={{ background: '#FFF6EF' }}>
                  {section.content}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Contact — Section 10 */}
        <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FFE9DD' }}>
              <Mail className="w-5 h-5" style={{ color: '#E11D74' }} />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif mb-1" style={{ color: '#2A0A22' }}>10. Contact & Customer Support</h2>
              <p className="text-sm" style={{ color: '#2A0A22', opacity: 0.6 }}>
                For privacy-related questions, data requests, or any concerns, reach out to us:
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-1 gap-4 max-w-sm">
            <a
              href="mailto:hello@thecurioshelf.in"
              className="flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 group"
              style={{ background: '#FFF6EF', borderColor: '#FFE9DD' }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style={{ background: '#FFE9DD' }}>
                <Mail className="w-4 h-4" style={{ color: '#E11D74' }} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#2A0A22', opacity: 0.5 }}>Email</p>
                <p className="text-sm font-semibold" style={{ color: '#2A0A22' }}>hello@thecurioshelf.in</p>
              </div>
            </a>
          </div>

          {/* Address */}
          <div className="mt-4 flex items-start gap-3 p-4 rounded-xl border" style={{ background: '#FFF6EF', borderColor: '#FFE9DD' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#FFE9DD' }}>
              <MapPin className="w-4 h-4" style={{ color: '#E11D74' }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#2A0A22', opacity: 0.5 }}>Website</p>
              <address className="text-sm not-italic leading-relaxed" style={{ color: '#2A0A22' }}>
                The Curio Shelf<br />
                thecurioshelf.in<br />
                India
              </address>
            </div>
          </div>

          <p className="text-xs mt-4" style={{ color: '#2A0A22', opacity: 0.4 }}>
            Response Time: Within 24 hours &nbsp;·&nbsp; Available: Monday–Saturday, 10 AM–7 PM IST
          </p>
        </div>

        {/* CTA footer */}
        <div className="rounded-2xl p-8 text-white text-center relative overflow-hidden" style={{ background: GRADIENT }}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold font-serif mb-2">Your Data, Protected</h3>
            <p className="text-sm text-white/80 max-w-xl mx-auto leading-relaxed mb-5">
              At The Curio Shelf, we safeguard your personal information with the highest standards of security and privacy — so you can shop with complete confidence.
            </p>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-sm font-bold uppercase tracking-wide transition-all shadow-lg rounded-full"
              style={{ color: '#E11D74' }}
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Now
            </Link>
          </div>
        </div>

        <p className="text-xs text-center pb-4" style={{ color: '#2A0A22', opacity: 0.4 }}>
          © {new Date().getFullYear()} The Curio Shelf. All rights reserved. &nbsp;·&nbsp;{' '}
          <Link href="/disclaimer" className="hover:underline" style={{ color: '#E11D74' }}>Disclaimer</Link>
          {' '}&nbsp;·&nbsp;{' '}
          <Link href="/terms-and-conditions" className="hover:underline" style={{ color: '#E11D74' }}>Terms & Conditions</Link>
        </p>
      </div>
    </main>
  );
}
