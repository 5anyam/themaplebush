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

  const inputClass = 'w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#E11D74] focus:ring-2 focus:ring-[#E11D74]/10 transition-all text-sm';
  const inputStyle = { borderColor: '#FFE9DD', background: '#FFF6EF', color: '#2A0A22' };

  return (
    <main style={{ background: '#FFF6EF', color: '#2A0A22' }}>
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">

        {/* ── HERO ── */}
        <section className="text-center py-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5" style={{ background: 'rgba(225,29,116,0.08)', border: '1px solid rgba(225,29,116,0.2)' }}>
            <MessageSquare className="w-3.5 h-3.5" style={{ color: '#E11D74' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#E11D74' }}>Get in Touch</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold font-serif mb-4 tracking-tight" style={{ color: '#2A0A22' }}>
            We are Here to Help
          </h1>
          <p className="text-sm lg:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: '#2A0A22', opacity: 0.6 }}>
            Questions about your order, our products, or a custom inquiry? Our team is ready to help — fast and friendly.
          </p>
        </section>

        {/* ── CONTACT CARDS ── */}
        <section className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: <Mail className="w-6 h-6" style={{ color: '#E11D74' }} />,
              label: 'Email Us',
              desc: 'We respond within 24 hours on business days',
              cta: (
                <a href="mailto:hello@thecurioshelf.in" className="text-xs font-semibold hover:underline" style={{ color: '#E11D74' }}>
                  hello@thecurioshelf.in
                </a>
              ),
            },
            {
              icon: <MapPin className="w-6 h-6" style={{ color: '#E11D74' }} />,
              label: 'Our Studio',
              desc: 'Designed and dispatched from India',
              cta: (
                <address className="text-xs not-italic leading-relaxed" style={{ color: '#2A0A22', opacity: 0.65 }}>
                  The Curio Shelf Studio<br />
                  New Delhi, India
                </address>
              ),
            },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-7 border shadow-sm hover:shadow-md transition-all duration-300 group" style={{ borderColor: '#FFE9DD' }}>
              <div className="w-12 h-12 bg-[#FFE9DD] rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                {card.icon}
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: '#2A0A22' }}>{card.label}</h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: '#2A0A22', opacity: 0.55 }}>{card.desc}</p>
              {card.cta}
            </div>
          ))}
        </section>

        {/* ── FORM + INFO ── */}
        <section className="grid lg:grid-cols-2 gap-10">

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 border shadow-sm" style={{ borderColor: '#FFE9DD' }}>
            <h2 className="text-2xl font-bold font-serif mb-1" style={{ color: '#2A0A22' }}>Send Us a Message</h2>
            <p className="text-xs mb-7" style={{ color: '#2A0A22', opacity: 0.5 }}>Fill out the form and we will get back to you shortly.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#2A0A22', opacity: 0.65 }}>
                    Full Name <span style={{ color: '#E11D74', opacity: 1 }}>*</span>
                  </label>
                  <input
                    type="text" name="name" value={formData.name}
                    onChange={handleInputChange} required
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#2A0A22', opacity: 0.65 }}>
                    Email <span style={{ color: '#E11D74', opacity: 1 }}>*</span>
                  </label>
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleInputChange} required
                    className={inputClass}
                    style={inputStyle}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#2A0A22', opacity: 0.65 }}>
                    Phone <span style={{ color: '#E11D74', opacity: 1 }}>*</span>
                  </label>
                  <input
                    type="tel" name="phone" value={formData.phone}
                    onChange={handleInputChange} required
                    className={inputClass}
                    style={inputStyle}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#2A0A22', opacity: 0.65 }}>
                    Subject <span style={{ color: '#E11D74', opacity: 1 }}>*</span>
                  </label>
                  <select
                    name="subject" value={formData.subject}
                    onChange={handleInputChange} required
                    className={inputClass}
                    style={inputStyle}
                  >
                    <option value="">Select a subject</option>
                    <option value="order">Order Support</option>
                    <option value="return">Exchange / Return</option>
                    <option value="product">Product Inquiry</option>
                    <option value="payment">Payment Issue</option>
                    <option value="custom">Custom / Personalised Order</option>
                    <option value="bulk">Bulk / Corporate Gifting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#2A0A22', opacity: 0.65 }}>
                  Message <span style={{ color: '#E11D74', opacity: 1 }}>*</span>
                </label>
                <textarea
                  name="message" value={formData.message}
                  onChange={handleInputChange} required rows={5}
                  className={`${inputClass} resize-none`}
                  style={inputStyle}
                  placeholder="Tell us how we can help you..."
                />
                <p className="text-[11px] mt-1" style={{ color: '#2A0A22', opacity: 0.35 }}>{formData.message.length} characters</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitted}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                  isSubmitted
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'text-white shadow-md hover:-translate-y-0.5 active:translate-y-0'
                }`}
                style={isSubmitted ? {} : { background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
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
            <div className="bg-white rounded-2xl p-7 border shadow-sm" style={{ borderColor: '#FFE9DD' }}>
              <h3 className="text-xl font-bold font-serif mb-6" style={{ color: '#2A0A22' }}>Studio Information</h3>
              <div className="space-y-5">
                {[
                  {
                    icon: <MapPin className="w-5 h-5" style={{ color: '#E11D74' }} />,
                    label: 'Address',
                    content: (
                      <address className="text-xs not-italic leading-relaxed" style={{ color: '#2A0A22', opacity: 0.65 }}>
                        The Curio Shelf<br />
                        New Delhi, India
                      </address>
                    )
                  },
                  {
                    icon: <Clock className="w-5 h-5" style={{ color: '#E11D74' }} />,
                    label: 'Business Hours',
                    content: (
                      <div className="text-xs space-y-1" style={{ color: '#2A0A22', opacity: 0.65 }}>
                        <p>Monday – Friday: 10:00 AM – 7:00 PM</p>
                        <p>Saturday: 10:00 AM – 6:00 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    )
                  },
                  {
                    icon: <Headphones className="w-5 h-5" style={{ color: '#E11D74' }} />,
                    label: 'Customer Support',
                    content: (
                      <div className="text-xs space-y-1" style={{ color: '#2A0A22', opacity: 0.65 }}>
                        <p>Email: hello@thecurioshelf.in</p>
                        <p>We respond within 24 hours on business days.</p>
                      </div>
                    )
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#FFE9DD] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#2A0A22' }}>{item.label}</h4>
                      {item.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl border shadow-sm h-56 flex items-center justify-center relative overflow-hidden" style={{ borderColor: '#FFE9DD' }}>
              <div className="absolute inset-0 opacity-40" style={{ background: 'linear-gradient(135deg, #FFE9DD 0%, #FFF6EF 100%)' }} />
              <div className="text-center relative z-10">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)', boxShadow: '0 8px 24px rgba(225,29,116,0.3)' }}
                >
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-bold" style={{ color: '#2A0A22' }}>The Curio Shelf Studio</p>
                <p className="text-xs mt-1" style={{ color: '#2A0A22', opacity: 0.5 }}>New Delhi, India</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-white rounded-2xl border shadow-sm p-8 md:p-12" style={{ borderColor: '#FFE9DD' }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4" style={{ background: 'rgba(225,29,116,0.08)', border: '1px solid rgba(225,29,116,0.2)' }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#E11D74' }}>Common Questions</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold font-serif" style={{ color: '#2A0A22' }}>Frequently Asked Questions</h2>
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
                q: "What is your exchange policy?",
                a: "We offer a 7-day easy exchange policy. Products must be unused, in original packaging, with all tags and accessories intact."
              },
              {
                q: "How do I request a refund?",
                a: "Contact us via email at hello@thecurioshelf.in with your order number. Refunds are processed within 5–7 business days after approval."
              },
              {
                q: "Do you offer bulk or corporate gifting?",
                a: "Yes! We offer custom-branded and personalised gifting for corporates. Email us at hello@thecurioshelf.in for a custom quote."
              },
              {
                q: "Can I personalise a product?",
                a: "Absolutely! We offer monogramming and custom orders on select products. Reach out to us with your requirements and we'll get back to you."
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-xl border transition-all duration-200 hover:shadow-sm" style={{ background: '#FFF6EF', borderColor: '#FFE9DD' }}>
                <h3 className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#2A0A22' }}>{faq.q}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#2A0A22', opacity: 0.6 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-2xl p-12 text-white text-center relative overflow-hidden" style={{ background: '#2A0A22' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(225,29,116,0.15)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              {[Zap, Shield, Headphones].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <Icon className="w-5 h-5" style={{ color: '#E11D74' }} />
                </div>
              ))}
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-3 tracking-tight">
              Still Need Help?
            </h2>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: '#FFE9DD', opacity: 0.8 }}>
              Our team is just an email away. We are committed to resolving your queries quickly and making your experience with The Curio Shelf a delightful one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@thecurioshelf.in"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
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
