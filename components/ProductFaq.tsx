'use client';

import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Sparkles, HelpCircle, Mail } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface ProductFAQProps {
  productSlug: string;
  productName: string;
}

const SUPPORT_EMAIL = 'hello@thecurioshelf.in';

// ── FAQ DATA — The Curio Shelf (carry goods) ──
const faqData: Record<string, FAQ[]> = {
  'lunch': [
    {
      question: "How long does this lunch bag actually keep food warm?",
      answer: "Our insulated lunch bags hold temperature for 4–6 hours in normal room conditions.\n• Pack food hot and seal the container properly\n• Keep the zip closed until you eat\n• Avoid leaving the bag in direct sunlight\n\nMost customers pack at 8am and still have a warm meal at 1–2pm."
    },
    {
      question: "Is the inner lining food-safe and easy to clean?",
      answer: "Yes. The inner lining is food-grade aluminium foil or PEVA, both safe for direct contact with sealed containers.\n• Wipe the inside with a damp cloth after every use\n• Use mild soap for spills, then air dry fully\n• Do not machine wash or tumble dry — it damages the insulation layer"
    },
    {
      question: "Will my tiffin / containers fit inside?",
      answer: "Every product page lists exact internal dimensions in cm. As a rule of thumb:\n• Standard 2–3 tier steel tiffins fit our regular size\n• 4-tier tiffins or casserole sets need the large size\n\nMeasure your container before ordering — if it doesn't fit, you can return it within 7 days."
    },
    {
      question: "Is it leak-proof if my curry spills?",
      answer: "The lining is water-resistant and will contain small spills, but the bag is not fully leak-proof — no fabric lunch bag is. Always use containers with tight, locking lids. If a spill does happen, wipe the lining immediately so it doesn't stain."
    },
  ],
  'pouch': [
    {
      question: "How much actually fits inside this pouch?",
      answer: "More than it looks — that's the whole point.\n• Small: daily essentials, lip balms, a compact, cards\n• Medium: a full everyday makeup kit or travel toiletries\n• Large: brushes, bottles, a mini hair tool\n\nExact dimensions are listed in the product details above."
    },
    {
      question: "Is the zip sturdy? Mine always break.",
      answer: "We use smooth metal or reinforced nylon zips with double-stitched anchor points — the part that usually gives way first. If a zip fails on you, it's covered by our warranty and replacement policy, not just the 7-day return window."
    },
    {
      question: "Can I wash it if makeup gets inside?",
      answer: "Yes, gently.\n• Wipe the interior with a damp cloth and mild soap\n• For fabric outers, spot clean — don't soak\n• Air dry flat, away from direct sun\n\nSkip the washing machine and dryer; they warp the shape and the lining."
    },
    {
      question: "Is it travel- and cabin-friendly?",
      answer: "Yes. Our pouches are soft-sided and fit inside cabin bags and personal items easily. For liquids in flight, remember airline rules still apply — the pouch itself is fine, the contents need to meet the 100ml rule."
    },
  ],
  'organiser': [
    {
      question: "Will this organiser hold its shape when it's full?",
      answer: "Yes — our organisers use a stiffened board or padded panel base so the sides stay upright even when loaded. If yours arrives creased from transit, leave it open for a day and it settles back into shape."
    },
    {
      question: "Can I use it inside a wardrobe drawer?",
      answer: "That's exactly what it's built for. Standard sizes are designed to fit common Indian wardrobe and dresser drawers. Check the dimensions listed above against your drawer before ordering."
    },
    {
      question: "Is it foldable for storage or travel?",
      answer: "Most of our organisers fold flat when empty, so they store easily and pack into a suitcase. Product details above mention if a particular style is fixed-frame instead."
    },
  ],
  'default': [
    {
      question: "Is this product genuine and quality-checked?",
      answer: "Yes. Every piece on The Curio Shelf is hand-picked before it reaches the shelf.\n• Sourced directly from verified Indian makers and suppliers\n• Quality-checked for stitching, zips and finish before dispatch\n• Backed by our replacement policy if anything arrives faulty\n\nWe don't list dupes or unbranded overstock we haven't inspected ourselves."
    },
    {
      question: "How do I know the size and colour will be right?",
      answer: "Every product page lists exact measurements in cm — please check them against what you plan to carry.\n\nOn colour: we photograph in natural light and edit as little as possible, but screens vary. Slight shade differences can happen. If what arrives is genuinely different from the photos, you're covered for a full return."
    },
    {
      question: "What is The Curio Shelf's return policy?",
      answer: "A hassle-free 7-day return window. To be eligible:\n• The product must be unused and in original condition\n• Original packaging and any tags must be intact\n• The return request must be raised within 7 days of delivery\n\nOnce we receive and inspect the return, refunds are processed within 5–7 business days."
    },
    {
      question: "How long does delivery take?",
      answer: "We ship pan-India:\n• Metro cities (Delhi, Mumbai, Bengaluru, etc.): 2–3 business days\n• Tier 2 cities: 3–5 business days\n• Remote and rural pincodes: 5–7 business days\n\nYou'll get a tracking link by SMS and email once your order is dispatched."
    },
    {
      question: "Is free shipping available?",
      answer: "Yes — free shipping on all orders above ₹499. For orders below ₹499, a flat ₹49 shipping fee applies. We deliver across India through our trusted logistics partners."
    },
    {
      question: "What payment methods do you accept?",
      answer: "All the usual ones:\n• UPI (GPay, PhonePe, Paytm, BHIM)\n• Credit & debit cards (Visa, Mastercard, RuPay)\n• Net banking from all major banks\n• Wallets\n• Cash on Delivery on select pincodes"
    },
    {
      question: "How do I track my order?",
      answer: `Three easy ways:\n1. Use the tracking link in your dispatch SMS and email\n2. Log in to your account → 'My Orders' → select the order\n3. Email ${SUPPORT_EMAIL} and we'll look it up for you\n\nTracking usually goes live within 24 hours of dispatch.`
    },
    {
      question: "Can I cancel my order after placing it?",
      answer: `Yes, any time before it's dispatched:\n• Go to My Orders → select the order → Cancel\n• Or email us at ${SUPPORT_EMAIL}\n\nRefunds are processed within 5–7 business days to your original payment method. COD orders can be cancelled at no charge.`
    },
    {
      question: "Is Cash on Delivery available?",
      answer: "Yes, COD is available on most products and pincodes across India. A small COD handling fee may apply on some orders. Availability is confirmed at checkout once you enter your delivery address."
    },
    {
      question: "Do you take bulk or corporate gifting orders?",
      answer: `We do — and we enjoy them. Special pricing kicks in from 10+ units, and we can look at customisation for corporate gifting.\n\nEmail ${SUPPORT_EMAIL} with quantities and a rough timeline, and we'll send a quote.`
    },
    {
      question: "How do I reach a real person at The Curio Shelf?",
      answer: `Email ${SUPPORT_EMAIL} — a human reads every message.\n\nWe usually reply within a few hours on business days (Mon–Sat, 10am–6pm).`
    },
  ]
};

const defaultFAQs: FAQ[] = faqData['default'];

const ProductFAQ: React.FC<ProductFAQProps> = ({ productSlug, productName }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const getFAQs = (): FAQ[] => {
    const slug = (productSlug || '').toLowerCase();

    // Topic-specific sets, matched against the product slug
    const topicMatchers: [string, RegExp][] = [
      ['lunch',     /lunch|tiffin|casserole|insulat|thermal|bento/],
      ['pouch',     /pouch|cosmetic|makeup|make-up|vanity|toiletr|purse|wallet|clutch/],
      ['organiser', /organi[sz]er|organi[sz]ing|storage|divider|drawer|caddy|holder/],
    ];

    const hit = topicMatchers.find(([, re]) => re.test(slug));
    if (hit) return [...faqData[hit[0]], ...defaultFAQs.slice(2)];

    return defaultFAQs;
  };

  const faqs = getFAQs();
  const toggleFAQ = (index: number) => setOpenIndex(openIndex === index ? null : index);

  return (
    <div className="bg-white rounded-2xl border border-[#FFE9DD] shadow-sm overflow-hidden">

      {/* ── HEADER ── */}
      <div className="px-6 md:px-10 pt-10 pb-8 border-b border-[#FFE9DD]">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-5 h-5" style={{ color: '#E11D74' }} />
          <h2 className="text-xl font-serif font-bold" style={{ color: '#2A0A22' }}>Frequently Asked Questions</h2>
        </div>
        <p className="text-sm mt-1" style={{ color: 'rgba(42,10,34,.5)' }}>
          Common questions about{' '}
          <span className="font-semibold" style={{ color: '#E11D74' }}>{productName}</span>
        </p>
      </div>

      {/* ── FAQ ITEMS ── */}
      <div className="px-6 md:px-10 py-6 space-y-3">
        {faqs.map((faq, index) => {
          const open = openIndex === index;
          return (
            <div
              key={index}
              className="border rounded-xl overflow-hidden transition-all duration-300"
              style={{
                borderColor: open ? 'rgba(225,29,116,.32)' : '#FFE9DD',
                boxShadow: open ? '0 10px 30px -20px rgba(225,29,116,.6)' : 'none',
              }}
            >
              <button
                className="w-full px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D74]/40 bg-white hover:bg-[#FFF6EF] transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
                aria-expanded={open}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Question number badge */}
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5 transition-all duration-300"
                      style={
                        open
                          ? { backgroundImage: 'linear-gradient(135deg,#FF8A3D 0%,#FF4D6D 50%,#E11D74 100%)', color: '#fff' }
                          : { background: '#FFE9DD', color: 'rgba(42,10,34,.5)' }
                      }
                    >
                      {index + 1}
                    </span>
                    <h3
                      className="text-sm font-semibold leading-relaxed flex-1 text-left transition-colors duration-200"
                      style={{ color: open ? '#E11D74' : '#2A0A22' }}
                    >
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDownIcon
                    className={`h-4 w-4 flex-shrink-0 mt-1 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                    style={{ color: open ? '#E11D74' : 'rgba(42,10,34,.35)' }}
                  />
                </div>
              </button>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-400 ease-in-out ${
                  open ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div>
                  <div className="px-5 pb-5 pt-1">
                    <div
                      className="ml-9 pl-4 border-l-2 rounded-r-xl p-4"
                      style={{ borderColor: 'rgba(225,29,116,.3)', background: 'rgba(255,233,221,.4)' }}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(42,10,34,.7)' }}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FOOTER CTA ── */}
      <div className="mx-6 md:mx-10 mb-8 mt-4 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden" style={{ background: '#2A0A22' }}>
        {/* Decorative bg blobs */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(255,106,43,.22)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl pointer-events-none" style={{ background: 'rgba(225,29,116,.2)' }} />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3" style={{ background: 'rgba(255,255,255,.1)' }}>
              <Sparkles className="w-3 h-3" style={{ color: '#FF8A4C' }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#FFE9DD' }}>
                We&apos;re here to help
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-serif font-bold mb-1">Still have questions?</h3>
            <p className="text-sm font-light" style={{ color: 'rgba(255,233,221,.65)' }}>
              A real human replies, Mon–Sat, 10am–6pm
            </p>

            {/* Trust dots */}
            <div className="flex items-center justify-center md:justify-start gap-5 mt-4">
              {['Fast replies', 'Made in India', '7-day returns'].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#E11D74' }} />
                  <span className="text-[11px]" style={{ color: 'rgba(255,233,221,.65)' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap"
              style={{
                backgroundImage: 'linear-gradient(135deg,#FF8A3D 0%,#FF4D6D 50%,#E11D74 100%)',
                boxShadow: '0 18px 40px -16px rgba(225,29,116,.65)',
              }}
            >
              <Mail className="w-4 h-4" />
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFAQ;
