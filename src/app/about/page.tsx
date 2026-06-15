"use client"
import React, { useState } from 'react';
import { X, Shield, Smartphone, Headphones, Zap, CheckCircle, Award, Star, ShoppingBag, Truck, RotateCcw, Users, TrendingUp, Heart, LucideIcon } from 'lucide-react';
import Link from 'next/link';

// ── CONTACT MODAL ──
function ContactModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 2000);
  };

  const fields: { type: string; key: keyof typeof formData; placeholder: string }[] = [
    { type: 'text', key: 'name', placeholder: 'Your full name' },
    { type: 'email', key: 'email', placeholder: 'your@email.com' },
    { type: 'tel', key: 'phone', placeholder: '+91 XXXXX XXXXX' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300"
      >
        Get in Touch
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-7 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Contact Us</h3>
                <p className="text-xs text-gray-500 mt-0.5">We will get back to you within 24 hours</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {isSubmitted ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-bold text-gray-900">Message Sent!</p>
                <p className="text-xs text-gray-500 mt-1">We will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map((field) => (
                  <input
                    key={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 text-sm bg-gray-50 transition-all"
                  />
                ))}
                <textarea
                  placeholder="How can we help you?"
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, message: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 text-sm bg-gray-50 resize-none transition-all"
                />
                <button
                  type="submit"
                  className="w-full bg-[#ff3131] hover:bg-[#cc0000] text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:shadow-orange-200"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── STAT CARD ──
interface StatCardProps {
  value: string;
  label: string;
  icon: LucideIcon;
}

function StatCard({ value, label, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center hover:border-[#ff3131]/20 hover:shadow-md transition-all duration-300">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-[#ff3131]" />
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  );
}

// ── TYPES ──
interface CategoryItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}

interface WhyItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

// ── MAIN PAGE ──
export default function AboutPage() {

  const categories: CategoryItem[] = [
    { icon: Smartphone, title: 'Electronics', desc: 'Mobiles, laptops, audio, smart watches, cameras, and accessories from top brands.', color: 'bg-blue-50 text-blue-600' },
    { icon: ShoppingBag, title: 'Fashion', desc: "Men's, women's clothing, footwear, bags, watches and jewellery.", color: 'bg-pink-50 text-pink-600' },
    { icon: Zap, title: 'Home & Living', desc: 'Kitchen essentials, furniture, decor, bedding, and smart appliances.', color: 'bg-yellow-50 text-yellow-600' },
    { icon: Star, title: 'Beauty & Personal Care', desc: 'Skincare, haircare, grooming, and wellness products.', color: 'bg-purple-50 text-purple-600' },
    { icon: Award, title: 'Sports & Fitness', desc: 'Gym equipment, sportswear, outdoor gear, and nutrition.', color: 'bg-green-50 text-green-600' },
    { icon: Headphones, title: 'Audio & Accessories', desc: 'Headphones, earbuds, cables, chargers, and mobile accessories.', color: 'bg-red-50 text-[#ff3131]' },
  ];

  const whyItems: WhyItem[] = [
    { icon: Shield, title: '100% Genuine Products', desc: 'All products are sourced from verified sellers and authorized distributors. No fakes, no compromises.' },
    { icon: Truck, title: 'Fast Pan-India Delivery', desc: 'Metro cities in 2–3 days. Tier 2 in 3–5 days. Remote areas in 5–7 days. Real-time tracking included.' },
    { icon: RotateCcw, title: 'Hassle-Free Returns', desc: '7-day easy return policy. Not satisfied? We will make it right — no questions asked.' },
    { icon: TrendingUp, title: 'Best Prices & Deals', desc: 'Daily deals, seasonal sales, and competitive pricing so you always get the most value.' },
    { icon: Headphones, title: 'Dedicated Customer Support', desc: 'Available Mon–Sat, 10 AM–7 PM via call, WhatsApp, and email. We actually care.' },
  ];

  const commitments: string[] = [
    'Only genuine, quality-tested products',
    'Secure payments — UPI, Cards, COD, EMI',
    'Transparent pricing, no hidden charges',
    'Real customer reviews on every product',
    'Easy cancellations before dispatch',
    'Quick refunds within 5–7 business days',
    'Dedicated support for every query',
  ];

  return (
    <main className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">

        {/* ── HERO ── */}
        <section className="bg-[#1a1a1a] rounded-3xl px-8 md:px-16 py-16 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <Heart className="w-3.5 h-3.5 text-[#ff3131]" />
              <span className="text-xs font-semibold text-orange-200 uppercase tracking-wider">Our Story</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-5 tracking-tight">
              About <span className="text-[#ff3131]">KD Book Bazaar</span>
            </h1>
            <p className="text-sm lg:text-base text-blue-200 max-w-3xl mx-auto leading-relaxed">
              India is growing online marketplace for Electronics, Fashion, Home & Living, Beauty, and much more — delivering quality products at honest prices, right to your doorstep.
            </p>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="10K+" label="Happy Customers" icon={Users} />
          <StatCard value="5K+" label="Products Listed" icon={ShoppingBag} />
          <StatCard value="500+" label="Brands & Sellers" icon={Award} />
          <StatCard value="Pan India" label="Delivery Coverage" icon={Truck} />
        </section>

        {/* ── WHO WE ARE ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="bg-gradient-to-br from-orange-50 to-[#FFF8F3] flex items-center justify-center p-12 min-h-[300px]">
              <div className="text-center">
                <div className="w-24 h-24 bg-[#ff3131] rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-orange-200">
                  <ShoppingBag className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Who We Are</h3>
                <p className="text-xs text-gray-500 mt-1">Founded in India, built for India</p>
              </div>
            </div>
            <div className="p-10 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-red-50 rounded-full px-3 py-1 mb-4 w-fit">
                <span className="text-[10px] font-bold text-[#ff3131] uppercase tracking-wider">Our Foundation</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-900">
                Built for Every Indian Shopper
              </h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                KD Book Bazaar was founded with one simple mission: make online shopping in India easier, more reliable, and more enjoyable. We believe every customer deserves access to genuine products, fast delivery, and honest service — without compromise.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                From premium electronics to everyday essentials, we curate our catalog so you spend less time searching and more time enjoying. Every seller on our platform is verified, and every product is quality-checked before it reaches you.
              </p>
            </div>
          </div>
        </section>

        {/* ── WHAT WE OFFER ── */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#ff3131]/10 border border-[#ff3131]/20 rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-semibold text-[#ff3131] uppercase tracking-wider">Our Categories</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">What We Offer</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              A carefully curated selection across every category you need.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-[#ff3131]/20 hover:shadow-md transition-all duration-300 group"
              >
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY CHOOSE US ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-50 rounded-full px-3 py-1 mb-4">
                <span className="text-[10px] font-bold text-[#ff3131] uppercase tracking-wider">Our Advantage</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-7 text-gray-900">Why Shop on KD Book Bazaar?</h2>
              <div className="space-y-5">
                {whyItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff3131] transition-colors duration-300">
                      <item.icon className="w-5 h-5 text-[#ff3131] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commitments card */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#243560] rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff3131]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <h3 className="text-lg font-bold mb-5">Our Commitments</h3>
                {commitments.map((point, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-[#ff3131] flex-shrink-0" />
                    <p className="text-xs text-blue-100">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── COMMUNITY ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Users className="w-8 h-8 text-[#ff3131]" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-900">Join Our Community</h2>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              KD Book Bazaar is more than a marketplace — it is a community of smart shoppers. Follow us on social media for exclusive deals, new arrivals, and shopping tips. Your feedback shapes what we stock next!
            </p>
            <p className="text-sm text-gray-700 font-semibold italic">
              &quot;Shop smart. Shop genuine. Shop KD Book Bazaar.&quot;
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[#1a1a1a] rounded-2xl p-10 md:p-14 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">
              Ready to Start Shopping?
            </h2>
            <p className="text-sm text-blue-200 mb-8 leading-relaxed">
              Explore thousands of genuine products across every category. Fast delivery, easy returns, and the best prices — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#ff3131] hover:bg-[#cc0000] text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-orange-500/30"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop Now
              </Link>
              <ContactModal />
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
