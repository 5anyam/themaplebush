'use client';

import React from 'react';
import { Shield, AlertTriangle, Info, FileText, Link2, Scale, Mail, Phone, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    icon: ShoppingBag,
    number: '1',
    title: 'Product Information and Descriptions',
    content: (
      <ul className="space-y-2 text-sm text-gray-600 leading-relaxed">
        {[
          'Product descriptions, images, specifications, and compatibility details are provided for informational purposes only and may contain minor inaccuracies or omissions.',
          'Colors, materials, and designs may vary slightly from displayed images due to lighting, screen settings, or manufacturing variations.',
          'We reserve the right to modify product specifications, pricing, or availability without prior notice.',
          'Compatibility with specific devices is based on manufacturer guidelines, but we do not guarantee perfect fit for all variants or aftermarket modifications.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-[#ff3131] rounded-full flex-shrink-0 mt-2" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: AlertTriangle,
    number: '2',
    title: 'Limitation of Liability',
    content: (
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
        <p>
          KD Book Bazaar shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to the use of the Platform, products, or services, including but not limited to loss of data, profits, or business opportunities.
        </p>
        <p>
          Our total liability for any claim shall not exceed the amount paid by you for the product(s) in question. This limitation applies regardless of the cause of action, including negligence or strict liability.
        </p>
      </div>
    ),
  },
  {
    icon: Scale,
    number: '3',
    title: 'No Warranties',
    content: (
      <ul className="space-y-2 text-sm text-gray-600 leading-relaxed">
        {[
          'The products are provided "as is" and "as available" without any express or implied warranties of merchantability, fitness for a particular purpose, or non-infringement.',
          'We do not warrant that the Platform will be error-free, uninterrupted, or secure, or that any defects will be corrected.',
          'Any warranties provided with products are limited to those from the manufacturer and do not extend to the Platform or our services.',
          'Users assume all risks associated with the use of products, including potential damage to devices or personal injury.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-[#ff3131] rounded-full flex-shrink-0 mt-2" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: Link2,
    number: '4',
    title: 'Third-Party Links and Content',
    content: (
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
        <p>
          The Platform may contain links to third-party websites or services. We do not endorse, monitor, or control such external sites and are not responsible for their content, privacy practices, or availability.
        </p>
        <p>
          Your interactions with third parties are at your own risk, and any disputes should be resolved directly with those providers. We disclaim all liability for any loss or damage arising from third-party content.
        </p>
      </div>
    ),
  },
  {
    icon: FileText,
    number: '5',
    title: 'User Responsibilities',
    content: (
      <ul className="space-y-2 text-sm text-gray-600 leading-relaxed">
        {[
          'You are responsible for providing accurate information during purchases, including device compatibility and shipping details.',
          'Do not use the Platform for unlawful purposes or in violation of any applicable laws.',
          'You agree to indemnify us against any claims arising from your misuse of the Platform or products.',
          'Product installation or application (e.g., screen protectors) is at your own risk; improper use may void warranties.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-[#ff3131] rounded-full flex-shrink-0 mt-2" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: Info,
    number: '6',
    title: 'Governing Law and Disputes',
    content: (
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
        <p>
          This Disclaimer is governed by the laws of India, without regard to conflict of law principles. Any disputes arising from or related to this Disclaimer or the Platform shall be resolved exclusively in the courts of New Delhi, India.
        </p>
        <p>
          We encourage amicable resolution of any issues. Please contact us using the details below before pursuing legal action.
        </p>
      </div>
    ),
  },
  {
    icon: FileText,
    number: '7',
    title: 'Changes to This Disclaimer',
    content: (
      <p className="text-sm text-gray-600 leading-relaxed">
        We may update this Disclaimer from time to time to reflect changes in our practices or legal requirements. The updated version will be posted on the Platform with a revised effective date. Your continued use of the Platform after such changes constitutes acceptance of the new terms.
      </p>
    ),
  },
];

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── HERO ── */}
      <section className="bg-[#1a1a1a] py-14 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <Shield className="w-3.5 h-3.5 text-[#ff3131]" />
            <span className="text-xs font-semibold text-orange-200 uppercase tracking-wider">Legal Notice</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Disclaimer</h1>
          <p className="text-blue-200 text-sm mb-1">Effective Date: November 14, 2025</p>
          <p className="text-blue-200 text-sm leading-relaxed max-w-2xl">
            Important legal information regarding the use of the KD Book Bazaar platform and products.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">

        {/* Intro card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Welcome to <span className="font-semibold text-[#ff3131]">KD Book Bazaar</span>, India is growing online marketplace for Electronics, Fashion, Home & Living, and more. This Disclaimer outlines the limitations of our liability and the terms under which you may use our website at{' '}
            <a href="https://www.kdbookbazaar.com" className="text-[#ff3131] font-medium hover:underline">
              www.kdbookbazaar.com
            </a>{' '}
            (the Platform). By accessing or using the Platform, you agree to be bound by this Disclaimer.
          </p>
        </div>

        {/* Policy sections */}
        {sections.map((section, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-[#ff3131]/20 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <section.icon className="w-5 h-5 text-[#ff3131]" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-900 mb-3">
                  {section.number}. {section.title}
                </h2>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  {section.content}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-[#ff3131]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Questions About This Disclaimer?</h2>
              <p className="text-sm text-gray-500">We are happy to clarify anything. Reach us through:</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Mail, label: 'Email', value: 'support@kdbookbazaar.com', href: 'mailto:support@kdbookbazaar.com' },
              { icon: Phone, label: 'Phone / WhatsApp', value: '+91 9911636888', href: 'tel:+919911636888' },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#ff3131]/30 hover:bg-red-50/30 transition-all duration-200 group"
              >
                <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-[#ff3131] transition-colors">
                  <item.icon className="w-4 h-4 text-[#ff3131] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Response Time: Within 24 hours &nbsp;·&nbsp; Available: Monday–Saturday, 10 AM–7 PM IST
          </p>
        </div>

        {/* CTA footer */}
        <div className="bg-[#1a1a1a] rounded-2xl p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-[#ff3131] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Protection Through Transparency</h3>
            <p className="text-sm text-blue-200 max-w-xl mx-auto leading-relaxed mb-5">
              At KD Book Bazaar, transparency builds trust. This Disclaimer ensures you understand the terms of using our Platform, so you can shop with complete confidence.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff3131] hover:bg-[#cc0000] text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-orange-500/30"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Now
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">
          © {new Date().getFullYear()} KD Book Bazaar. All rights reserved. &nbsp;·&nbsp;{' '}
          <Link href="/privacy-policy" className="text-[#ff3131] hover:underline">Privacy Policy</Link>
          {' '}&nbsp;·&nbsp;{' '}
          <Link href="/terms-and-conditions" className="text-[#ff3131] hover:underline">Terms & Conditions</Link>
        </p>
      </div>
    </main>
  );
}
