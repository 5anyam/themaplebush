'use client';
import ProductCard from "../../components/ProductCard";
import Link from "next/link";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  images?: { src: string }[];
  categories?: { id: number; name: string; slug?: string }[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  image?: { src: string } | null;
}

const REVIEWS = [
  { name: 'Ananya R.', city: 'Mumbai',    rating: 5, text: 'The quilting is gorgeous and it fits way more than it looks. My everyday glam goes everywhere with me now.' },
  { name: 'Kavya S.',  city: 'Bengaluru', rating: 5, text: 'Keeps my lunch warm till 2pm and the print gets compliments at the office. Worth every rupee.' },
  { name: 'Meera P.',  city: 'Delhi',     rating: 4, text: 'Tiny but seriously roomy. Zip is smooth. Wish it came in one more colour!' },
];

const TRUST = [
  { icon: '🚚', title: 'Free Shipping',   sub: 'Pan-India delivery'    },
  { icon: '↩️', title: 'Easy Returns',     sub: '7-day hassle-free'     },
  { icon: '🔒', title: 'Secure Payment',  sub: '100% safe & encrypted' },
  { icon: '💬', title: '24/7 Support',    sub: 'Always here for you'   },
];

const MARQUEE_ITEMS = [
  '✦ New arrivals weekly',
  '✦ Made in India',
  '✦ Free shipping pan-India',
  '✦ 7-day easy returns',
  '✦ COD available',
  '✦ 10,000+ happy carries',
  '✦ Curated · Characterful · Carry-worthy',
];

const STATS = [
  { number: '10K+',  label: 'Happy Carries'   },
  { number: '4.9★',  label: 'Average Rating'  },
  { number: '50+',   label: 'Unique Styles'   },
  { number: '100%',  label: 'Made in India'   },
];

function ArrowIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= value ? '#FF6A2B' : 'none'} stroke="#FF6A2B" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[11.5px] font-semibold tracking-[.18em] uppercase" style={{ color: '#E11D74' }}>
      <span className="w-6 h-px" style={{ background: '#E11D74' }} />
      {children}
    </div>
  );
}

function useReveal<T extends HTMLElement>(): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref as React.RefObject<T>, visible];
}

function ProductRow({ products, viewAllHref }: { products: Product[]; viewAllHref: string }) {
  return (
    <>
      <div className="md:hidden flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-4 px-4">
        {products.map((prod) => (
          <div key={prod.id} className="flex-shrink-0 w-40">
            <ProductCard product={prod} />
          </div>
        ))}
        <Link
          href={viewAllHref}
          className="flex-shrink-0 w-32 flex flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed border-[#FFE9DD] text-center px-2 text-[11px] font-bold text-[#2A0A22]/40 uppercase tracking-wider hover:border-[#E11D74]/40 transition-colors"
        >
          See all
        </Link>
      </div>
      <div className="hidden md:grid grid-cols-4 lg:grid-cols-5 gap-5">
        {products.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
        <Link
          href={viewAllHref}
          className="flex flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed border-[#FFE9DD] hover:border-[#E11D74]/40 hover:bg-[#FFE9DD]/30 transition-all group min-h-[200px]"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#2A0A22]/40 group-hover:text-[#E11D74] transition-colors text-center px-3">See all</span>
          <span className="text-[#2A0A22]/30 group-hover:text-[#E11D74] group-hover:translate-x-1 transition-all"><ArrowIcon size={14} /></span>
        </Link>
      </div>
    </>
  );
}

export default function HomePageClient({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");
  const [statsRef, statsVisible] = useReveal<HTMLElement>();

  function handleHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = heroSearch.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const chipCategories = categories.slice(0, 16);

  const showcaseCategories = categories
    .map((cat) => {
      const catProducts = products
        .filter((p) => p.categories?.some((c) => c.slug === cat.slug || c.id === cat.id))
        .slice(0, 5);
      return { ...cat, products: catProducts };
    })
    .filter((c) => c.products.length > 0);

  return (
    <div className="min-h-screen font-sans" style={{ background: '#FFF6EF', color: '#2A0A22' }}>

      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-30 breathe" style={{ background: 'radial-gradient(circle, #FF8A3D 0%, transparent 65%)' }} />
          <div className="absolute -bottom-16 -left-16 w-[360px] h-[360px] rounded-full opacity-20 breathe" style={{ background: 'radial-gradient(circle, #E11D74 0%, transparent 65%)', animationDelay: '4s' }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <SectionEyebrow>New arrivals just dropped</SectionEyebrow>

          <h1 className="font-serif mt-4 mb-3 leading-[1.08] tracking-tight" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', color: '#2A0A22' }}>
            Carry a little{' '}
            <span className="font-script italic" style={{ color: '#E11D74', fontSize: '1.15em' }}>wonder.</span>
          </h1>

          <p className="text-[#2A0A22]/55 text-base md:text-lg mb-9 max-w-lg mx-auto leading-relaxed">
            Curated, characterful carry goods for every day. Bags, pouches &amp; organisers — made in India, loved everywhere.
          </p>

          <form
            onSubmit={handleHeroSearch}
            className="flex items-center bg-white border border-[#FFE9DD] focus-within:border-[#E11D74]/50 rounded-full overflow-hidden max-w-md mx-auto mb-7 transition-colors shadow-soft"
          >
            <span className="ml-4 text-[#2A0A22]/40 flex-shrink-0"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Search bags, pouches, organisers…"
              className="flex-1 bg-transparent py-3.5 px-3 text-sm text-[#2A0A22] focus:outline-none placeholder-[#2A0A22]/35"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
            />
            <button
              type="submit"
              className="px-5 py-3.5 mr-1 rounded-full text-white text-xs font-bold tracking-wide hover:opacity-90 transition-opacity flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/collections" className="mag-btn text-[14px] px-7 py-3.5">
              Shop the shelf <ArrowIcon size={16} />
            </Link>
            <Link href="/sale" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[14px] border-2 border-[#2A0A22]/15 text-[#2A0A22] hover:bg-[#FFE9DD] transition-colors">
              Sale &amp; Deals
            </Link>
          </div>

          {chipCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {chipCategories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="px-4 py-2 rounded-full text-[12.5px] font-semibold transition-colors"
                  style={{ background: '#FFE9DD', color: '#2A0A22' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#2A0A22'; (e.currentTarget as HTMLElement).style.color = '#FFE9DD'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FFE9DD'; (e.currentTarget as HTMLElement).style.color = '#2A0A22'; }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MARQUEE */}
      <div className="py-3 overflow-hidden" style={{ background: '#2A0A22' }}>
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="text-[13px] font-semibold tracking-wide mx-6 whitespace-nowrap" style={{ color: '#FFE9DD' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* TRUST STRIP */}
      <section className="py-6 px-4 border-b border-[#FFE9DD]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[#FFE9DD]">
          {TRUST.map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center py-2 px-3 gap-1.5">
              <span className="text-xl">{item.icon}</span>
              <p className="text-[12.5px] font-bold" style={{ color: '#2A0A22' }}>{item.title}</p>
              <p className="text-[11px]" style={{ color: '#2A0A22', opacity: 0.5 }}>{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES GRID */}
      {chipCategories.length > 0 && (
        <section className="py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <SectionEyebrow>Browse the shelf</SectionEyebrow>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2" style={{ color: '#2A0A22' }}>Shop by Category</h2>
              </div>
              <Link href="/collections" className="hidden md:flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: '#E11D74' }}>
                All categories <ArrowIcon size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {chipCategories.map((cat) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} className="group block">
                  <div className="relative overflow-hidden arch transition-transform duration-400 group-hover:-translate-y-2 group-hover:scale-[1.02]" style={{ background: '#FFE9DD', aspectRatio: '4/5' }}>
                    {cat.image?.src ? (
                      <img src={cat.image.src} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFE9DD 0%, #FFF6EF 100%)' }}>
                        <span className="font-serif text-3xl font-bold" style={{ color: '#2A0A22', opacity: 0.2 }}>{cat.name[0]}</span>
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(42,10,34,.7) 0%, transparent 55%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-serif text-[14px] font-semibold leading-tight text-white">{cat.name}</p>
                      {cat.count > 0 && <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,233,221,.65)' }}>{cat.count} styles</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex md:hidden items-center justify-center mt-6">
              <Link href="/collections" className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: '#E11D74' }}>
                All categories <ArrowIcon size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* PROMO BANNER */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-xl3 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: '#2A0A22' }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #FF6A2B 0%, transparent 70%)' }} />
              <div className="absolute -bottom-10 left-10 w-48 h-48 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #E11D74 0%, transparent 70%)' }} />
            </div>
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] mb-2" style={{ color: 'rgba(255,233,221,.6)' }}>Limited time</p>
              <h3 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight mb-2">Sale is live!</h3>
              <p className="text-[14px] leading-relaxed max-w-sm" style={{ color: 'rgba(255,233,221,.7)' }}>
                Up to 40% off on our best-loved pouches, lunch bags &amp; more.
              </p>
            </div>
            <Link href="/sale" className="relative mag-btn text-[15px] px-8 py-4 whitespace-nowrap flex-shrink-0">
              Shop Sale <ArrowIcon size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* PRODUCT SECTIONS BY CATEGORY */}
      {showcaseCategories.length > 0 ? (
        showcaseCategories.map((cat, catIdx) => (
          <section key={cat.slug} className="py-12 px-4 border-b border-[#FFE9DD]" style={{ background: catIdx % 2 === 0 ? '#FFF6EF' : '#FFFBF7' }}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl md:text-3xl font-bold" style={{ color: '#2A0A22' }}>{cat.name}</h2>
                <Link href={`/category/${cat.slug}`} className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: '#E11D74' }}>
                  See all <ArrowIcon size={14} />
                </Link>
              </div>
              <ProductRow products={cat.products} viewAllHref={`/category/${cat.slug}`} />
            </div>
          </section>
        ))
      ) : products.length > 0 ? (
        <section className="py-12 px-4 border-b border-[#FFE9DD]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl md:text-3xl font-bold" style={{ color: '#2A0A22' }}>All Products</h2>
              <Link href="/collections" className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: '#E11D74' }}>See all <ArrowIcon size={14} /></Link>
            </div>
            <ProductRow products={products.slice(0, 5)} viewAllHref="/collections" />
          </div>
        </section>
      ) : null}

      {/* STATS */}
      <section ref={statsRef as React.RefObject<HTMLElement>} className="py-16 px-4" style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center transition-all duration-700" style={{ opacity: statsVisible ? 1 : 0, transform: statsVisible ? 'none' : 'translateY(20px)', transitionDelay: `${i * 100}ms` }}>
              <div className="font-serif text-4xl md:text-5xl font-bold text-white mb-1">{stat.number}</div>
              <div className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,.7)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-4" style={{ background: '#FFF6EF' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <SectionEyebrow>What carriers say</SectionEyebrow>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3" style={{ color: '#2A0A22' }}>Loved by thousands</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <div key={i} className="rounded-xl3 p-6 flex flex-col justify-between lift-hover" style={{ background: '#FFF6EF', boxShadow: '0 18px 50px -18px rgba(255,106,43,.22), 0 8px 24px -12px rgba(225,29,116,.12)' }}>
                <div>
                  <Stars value={r.rating} />
                  <p className="text-[#2A0A22]/70 text-[13.5px] leading-relaxed mt-4 mb-5 italic">&ldquo;{r.text}&rdquo;</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[#FFE9DD]">
                  <span className="w-9 h-9 rounded-full grid place-items-center text-white text-[13px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #E11D74 100%)' }}>
                    {r.name[0]}
                  </span>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: '#2A0A22' }}>{r.name}</p>
                    <p className="text-[11px]" style={{ color: '#2A0A22', opacity: 0.45 }}>{r.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-14 px-4 border-t border-[#FFE9DD]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <SectionEyebrow>Why The Curio Shelf</SectionEyebrow>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3" style={{ color: '#2A0A22' }}>A shelf built different</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '✦', title: 'Curated with care',   body: 'Every piece is hand-picked for quality, character and carry-worthiness. No duds, no dupes.' },
              { icon: '🇮🇳', title: 'Made in India',       body: 'Proudly sourced and crafted in India. Supporting local artisans and quality manufacturing.' },
              { icon: '↩️', title: '7-day easy returns',  body: 'Not quite right? Return it hassle-free within 7 days. No questions, no drama.' },
              { icon: '🚚', title: 'Free shipping',        body: 'Pan-India free shipping on all orders. Cash on delivery available everywhere.' },
              { icon: '🔒', title: 'Secure checkout',     body: '100% encrypted payments via UPI, card, net banking & COD. Your data stays safe.' },
              { icon: '💬', title: 'Real human support',  body: 'Chat with us on WhatsApp. We reply fast and actually care about your order.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl2 lift-hover" style={{ background: '#FFE9DD' }}>
                <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <h3 className="font-serif text-[16px] font-bold mb-1" style={{ color: '#2A0A22' }}>{item.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#2A0A22', opacity: 0.6 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-14 px-4" style={{ background: '#2A0A22' }}>
        <div className="max-w-lg mx-auto text-center">
          <p className="font-script text-3xl mb-2" style={{ color: '#FF8A4C' }}>Stay in the loop</p>
          <h2 className="font-serif text-3xl font-bold text-white mb-3">Drop your email.</h2>
          <p className="text-[14px] mb-7 leading-relaxed" style={{ color: 'rgba(255,233,221,.6)' }}>
            New arrivals, exclusive deals, and a little wonder — straight to your inbox.
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 px-5 py-3.5 rounded-full text-[14px] outline-none focus:ring-2 focus:ring-[#E11D74]/40 transition-all"
              style={{ background: 'rgba(255,255,255,.1)', color: '#FFE9DD', border: '1px solid rgba(255,255,255,.15)' }}
            />
            <button
              className="px-6 py-3.5 rounded-full text-white font-bold text-[14px] hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
