'use client';

import {
  Shield, RefreshCw, CheckCircle, Clock,
  Package, AlertCircle, Mail, ChevronRight, Award, LucideIcon
} from 'lucide-react';
import Link from 'next/link';

interface WarrantySection {
  icon: LucideIcon;
  title: string;
  content: React.ReactNode;
}

interface PolicyLink {
  title: string;
  description: string;
  link: string;
  icon: LucideIcon;
}

const replacementSteps = [
  { step: '01', title: 'Contact Support', desc: 'Reach out via email at support@kdbookbazaar.com with your order number and details of the issue.' },
  { step: '02', title: 'Provide Evidence', desc: 'Send clear photos or a short video showing the defect or issue with your product.' },
  { step: '03', title: 'Approval Review', desc: 'Our quality team will review your claim within 24–48 business hours.' },
  { step: '04', title: 'Receive Replacement', desc: 'Once approved, we ship your replacement immediately at no additional cost.' },
];

const warrantySections: WarrantySection[] = [
  {
    icon: Award,
    title: 'Warranty Coverage',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-gray-600 leading-relaxed">
          All KD Book Bazaar products come with a warranty covering manufacturing defects and material failures under normal use conditions.
        </p>
        <ul className="space-y-2">
          {[
            '30-day warranty on all products sold on KD Book Bazaar',
            'Coverage for manufacturing defects, material flaws, and workmanship issues',
            'Free replacement for defective products within warranty period',
            'Extended warranty available on select premium products',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 bg-[#ff3131] rounded-full flex-shrink-0 mt-2" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    icon: CheckCircle,
    title: 'What is Covered',
    content: (
      <ul className="space-y-2">
        {[
          'Manufacturing defects in materials or workmanship',
          'Premature wear or degradation under normal use',
          'Defective buttons, ports, or cutouts affecting functionality',
          'Discoloration or yellowing within warranty period (for clear cases)',
          'Adhesive failure or detachment of product components',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-2" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: AlertCircle,
    title: 'What is Not Covered',
    content: (
      <ul className="space-y-2">
        {[
          'Damage from accidents, drops, impacts, or misuse',
          'Normal wear and tear from extended daily use',
          'Damage from improper cleaning or use of harsh chemicals',
          'Modifications or alterations to the original product',
          'Cosmetic issues like scratches or scuffs from normal use',
          'Products purchased from unauthorized retailers',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0 mt-2" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: RefreshCw,
    title: 'Replacement Process',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-gray-600 leading-relaxed">
          Our hassle-free replacement process is designed to get you back to full protection quickly:
        </p>
        <ol className="space-y-3">
          {replacementSteps.map((item, i) => (
            <li key={i} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-9 h-9 bg-[#ff3131] rounded-xl flex items-center justify-center text-xs font-bold text-white">
                {item.step}
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-0.5">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    icon: Clock,
    title: 'Processing Timeline',
    content: (
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: 'Claim Review', value: '24–48 Hours' },
          { label: 'Replacement Dispatch', value: '1–2 Business Days' },
          { label: 'Delivery', value: '3–7 Business Days' },
        ].map((row, i) => (
          <div key={i} className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{row.label}</p>
            <p className="text-sm font-bold text-[#ff3131]">{row.value}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Package,
    title: 'Important Notes',
    content: (
      <ul className="space-y-2">
        {[
          'Keep your original purchase receipt or order confirmation for warranty claims',
          'Defective products may need to be returned before replacement is dispatched',
          'Warranty is non-transferable and applies only to the original purchaser',
          'Final decision on warranty claims rests with the KD Book Bazaar quality team',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="w-1.5 h-1.5 bg-[#ff3131] rounded-full flex-shrink-0 mt-2" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
];

const relatedPolicies: PolicyLink[] = [
  {
    title: 'Return & Refund Policy',
    description: 'Learn about our hassle-free return process and refund guidelines.',
    link: '/returns-and-refunds-policy',
    icon: RefreshCw,
  },
  {
    title: 'Shipping Policy',
    description: 'Understand our delivery timelines and shipping procedures.',
    link: '/shipping-policy',
    icon: Package,
  },
  {
    title: 'Cancellation Policy',
    description: 'Learn when and how you can cancel an order on KD Book Bazaar.',
    link: '/cancellation-policy',
    icon: Shield,
  },
  {
    title: 'Terms & Conditions',
    description: 'Read the full legal terms governing your use of KD Book Bazaar.',
    link: '/terms-and-conditions',
    icon: CheckCircle,
  },
];

export default function WarrantyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── HERO ── */}
      <section className="bg-[#1a1a1a] py-14 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <Shield className="w-3.5 h-3.5 text-[#ff3131]" />
            <span className="text-xs font-semibold text-orange-200 uppercase tracking-wider">Protection Guarantee</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Warranty & Replacement Policy
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed max-w-2xl">
            We stand behind the quality of every product with comprehensive warranty coverage and hassle-free replacement service.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            At <span className="font-semibold text-[#ff3131]">KD Book Bazaar</span>, we believe in the quality and durability of every product on our platform. Our warranty and replacement policy ensures you receive the protection and support you deserve, backed by our commitment to customer satisfaction.
          </p>
        </div>

        {/* Warranty Sections */}
        {warrantySections.map((section, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-[#ff3131]/20 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <section.icon className="w-5 h-5 text-[#ff3131]" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  {section.title}
                </h2>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  {section.content}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Contact Support */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-900 mb-1">Need Warranty Support?</h3>
          <p className="text-sm text-gray-500 mb-5">
            Our team is available Mon–Sat, 10 AM–7 PM IST to help with your warranty claim.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:support@kdbookbazaar.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ff3131] hover:bg-[#cc0000] text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Closing quote */}
        <div className="bg-[#1a1a1a] rounded-2xl p-7 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
          <p className="relative z-10 text-sm text-blue-200 leading-relaxed italic max-w-2xl mx-auto">
            At <span className="text-[#ff3131] font-semibold not-italic">KD Book Bazaar</span>, we are committed to providing not just products, but peace of mind. Our warranty policy reflects our confidence in the quality we deliver and our dedication to your satisfaction.
          </p>
        </div>

        {/* Related Policies */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-1">Related Policies</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {relatedPolicies.map((policy, index) => (
              <Link
                key={index}
                href={policy.link}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-[#ff3131]/20 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff3131] transition-colors duration-300">
                    <policy.icon className="w-5 h-5 text-[#ff3131] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-[#ff3131] transition-colors">
                      {policy.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-2">{policy.description}</p>
                    <div className="flex items-center gap-1 text-[#ff3131] text-xs font-semibold">
                      Read More
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">
          © {new Date().getFullYear()} KD Book Bazaar. All rights reserved. &nbsp;·&nbsp;{' '}
          <Link href="/terms-and-conditions" className="text-[#ff3131] hover:underline">Terms & Conditions</Link>
          {' '}&nbsp;·&nbsp;{' '}
          <Link href="/privacy-policy" className="text-[#ff3131] hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </main>
  );
}
