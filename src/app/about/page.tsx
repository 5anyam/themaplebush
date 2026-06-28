"use client"
import React, { useState } from 'react';
import { X, Shield, Package, Headphones, Sparkles, CheckCircle, Award, Star, ShoppingBag, Truck, RotateCcw, Users, TrendingUp, Heart, LucideIcon } from 'lucide-react';
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
        className="inline-flex items-center gap-2 px-8 py-3.5 border-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:bg-[#FFE9DD]"
        style={{ borderColor: 'rgba(42,10,34,0.2)', color: '#2A0A22' }}
      >
        Get in Touch
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-7 max-w-md w-full shadow-2xl border" style={{ borderColor: '#FFE9DD' }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold" style={{ color: '#2A0A22' }}>Contact Us</h3>
                <p className="text-xs mt-0.5" style={{ color: '#2A0A22', opacity: 0.5 }}>We will get back to you within 24 hours</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[#FFE9DD] rounded-xl transition-colors"
              >
                <X className="w-5 h-5" style={{ color: '#2A0A22', opacity: 0.5 }} />
              </button>
            </div>

            {isSubmitted ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-bold" style={{ color: '#2A0A22' }}>Message Sent!</p>
                <p className="text-xs mt-1" style={{ color: '#2A0A22', opacity: 0.5 }}>We will respond shortly.</p>
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
                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#E11D74] focus:ring-2 focus:ring-[#E11D74]/10 text-sm transition-all"
                    style={{ borderColor: '#FFE9DD', background: '#FFF6EF', color: '#2A0A22' }}
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
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#E11D74] focus:ring-2 focus:ring-[#E11D74]/10 text-sm resize-none transition-all"
                  style={{ borderColor: '#FFE9DD', background: '#FFF6EF', color: '#2A0A22' }}
                />
                <button
                  type="submit"
                  className="w-full text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
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
    <div className="bg-white rounded-2xl p-6 border shadow-sm text-center hover:shadow-md transition-all duration-300" style={{ borderColor: '#FFE9DD' }}>
      <div className="w-12 h-12 bg-[#FFE9DD] rounded-xl flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6" style={{ color: '#E11D74' }} />
      </div>
      <p className="text-3xl font-bold mb-1 font-serif" style={{ color: '#2A0A22' }}>{value}</p>
      <p className="text-xs font-medium" style={{ color: '#2A0A22', opacity: 0.5 }}>{label}</p>
    </div>
  );
}

// ── TYPES ──
interface CategoryItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  textColor: string;
}

interface WhyItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

// ── MAIN PAGE ──
export default function AboutPage() {

  const categories: CategoryItem[] = [
    { icon: ShoppingBag, title: 'Everyday Bags', desc: 'Totes, crossbodies, backpacks and shoulder bags crafted for daily use — built to last and styled to impress.', color: 'bg-[#FFE9DD]', textColor: 'text-[#E11D74]' },
    { icon: Package, title: 'Pouches & Cases', desc: 'Cosmetic pouches, document holders, passport covers, and zip pouches — everything finds a perfect home.', color: 'bg-[#FFE9DD]', textColor: 'text-[#FF6A2B]' },
    { icon: Sparkles, title: 'Desk Organisers', desc: 'Pen stands, cable organisers, desk mats, and stationery holders to bring calm order to your workspace.', color: 'bg-[#FFE9DD]', textColor: 'text-[#E11D74]' },
    { icon: Star, title: 'Travel Essentials', desc: 'Packing cubes, toiletry bags, luggage tags, and travel wallets — your journey, neatly organised.', color: 'bg-[#FFE9DD]', textColor: 'text-[#FF6A2B]' },
    { icon: Award, title: 'Gift Sets', desc: 'Curated carry kits and gifting combos wrapped beautifully — perfect for birthdays, festivals, and milestones.', color: 'bg-[#FFE9DD]', textColor: 'text-[#E11D74]' },
    { icon: Heart, title: 'Custom & Bespoke', desc: 'Personalised pouches, monogrammed bags, and corporate gifting orders — made exactly as you imagine.', color: 'bg-[#FFE9DD]', textColor: 'text-[#FF6A2B]' },
  ];

  const whyItems: WhyItem[] = [
    { icon: Shield, title: 'Made in India, With Care', desc: 'Every piece is handcrafted by skilled artisans across India using ethically sourced fabrics and hardware.' },
    { icon: Truck, title: 'Pan-India Delivery', desc: 'Metro cities in 3–5 days. All other pincodes in 5–7 days. Real-time tracking on every order.' },
    { icon: RotateCcw, title: 'Easy Exchanges', desc: '7-day exchange policy. If something is not right, we will make it right — no lengthy processes.' },
    { icon: TrendingUp, title: 'Honest Pricing', desc: 'No markups for aesthetics. Great materials, thoughtful design, and fair prices — always.' },
    { icon: Headphones, title: 'Personal Customer Care', desc: 'Reach us at hello@thecurioshelf.in any time. We reply within 24 hours, Mon–Sat.' },
  ];

  const commitments: string[] = [
    'Ethically sourced fabrics & materials',
    'Handcrafted by Indian artisans',
    'Secure payments — UPI, Cards, COD',
    'Transparent pricing, no hidden charges',
    'Real customer reviews on every product',
    'Easy exchanges within 7 days',
    'Quick refunds within 5–7 business days',
  ];

  return (
    <main style={{ background: '#FFF6EF', color: '#2A0A22' }}>
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">

        {/* ── HERO ── */}
        <section className="rounded-3xl px-8 md:px-16 py-16 text-white text-center relative overflow-hidden" style={{ background: '#2A0A22' }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(225,29,116,0.12)' }} />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full blur-2xl pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-5" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}>
              <Heart className="w-3.5 h-3.5" style={{ color: '#E11D74' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFE9DD' }}>Our Story</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold font-serif mb-5 tracking-tight">
              About{' '}
              <span style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                The Curio Shelf
              </span>
            </h1>
            <p className="text-sm lg:text-base max-w-3xl mx-auto leading-relaxed" style={{ color: '#FFE9DD', opacity: 0.85 }}>
              India's home for beautifully made carry goods — bags, pouches, organisers and more, thoughtfully designed and handcrafted in India for the modern everyday.
            </p>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="5K+" label="Happy Customers" icon={Users} />
          <StatCard value="200+" label="Products" icon={ShoppingBag} />
          <StatCard value="100%" label="Made in India" icon={Award} />
          <StatCard value="Pan India" label="Delivery Coverage" icon={Truck} />
        </section>

        {/* ── WHO WE ARE ── */}
        <section className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#FFE9DD' }}>
          <div className="grid md:grid-cols-2 gap-0">
            <div className="flex items-center justify-center p-12 min-h-[300px]" style={{ background: 'linear-gradient(135deg, #FFE9DD 0%, #FFF6EF 100%)' }}>
              <div className="text-center">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)', boxShadow: '0 12px 32px rgba(225,29,116,0.3)' }}
                >
                  <ShoppingBag className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold font-serif" style={{ color: '#2A0A22' }}>Who We Are</h3>
                <p className="text-xs mt-1" style={{ color: '#2A0A22', opacity: 0.5 }}>Designed in India, made with love</p>
              </div>
            </div>
            <div className="p-10 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 w-fit" style={{ background: '#FFE9DD' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#E11D74' }}>Our Foundation</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold font-serif mb-4" style={{ color: '#2A0A22' }}>
                Built for the Organised Soul
              </h2>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: '#2A0A22', opacity: 0.7 }}>
                The Curio Shelf was born from a love of beautiful things that actually work. We design carry goods — bags, pouches, organisers — that bring a sense of order and delight to everyday life. Every product is thoughtfully made by skilled artisans across India, using quality fabrics and honest craftsmanship.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#2A0A22', opacity: 0.7 }}>
                We are proudly made in India and built for India — and for every corner of the world that appreciates functional beauty. When you carry a Curio Shelf piece, you carry something made with intention.
              </p>
            </div>
          </div>
        </section>

        {/* ── WHAT WE OFFER ── */}
        <section>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4" style={{ background: 'rgba(225,29,116,0.08)', border: '1px solid rgba(225,29,116,0.2)' }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#E11D74' }}>Our Collections</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold font-serif mb-2" style={{ color: '#2A0A22' }}>What We Make</h2>
            <p className="text-sm max-w-xl mx-auto" style={{ color: '#2A0A22', opacity: 0.55 }}>
              A carefully curated range of carry goods for every part of your day.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 group"
                style={{ borderColor: '#FFE9DD' }}
              >
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  <item.icon className={`w-6 h-6 ${item.textColor}`} />
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#2A0A22' }}>{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#2A0A22', opacity: 0.55 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY CHOOSE US ── */}
        <section className="bg-white rounded-2xl border shadow-sm p-8 md:p-12" style={{ borderColor: '#FFE9DD' }}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4" style={{ background: '#FFE9DD' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#E11D74' }}>Our Advantage</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold font-serif mb-7" style={{ color: '#2A0A22' }}>Why Choose The Curio Shelf?</h2>
              <div className="space-y-5">
                {whyItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-10 h-10 bg-[#FFE9DD] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:opacity-80 transition-opacity duration-300">
                      <item.icon className="w-5 h-5" style={{ color: '#E11D74' }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold mb-1" style={{ color: '#2A0A22' }}>{item.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: '#2A0A22', opacity: 0.55 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commitments card */}
            <div className="rounded-2xl p-8 text-white relative overflow-hidden" style={{ background: '#2A0A22' }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-2xl pointer-events-none" style={{ background: 'rgba(225,29,116,0.15)' }} />
              <div className="relative z-10 space-y-4">
                <h3 className="text-lg font-bold font-serif mb-5">Our Commitments</h3>
                {commitments.map((point, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#E11D74' }} />
                    <p className="text-xs" style={{ color: '#FFE9DD', opacity: 0.85 }}>{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── COMMUNITY ── */}
        <section className="bg-white rounded-2xl border shadow-sm p-8 md:p-12 text-center" style={{ borderColor: '#FFE9DD' }}>
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-[#FFE9DD] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Users className="w-8 h-8" style={{ color: '#E11D74' }} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold font-serif mb-4" style={{ color: '#2A0A22' }}>Join Our Community</h2>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: '#2A0A22', opacity: 0.6 }}>
              The Curio Shelf is more than a store — it is a community of people who love beautiful, functional things. Follow us on Instagram for behind-the-scenes craft stories, new arrivals, and styling ideas. Your feedback shapes what we make next.
            </p>
            <p className="text-sm font-semibold italic font-script" style={{ color: '#2A0A22' }}>
              &quot;Carry things beautifully. Live more curiously.&quot;
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-2xl p-10 md:p-14 text-white text-center relative overflow-hidden" style={{ background: '#2A0A22' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(225,29,116,0.15)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-3 tracking-tight">
              Ready to Carry Something Beautiful?
            </h2>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: '#FFE9DD', opacity: 0.8 }}>
              Explore our full collection of bags, pouches and organisers. Made in India, shipped across the country, loved everywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
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
