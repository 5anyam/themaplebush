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

// ── FAQ DATA — General Ecommerce (KD Book Bazaar) ──
const faqData: Record<string, FAQ[]> = {
  'electronics': [
    {
      question: "Are all electronics on KD Book Bazaar genuine and authentic?",
      answer: "Yes, 100%! All electronics on KD Book Bazaar are sourced directly from authorized distributors and brand partners. Every product:\n• Comes with official brand warranty\n• Is quality-checked before dispatch\n• Includes all original accessories in-box\n• Can be verified via brand's official warranty registration"
    },
    {
      question: "What warranty do electronics come with?",
      answer: "Electronics on KD Book Bazaar come with the manufacturer's official warranty:\n• Smartphones & Laptops: 1 year brand warranty\n• Accessories: 6 months to 1 year\n• Smart devices: 1 year brand warranty\n\nIn addition, KD Book Bazaar offers a 7-day replacement guarantee for any manufacturing defects found on delivery."
    },
    {
      question: "Can I return electronics if I change my mind?",
      answer: "Yes! We offer a 7-day easy return policy for electronics. The product must be:\n• Unused and in original condition\n• In original packaging with all accessories\n• Returned with original invoice\n\nNote: Products with physical damage, missing accessories, or tampered seals are not eligible for return."
    },
    {
      question: "Do you offer EMI options for expensive electronics?",
      answer: "Yes! We offer easy EMI options through:\n• All major credit cards (0% EMI on select products)\n• Buy Now Pay Later (BNPL) via Simpl, LazyPay\n• Bank EMI offers on Bajaj Finserv & HDFC\n\nEMI options are shown at checkout based on your payment method."
    },
    {
      question: "How is the product packaged to avoid damage during shipping?",
      answer: "All electronics are shipped with extra care:\n• Double-layered bubble wrap padding\n• Rigid outer box for protection\n• Fragile sticker on the package\n• Real-time tracking provided\n\nFor high-value items, we use tamper-proof security seals."
    },
  ],
  'fashion': [
    {
      question: "How do I choose the right size?",
      answer: "Each product page has a detailed size chart with measurements in inches and centimeters. We recommend:\n• Measuring your chest, waist, and hips\n• Comparing with our size chart before ordering\n• When in doubt, go one size up\n\nIf you receive the wrong size, we offer free size exchanges within 7 days."
    },
    {
      question: "Are the colors accurate in product photos?",
      answer: "We strive for accurate color representation. However, slight variations may occur due to:\n• Different screen calibrations\n• Lighting during photography\n\nIf the color is significantly different from what was shown, you are eligible for a full return or exchange."
    },
    {
      question: "Can I return clothing if it doesn't fit?",
      answer: "Absolutely! We offer 7-day returns for fashion items. Conditions:\n• Item must be unworn and unwashed\n• Tags must be intact\n• Original packaging required\n\nFree size exchanges are available on most clothing items."
    },
    {
      question: "Do you sell branded fashion items?",
      answer: "Yes! KD Book Bazaar carries both popular brands and quality private-label fashion. All branded items are 100% authentic sourced directly from brand partners or authorized distributors."
    },
  ],
  'default': [
    {
      question: "Are products on KD Book Bazaar 100% authentic?",
      answer: "Yes, absolutely! KD Book Bazaar only works with verified sellers and authorized distributors. Every product is:\n• Sourced from genuine suppliers\n• Quality-checked before dispatch\n• Backed by official brand or seller warranty\n• Eligible for return if found inauthentic"
    },
    {
      question: "What is KD Book Bazaar's return policy?",
      answer: "We offer a hassle-free 7-day return policy. To be eligible:\n• Product must be unused and in original condition\n• All original packaging and accessories must be present\n• Return request must be raised within 7 days of delivery\n\nOnce your return is received and inspected, refunds are processed within 5-7 business days."
    },
    {
      question: "How long does delivery take?",
      answer: "We deliver across India with the following timelines:\n• Metro cities (Delhi, Mumbai, Bangalore, etc.): 2-3 business days\n• Tier 2 cities: 3-5 business days\n• Remote or rural areas: 5-7 business days\n\nYou'll receive a tracking link via SMS and email once your order is dispatched."
    },
    {
      question: "Is free shipping available?",
      answer: "Yes! KD Book Bazaar offers free shipping on all orders above ₹499. For orders below ₹499, a flat shipping fee of ₹49 is applicable. We deliver Pan India through our trusted logistics partners."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major payment methods:\n• UPI (GPay, PhonePe, Paytm, BHIM)\n• Credit & Debit Cards (Visa, Mastercard, RuPay)\n• Net Banking (all major banks)\n• Wallets (Paytm, Amazon Pay)\n• Cash on Delivery (select pincodes)\n• EMI on credit cards\n• Buy Now Pay Later (Simpl, LazyPay)"
    },
    {
      question: "How do I track my order?",
      answer: "Tracking your order is easy:\n1. You'll receive an SMS and email with a tracking link once shipped\n2. Log in to your KD Book Bazaar account → 'My Orders'\n3. Click on the order to see real-time tracking\n4. Email support@kdbookbazaar.com for help\n\nTracking is available within 24 hours of dispatch."
    },
    {
      question: "Can I cancel my order after placing it?",
      answer: "Yes, you can cancel your order before it is dispatched. To cancel:\n• Go to My Orders → Select the order → Click 'Cancel'\n• Or email us at support@kdbookbazaar.com\n\nOnce cancelled, the refund is processed within 5-7 business days to your original payment method. COD orders are cancelled without any charge."
    },
    {
      question: "Is Cash on Delivery (COD) available?",
      answer: "Yes! COD is available on most products and pincodes across India. A small COD handling fee may apply on some orders. COD availability is shown at checkout based on your delivery address."
    },
    {
      question: "How do I contact KD Book Bazaar customer support?",
      answer: "We're here to help! Reach us through:\n• 📧 Email: support@kdbookbazaar.com\n\nWe typically respond within a few hours on business days (Mon–Sat, 10am–6pm)."
    },
    {
      question: "Do you offer bulk orders or corporate gifting?",
      answer: "Yes! We offer special pricing for bulk orders (10+ units) and customization options for corporate gifting. Contact us at support@kdbookbazaar.com with your requirements for a personalized quote."
    },
  ]
};

const defaultFAQs: FAQ[] = faqData['default'];

const ProductFAQ: React.FC<ProductFAQProps> = ({ productSlug, productName }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const getFAQs = (): FAQ[] => {
    if (faqData[productSlug]) return faqData[productSlug];
    const slugKey = Object.keys(faqData).find(
      (key) => productSlug.includes(key) || key.includes(productSlug.split('-')[0])
    );
    return slugKey ? faqData[slugKey] : defaultFAQs;
  };

  const faqs = getFAQs();
  const toggleFAQ = (index: number) => setOpenIndex(openIndex === index ? null : index);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── HEADER ── */}
      <div className="px-6 md:px-10 pt-10 pb-8 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-5 h-5 text-[#ff3131]" />
          <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Common questions about{' '}
          <span className="text-[#ff3131] font-medium">{productName}</span>
        </p>
      </div>

      {/* ── FAQ ITEMS ── */}
      <div className="px-6 md:px-10 py-6 space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`border rounded-xl overflow-hidden transition-all duration-300 ${
              openIndex === index
                ? 'border-[#ff3131]/30 shadow-sm shadow-orange-50'
                : 'border-gray-100 hover:border-[#ff3131]/20'
            }`}
          >
            <button
              className="w-full px-5 py-4 text-left focus:outline-none bg-white hover:bg-orange-50/30 transition-colors duration-200"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {/* Question number badge */}
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5 transition-all duration-300 ${
                    openIndex === index
                      ? 'bg-[#ff3131] text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <h3 className={`text-sm font-semibold leading-relaxed flex-1 text-left transition-colors duration-200 ${
                    openIndex === index ? 'text-[#ff3131]' : 'text-gray-800'
                  }`}>
                    {faq.question}
                  </h3>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 flex-shrink-0 mt-1 transition-all duration-300 ${
                    openIndex === index ? 'rotate-180 text-[#ff3131]' : 'text-gray-400'
                  }`}
                />
              </div>
            </button>

            {/* Answer */}
            <div className={`overflow-hidden transition-all duration-400 ease-in-out ${
              openIndex === index ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="px-5 pb-5 pt-1">
                <div className="ml-9 pl-4 border-l-2 border-[#ff3131]/30 bg-orange-50/30 rounded-r-xl p-4">
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── FOOTER CTA ── */}
      <div className="mx-6 md:mx-10 mb-8 mt-4 bg-gradient-to-br from-[#1a1a1a] to-[#243560] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        {/* Decorative bg blob */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-3">
              <Sparkles className="w-3 h-3 text-[#ff3131]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-200">
                We are here to help
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-1">Still Have Questions?</h3>
            <p className="text-sm text-blue-200 font-light">
              Our support team is available Mon–Sat, 10am–6pm
            </p>

            {/* Trust dots */}
            <div className="flex items-center justify-center md:justify-start gap-5 mt-4">
              {['Fast Response', '24hr Support', 'Expert Help'].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff3131]" />
                  <span className="text-[11px] text-blue-200">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a
              href="mailto:support@kdbookbazaar.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ff3131] hover:bg-[#cc0000] text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-orange-500/30 whitespace-nowrap"
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
