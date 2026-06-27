"use client"
import React, { useState } from 'react';
import { Mail, MapPin, Clock, Send, CheckCircle, Headphones, MessageSquare, Zap, Shield } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <main className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">

        {/* ── HERO ── */}
        <section className="text-center py-10">
          <div className="inline-flex items-center gap-2 bg-[#ff3131]/10 border border-[#ff3131]/20 rounded-full px-4 py-1.5 mb-5">
            <MessageSquare className="w-3.5 h-3.5 text-[#ff3131]" />
            <span className="text-xs font-semibold text-[#ff3131] uppercase tracking-wider">Get in Touch</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
            We are Here to Help
          </h1>
          <p className="text-sm lg:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Have questions about your order, products, or anything else? Our support team is ready to assist you — fast and friendly.
          </p>
        </section>

        {/* ── CONTACT CARDS ── */}
        <section className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Mail className="w-6 h-6" />,
              label: 'Email Us',
              desc: 'We respond within 24 hours on business days',
              cta: <a href="mailto:support@kdbookbazaar.com" className="text-xs font-semibold text-[#ff3131] hover:underline">support@kdbookbazaar.com</a>,
              color: 'bg-red-50 text-[#ff3131]',
            },
            {
              icon: <MapPin className="w-6 h-6" />,
              label: 'Our Location',
              desc: 'Based in the heart of Delhi',
              cta: (
                <address className="text-xs text-gray-600 not-italic leading-relaxed">
                  New Delhi – 110001
                </address>
              ),
              color: 'bg-red-50 text-[#ff3131]',
            },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#ff3131]/20 transition-all duration-300 group">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                {card.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">{card.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{card.desc}</p>
              {card.cta}
            </div>
          ))}
        </section>

        {/* ── FORM + INFO ── */}
        <section className="grid lg:grid-cols-2 gap-10">

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Send Us a Message</h2>
            <p className="text-xs text-gray-500 mb-7">Fill out the form and we will get back to you shortly.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Full Name <span className="text-[#ff3131]">*</span>
                  </label>
                  <input
                    type="text" name="name" value={formData.name}
                    onChange={handleInputChange} required
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 transition-all text-sm text-gray-900 bg-gray-50"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Email <span className="text-[#ff3131]">*</span>
                  </label>
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleInputChange} required
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 transition-all text-sm text-gray-900 bg-gray-50"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Phone <span className="text-[#ff3131]">*</span>
                  </label>
                  <input
                    type="tel" name="phone" value={formData.phone}
                    onChange={handleInputChange} required
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 transition-all text-sm text-gray-900 bg-gray-50"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Subject <span className="text-[#ff3131]">*</span>
                  </label>
                  <select
                    name="subject" value={formData.subject}
                    onChange={handleInputChange} required
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 transition-all text-sm text-gray-900 bg-gray-50"
                  >
                    <option value="">Select a subject</option>
                    <option value="order">Order Support</option>
                    <option value="return">Return / Refund</option>
                    <option value="product">Product Inquiry</option>
                    <option value="payment">Payment Issue</option>
                    <option value="bulk">Bulk / Corporate Order</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Message <span className="text-[#ff3131]">*</span>
                </label>
                <textarea
                  name="message" value={formData.message}
                  onChange={handleInputChange} required rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 transition-all text-sm text-gray-900 resize-none bg-gray-50"
                  placeholder="Tell us how we can help you..."
                />
                <p className="text-[11px] text-gray-400 mt-1">{formData.message.length} characters</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitted}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                  isSubmitted
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-[#ff3131] hover:bg-[#cc0000] text-white shadow-md hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {isSubmitted ? (
                  <><CheckCircle className="w-4 h-4" /> Message Sent Successfully!</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Message</>
                )}
              </button>
            </form>
          </div>

          {/* Office Info + Map */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Office Information</h3>
              <div className="space-y-5">
                {[
                  {
                    icon: <MapPin className="w-5 h-5 text-[#ff3131]" />,
                    label: 'Address',
                    content: (
                      <address className="text-xs text-gray-600 not-italic leading-relaxed">
                        KD Book Bazaar<br />
                        Sector 15, Rohini<br />
                        New Delhi, Delhi 110089, India
                      </address>
                    )
                  },
                  {
                    icon: <Clock className="w-5 h-5 text-[#ff3131]" />,
                    label: 'Business Hours',
                    content: (
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Monday – Friday: 10:00 AM – 7:00 PM</p>
                        <p>Saturday: 10:00 AM – 6:00 PM</p>
                        <p>Sunday: 11:00 AM – 5:00 PM</p>
                      </div>
                    )
                  },
                  {
                    icon: <Headphones className="w-5 h-5 text-[#ff3131]" />,
                    label: 'Customer Support',
                    content: (
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>📧 Email: support@kdbookbazaar.com</p>
                        <p>We respond within 24 hours on business days.</p>
                      </div>
                    )
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">{item.label}</h4>
                      {item.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-56 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-blue-50 opacity-50" />
              <div className="text-center relative z-10">
                <div className="w-14 h-14 bg-[#ff3131] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-200">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900">KD Book Bazaar HQ</p>
                <p className="text-xs text-gray-500 mt-1">Sector 15, Rohini, New Delhi</p>
                <a
                  href="https://maps.google.com/?q=Sector+15+Rohini+New+Delhi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#ff3131] hover:underline"
                >
                  <MapPin className="w-3 h-3" /> View on Google Maps →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#ff3131]/10 border border-[#ff3131]/20 rounded-full px-4 py-1.5 mb-4">
              <span className="text-xs font-semibold text-[#ff3131] uppercase tracking-wider">Common Questions</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                q: "How quickly will I receive a response?",
                a: "We respond to emails within 24 hours on business days (Mon–Sat, 10 AM–7 PM)."
              },
              {
                q: "How do I track my order?",
                a: "Once dispatched, you'll receive an SMS and email with a tracking link. You can also track via My Orders in your account."
              },
              {
                q: "What is your return policy?",
                a: "We offer a 7-day easy return policy. Products must be unused, in original packaging, with all accessories intact."
              },
              {
                q: "How do I request a refund?",
                a: "Contact us via email at support@kdbookbazaar.com with your order number. Refunds are processed within 5–7 business days after approval."
              },
              {
                q: "Do you offer bulk or corporate orders?",
                a: "Yes! We offer special pricing for bulk orders (10+ units). Email us at support@kdbookbazaar.com for a custom quote."
              },
              {
                q: "Is Cash on Delivery available?",
                a: "Yes, COD is available on most pincodes across India. COD availability is shown at checkout based on your address."
              },
            ].map((faq, i) => (
              <div key={i} className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:border-[#ff3131]/20 hover:shadow-sm transition-all duration-200">
                <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">{faq.q}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[#1a1a1a] rounded-2xl p-12 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              {[Zap, Shield, Headphones].map((Icon, i) => (
                <div key={i} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#ff3131]" />
                </div>
              ))}
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">
              Still Need Help?
            </h2>
            <p className="text-sm text-blue-200 mb-8 leading-relaxed">
              Our support team is just an email away. We are committed to resolving your queries quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@kdbookbazaar.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#ff3131] hover:bg-[#cc0000] text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-orange-500/30"
              >
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
