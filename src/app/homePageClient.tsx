'use client';
import ProductCard from "../../components/ProductCard";
import HeroBanners from "../../components/HeroBanners";
import {
  Truck, RotateCcw, ShieldCheck, Headphones,
  Sparkles, MapPin, Lock, MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from 'react';

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
  { name: 'Ananya R.', city: 'Mumbai',    rating: 5, text: 'The quilting is gorgeous — fits way more than it looks. My everyday glam goes everywhere with me now.' },
  { name: 'Kavya S.',  city: 'Bengaluru', rating: 5, text: 'Keeps my lunch warm till 2 pm and gets compliments at the office. Worth every rupee.' },
  { name: 'Meera P.',  city: 'Delhi',     rating: 4, text: 'Tiny but seriously roomy. Zip is so smooth. Wish it came in one more colour!' },
];

const MARQUEE = [
  '✦ New arrivals every week','✦ Made in India','✦ Free shipping over ₹499',
  '✦ 7-day easy returns','✦ COD available','✦ 10,000+ happy carries',
  '✦ Curated · Characterful · Carry-worthy',
];

function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function Chevron({ dir = 'right', size = 18 }: { dir?: 'left' | 'right'; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: dir === 'left' ? 'rotate(180deg)' : undefined }}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i <= n ? '#FF6A2B' : 'none'} stroke="#FF6A2B" strokeWidth="1.6">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

/* ── Scroll-reveal wrapper ───────────────────────────────── */
function Reveal({
  children, delay = 0, y = 26, className = '', style,
}: {
  children: React.ReactNode; delay?: number; y?: number; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setVis(true); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'none' : `translateY(${y}px)`,
        filter: vis ? 'none' : 'blur(6px)',
        transition: `opacity .8s cubic-bezier(.16,.84,.44,1) ${delay}ms, transform .8s cubic-bezier(.16,.84,.44,1) ${delay}ms, filter .8s ease ${delay}ms`,
        willChange: vis ? 'auto' : 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Product-row maths ───────────────────────────────────────
   Categories hold anywhere from 3 to 13 products. A fixed 6-column grid
   left dead columns on the short ones, so each row picks a column count
   that its cells actually fill, and hides the cells that would spill into
   a ragged last row at narrower breakpoints. */
const COLS = { md: 4, lg: 5, xl: 6 } as const;

/** Columns to use for a row of exactly `cells` items (single row). */
function fitCols(cells: number) {
  return { md: Math.min(cells, COLS.md), lg: Math.min(cells, COLS.lg), xl: Math.min(cells, COLS.xl) };
}

/** Whole-row cutoffs for a grid of `n` items that may wrap. */
function wholeRows(n: number) {
  const cut = (c: number) => (n < c ? n : Math.floor(n / c) * c);
  return { md: cut(COLS.md), lg: cut(COLS.lg), xl: cut(COLS.xl) };
}

/** Per-breakpoint visibility for the cell at index `i`. */
function cellVis(i: number, v: { md: number; lg: number; xl: number }) {
  return [
    i < v.md ? 'block' : 'hidden',
    i < v.lg ? 'lg:block' : 'lg:hidden',
    i < v.xl ? 'xl:block' : 'xl:hidden',
  ].join(' ');
}

function rowVars(c: { md: number; lg: number; xl: number }) {
  return { '--n-md': c.md, '--n-lg': c.lg, '--n-xl': c.xl } as React.CSSProperties;
}

/* ── Simple in-view flag for a whole section ─────────────── */
function useReveal<T extends HTMLElement>(): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref as React.RefObject<T>, vis];
}

/* ── Count-up number for the stats band ──────────────────── */
function CountUp({ to, decimals = 0, suffix = '', run }: { to: number; decimals?: number; suffix?: string; run: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVal(to); return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1500;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{val.toFixed(decimals)}{suffix}</>;
}

/* ── Category slider (replaces the ragged category grid) ─── */
function CategoryRail({ categories }: { categories: Category[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [progress, setProgress] = useState(0);
  const [thumb, setThumb] = useState(1);

  const update = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
    setProgress(max > 8 ? el.scrollLeft / max : 0);
    setThumb(el.scrollWidth > 0 ? Math.min(1, el.clientWidth / el.scrollWidth) : 1);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const nudge = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.82), behavior: 'smooth' });
  };

  const scrollable = !(atStart && atEnd);

  return (
    <div className="relative">
      {/* Edge fades — only where there is more to see */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10 hidden sm:block transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg,#FFF6EF,transparent)', opacity: atStart ? 0 : 1 }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10 hidden sm:block transition-opacity duration-300"
        style={{ background: 'linear-gradient(270deg,#FFF6EF,transparent)', opacity: atEnd ? 0 : 1 }} />

      <div
        ref={railRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollPaddingLeft: 4 }}
      >
        {categories.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="group snap-start flex-[0_0_auto] w-[44vw] sm:w-[190px] lg:w-[210px]"
          >
            <div className="relative overflow-hidden arch transition-all duration-500 group-hover:-translate-y-2"
              style={{ aspectRatio: '4/5', boxShadow: '0 10px 26px -18px rgba(42,10,34,.5)' }}>
              {cat.image?.src
                ? <img src={cat.image.src} alt={cat.name} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.09]" />
                : <div className="w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-[1.06]"
                    style={{ background: `hsl(${i * 37 + 340},60%,92%)` }}>
                    <span className="font-serif text-4xl font-black" style={{ color: '#2A0A22', opacity: 0.12 }}>{cat.name[0]}</span>
                  </div>
              }
              <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-90"
                style={{ background: 'linear-gradient(to top, rgba(42,10,34,.78) 0%, rgba(42,10,34,.12) 52%, transparent 100%)' }} />

              {/* Hover arrow puck */}
              <span className="absolute top-3 right-3 w-8 h-8 rounded-full grid place-items-center text-white opacity-0 -translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400"
                style={{ background: 'linear-gradient(135deg,#FF8A3D,#E11D74)', boxShadow: '0 8px 18px -8px rgba(42,10,34,.6)' }}>
                <ArrowRight size={14} />
              </span>

              <div className="absolute bottom-0 left-0 right-0 p-3.5">
                <p className="font-serif text-[13.5px] font-semibold text-white leading-snug line-clamp-2">{cat.name}</p>
                {cat.count > 0 && (
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,233,221,.65)' }}>{cat.count} styles</p>
                )}
              </div>
            </div>
          </Link>
        ))}

        {/* Tail card → all categories */}
        <Link href="/collections"
          className="group snap-start flex-[0_0_auto] w-[44vw] sm:w-[190px] lg:w-[210px]">
          <div className="arch h-full flex flex-col items-center justify-center gap-2 border-2 border-dashed transition-all duration-500 group-hover:-translate-y-2"
            style={{ aspectRatio: '4/5', borderColor: 'rgba(225,29,116,.28)', background: 'rgba(255,233,221,.45)' }}>
            <span className="w-10 h-10 rounded-full grid place-items-center text-white transition-transform duration-500 group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg,#FF8A3D,#E11D74)' }}>
              <ArrowRight size={16} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[.14em] text-center px-4" style={{ color: 'rgba(42,10,34,.5)' }}>
              Browse<br />everything
            </span>
          </div>
        </Link>
      </div>

      {/* Controls: progress bar + arrows */}
      {scrollable && (
        <div className="flex items-center gap-4 mt-5">
          <div className="flex-1 h-[3px] rounded-full relative overflow-hidden" style={{ background: 'rgba(42,10,34,.09)' }}>
            <div className="absolute inset-y-0 rounded-full"
              style={{
                width: `${Math.max(12, thumb * 100)}%`,
                left: `${progress * (100 - Math.max(12, thumb * 100))}%`,
                background: 'linear-gradient(135deg,#FF8A3D,#E11D74)',
              }} />
          </div>
          <div className="hidden sm:flex gap-2">
            <button type="button" onClick={() => nudge(-1)} disabled={atStart} aria-label="Previous categories"
              className="w-9 h-9 rounded-full grid place-items-center border transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FFE9DD] active:scale-95"
              style={{ borderColor: 'rgba(42,10,34,.16)', color: '#2A0A22' }}>
              <Chevron dir="left" />
            </button>
            <button type="button" onClick={() => nudge(1)} disabled={atEnd} aria-label="Next categories"
              className="w-9 h-9 rounded-full grid place-items-center border transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FFE9DD] active:scale-95"
              style={{ borderColor: 'rgba(42,10,34,.16)', color: '#2A0A22' }}>
              <Chevron dir="right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePageClient({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [statsRef, statsVis] = useReveal<HTMLElement>();

  const chipCategories = categories;

  /* Only categories with enough stock get their own band — a 6-column row
     holding one lonely product is what made the desktop page look broken.
     Everything thinner gets pooled into "More from the shelf" below. */
  const MIN_PER_SECTION = 3;
  const MAX_SECTIONS = 5;

  const withProducts = categories
    .map(cat => ({
      ...cat,
      products: products.filter(p => p.categories?.some(c => c.slug === cat.slug || c.id === cat.id)).slice(0, 8),
    }))
    .filter(c => c.products.length > 0);

  const showcaseCategories = withProducts
    .filter(c => c.products.length >= MIN_PER_SECTION)
    .slice(0, MAX_SECTIONS)
    .map(c => {
      const shown = c.products.slice(0, 5);
      const cols = fitCols(shown.length + 1); // +1 for the "view all" tile
      return { ...c, shown, cols, vis: { md: cols.md - 1, lg: cols.lg - 1, xl: cols.xl - 1 } };
    });

  const shownIds = new Set(showcaseCategories.flatMap(c => c.products.map(p => p.id)));
  const leftovers = products.filter(p => !shownIds.has(p.id) && p.images?.[0]?.src).slice(0, 12);
  const leftoverCols = fitCols(leftovers.length);
  const leftoverVis = wholeRows(leftovers.length);

  const STATS = [
    { to: 10,  dec: 0, suffix: 'K+', l: 'Happy Carries' },
    { to: 4.9, dec: 1, suffix: '★',  l: 'Avg Rating'    },
    { to: 50,  dec: 0, suffix: '+',  l: 'Unique Styles' },
    { to: 100, dec: 0, suffix: '%',  l: 'Made in India' },
  ];

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: '#FFF6EF', color: '#2A0A22' }}>

      <style>{`
        @keyframes driftBlob { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(5%,-6%) scale(1.14)} }
        .prow { display:none; }
        @media (min-width:768px)  { .prow { display:grid; gap:1rem; grid-template-columns: repeat(var(--n-md,4), minmax(0,1fr)); } }
        @media (min-width:1024px) { .prow { gap:1.25rem; grid-template-columns: repeat(var(--n-lg,5), minmax(0,1fr)); } }
        @media (min-width:1280px) { .prow { grid-template-columns: repeat(var(--n-xl,6), minmax(0,1fr)); } }
      `}</style>

      {/* ═══════════════════ HERO BANNERS ═══════════════════ */}
      <HeroBanners />

      {/* ═══════════════════ MARQUEE ═══════════════════ */}
      <div className="py-3.5 overflow-hidden border-y border-[#2A0A22]/10" style={{ background: '#2A0A22' }}>
        <div className="marquee-track whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="inline-block text-[12.5px] font-semibold tracking-[.06em] mx-7" style={{ color: '#FFE9DD' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ═══════════════════ TRUST STRIP ═══════════════════ */}
      <section className="py-5 px-4 border-b border-[#FFE9DD]" style={{ background: 'rgba(255,233,221,.2)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { Icon: Truck,       t: 'Free Shipping',  s: 'On orders over ₹499'   },
            { Icon: RotateCcw,   t: 'Easy Returns',   s: '7-day hassle-free'     },
            { Icon: ShieldCheck, t: 'Secure Payment', s: '100% encrypted'        },
            { Icon: Headphones,  t: '24/7 Support',   s: 'Real humans, fast replies' },
          ].map((x, i) => (
            <Reveal key={i} delay={i * 70} y={14}>
              <div className="flex items-center gap-2.5 sm:gap-3 py-2.5 px-2.5 sm:px-3 rounded-xl h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-16px_rgba(42,10,34,.5)]" style={{ background: 'white' }}>
                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg grid place-items-center flex-shrink-0" style={{ background: '#FFE9DD' }}>
                  <x.Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={1.9} style={{ color: '#E11D74' }} />
                </span>
                <div>
                  <p className="text-[12px] sm:text-[12.5px] font-bold leading-tight" style={{ color: '#2A0A22' }}>{x.t}</p>
                  <p className="text-[10.5px] sm:text-[11px] leading-tight mt-0.5" style={{ color: 'rgba(42,10,34,.45)' }}>{x.s}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════ CATEGORIES ═══════════════════ */}
      {chipCategories.length > 0 && (
        <section className="py-11 sm:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[.18em] uppercase mb-2" style={{ color: '#E11D74' }}>
                    <span className="w-5 h-px" style={{ background: '#E11D74' }} />Browse the shelf
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: '#2A0A22' }}>Shop by Category</h2>
                  <p className="text-[13px] mt-1.5" style={{ color: 'rgba(42,10,34,.45)' }}>
                    {chipCategories.length} shelves to rummage through<span className="hidden sm:inline"> — swipe or use the arrows</span><span className="sm:hidden"> — swipe to browse</span>.
                  </p>
                </div>
                <Link href="/collections" className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold hover:gap-2.5 transition-all" style={{ color: '#E11D74' }}>
                  All categories <ArrowRight size={13} />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <CategoryRail categories={chipCategories} />
            </Reveal>

            <div className="sm:hidden flex justify-center mt-6">
              <Link href="/collections" className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: '#E11D74' }}>
                All categories <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ PROMO BANNER ═══════════════════ */}
      <section className="px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] px-8 py-10 md:px-14 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" style={{ background: '#2A0A22' }}>
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute rounded-full" style={{ width:400, height:400, right:-80, top:-120, background:'radial-gradient(closest-side,rgba(255,106,43,.22),transparent)', filter:'blur(40px)', animation:'driftBlob 20s ease-in-out infinite' }} />
                <div className="absolute rounded-full" style={{ width:280, height:280, left:-40, bottom:-80, background:'radial-gradient(closest-side,rgba(225,29,116,.2),transparent)', filter:'blur(36px)', animation:'driftBlob 24s ease-in-out infinite', animationDelay:'-8s' }} />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-bold uppercase tracking-[.22em] mb-2.5" style={{ color: 'rgba(255,233,221,.55)' }}>Limited time · Up to 40% off</p>
                <h3 className="font-serif text-3xl sm:text-4xl font-black text-white leading-tight mb-2">The sale shelf is open.</h3>
                <p className="text-[14px] max-w-sm" style={{ color: 'rgba(255,233,221,.65)' }}>
                  Our best-loved pouches, lunch bags &amp; carry sets — now at their lowest prices of the year.
                </p>
              </div>
              <Link href="/sale" className="relative z-10 mag-btn text-[15px] px-8 py-4 flex-shrink-0 whitespace-nowrap group">
                Shop the sale
                <span className="transition-transform duration-300 group-hover:translate-x-1"><ArrowRight size={16} /></span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ PRODUCT SECTIONS ═══════════════════ */}
      {showcaseCategories.length > 0 ? (
        showcaseCategories.map((cat, idx) => (
          <section key={cat.slug} className="py-9 sm:py-12 px-4 border-t border-[#FFE9DD]" style={{ background: idx % 2 === 1 ? 'rgba(255,233,221,.12)' : '#FFF6EF' }}>
            <div className="max-w-7xl mx-auto">
              <Reveal>
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold" style={{ color: '#2A0A22' }}>{cat.name}</h2>
                    <p className="text-[12px] mt-0.5" style={{ color: 'rgba(42,10,34,.45)' }}>{cat.products.length} styles available</p>
                  </div>
                  <Link href={`/category/${cat.slug}`} className="flex items-center gap-1 text-[13px] font-semibold hover:gap-2 transition-all" style={{ color: '#E11D74' }}>
                    See all <ArrowRight size={13} />
                  </Link>
                </div>
              </Reveal>
              {/* Mobile scroll */}
              <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar snap-x -mx-4 px-4 md:hidden">
                {cat.products.map(p => (
                  <div key={p.id} className="flex-shrink-0 w-40 snap-start">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
              {/* Desktop: one full row, products + a "view all" tile as the last cell */}
              <div className="prow" style={rowVars(cat.cols)}>
                {cat.shown.map((p, i) => (
                  <Reveal key={p.id} delay={i * 80} y={22} className={cellVis(i, cat.vis)}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
                <Reveal delay={cat.shown.length * 80} y={22}>
                  <Link href={`/category/${cat.slug}`}
                    className="h-full flex flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-[#FFE9DD] hover:border-[#E11D74]/40 hover:bg-[#FFE9DD]/30 transition-all duration-300 group min-h-[220px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-center px-3" style={{ color: 'rgba(42,10,34,.35)' }}>
                      View all {cat.count || ''} styles
                    </span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: '#E11D74' }}>
                      <ArrowRight size={13} />
                    </span>
                  </Link>
                </Reveal>
              </div>
            </div>
          </section>
        ))
      ) : products.length > 0 ? (
        <section className="py-9 sm:py-12 px-4 border-t border-[#FFE9DD]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-7">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold" style={{ color: '#2A0A22' }}>All Products</h2>
              <Link href="/collections" className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: '#E11D74' }}>See all <ArrowRight size={13} /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.slice(0, 5).map((p, i) => (
                <Reveal key={p.id} delay={i * 80} y={22}><ProductCard product={p} /></Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ═══════════════════ MORE FROM THE SHELF ═══════════════════ */}
      {showcaseCategories.length > 0 && leftovers.length > 0 && (
        <section className="py-9 sm:py-12 px-4 border-t border-[#FFE9DD]">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="flex items-end justify-between mb-7">
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[.18em] uppercase mb-2" style={{ color: '#E11D74' }}>
                    <span className="w-5 h-px" style={{ background: '#E11D74' }} />Odds &amp; ends
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold" style={{ color: '#2A0A22' }}>More from the shelf</h2>
                  <p className="text-[12px] mt-0.5" style={{ color: 'rgba(42,10,34,.45)' }}>
                    The one-offs and small batches — usually the first to go.
                  </p>
                </div>
                <Link href="/collections" className="flex items-center gap-1 text-[13px] font-semibold hover:gap-2 transition-all whitespace-nowrap" style={{ color: '#E11D74' }}>
                  Shop all <ArrowRight size={13} />
                </Link>
              </div>
            </Reveal>
            {/* Mobile scroll */}
            <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar snap-x -mx-4 px-4 md:hidden">
              {leftovers.map(p => (
                <div key={p.id} className="flex-shrink-0 w-40 snap-start">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            {/* Desktop — trimmed to whole rows at every breakpoint */}
            <div className="prow" style={rowVars(leftoverCols)}>
              {leftovers.map((p, i) => (
                <Reveal key={p.id} delay={(i % 6) * 80} y={22} className={cellVis(i, leftoverVis)}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section ref={statsRef as React.RefObject<HTMLElement>} className="py-11 sm:py-16 px-4" style={{ background: 'linear-gradient(135deg,#FF8A3D 0%,#FF4D6D 50%,#E11D74 100%)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((s, i) => (
            <div key={i} className="text-center transition-all duration-700" style={{ opacity: statsVis ? 1 : 0, transform: statsVis ? 'none' : 'translateY(22px)', transitionDelay: `${i * 110}ms` }}>
              <div className="font-serif text-4xl sm:text-5xl font-black text-white mb-1 tabular-nums">
                <CountUp to={s.to} decimals={s.dec} suffix={s.suffix} run={statsVis} />
              </div>
              <div className="text-[11px] uppercase tracking-[.15em] font-semibold" style={{ color: 'rgba(255,255,255,.7)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="py-11 sm:py-16 px-4" style={{ background: '#FFF6EF' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[.18em] uppercase mb-2" style={{ color: '#E11D74' }}>
                <span className="w-5 h-px" style={{ background: '#E11D74' }} />What carriers say
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: '#2A0A22' }}>Loved by thousands</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {REVIEWS.map((r, i) => (
              <Reveal key={i} delay={i * 110}>
                <div className="rounded-[22px] p-6 h-full flex flex-col justify-between lift-hover bg-white" style={{ boxShadow: '0 18px 50px -18px rgba(255,106,43,.18), 0 6px 20px -8px rgba(225,29,116,.1)' }}>
                  <div>
                    <Stars n={r.rating} />
                    <p className="text-[13.5px] leading-relaxed mt-4 mb-5 italic" style={{ color: 'rgba(42,10,34,.65)' }}>
                      &ldquo;{r.text}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#FFE9DD]">
                    <span className="w-9 h-9 rounded-full grid place-items-center text-white text-[13px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg,#FF8A3D,#E11D74)' }}>
                      {r.name[0]}
                    </span>
                    <div>
                      <p className="text-[13px] font-bold" style={{ color: '#2A0A22' }}>{r.name}</p>
                      <p className="text-[11px]" style={{ color: 'rgba(42,10,34,.4)' }}>{r.city}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHY US ═══════════════════ */}
      <section className="py-11 sm:py-14 px-4 border-t border-[#FFE9DD]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[.18em] uppercase mb-2" style={{ color: '#E11D74' }}>
                <span className="w-5 h-px" style={{ background: '#E11D74' }} />Why The Curio Shelf
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: '#2A0A22' }}>A shelf built different</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { Icon: Sparkles,      t: 'Curated with care',  b: 'Every piece is hand-picked for quality, character and carry-worthiness. No duds, no dupes.' },
              { Icon: MapPin,        t: 'Made in India',      b: 'Proudly sourced and crafted in India. Supporting local artisans and quality manufacturing.' },
              { Icon: RotateCcw,     t: '7-day easy returns', b: 'Not quite right? Return it hassle-free within 7 days. No questions, no drama.' },
              { Icon: Truck,         t: 'Free shipping',      b: 'Free pan-India shipping on orders over ₹499. Cash on delivery available almost everywhere.' },
              { Icon: Lock,          t: 'Secure checkout',    b: '100% encrypted payments via UPI, card, net banking & COD. Your data stays safe.' },
              { Icon: MessageCircle, t: 'Real human support', b: 'Chat with us on WhatsApp. We reply fast and actually care about your order.' },
            ].map((x, i) => (
              <Reveal key={i} delay={i * 70} y={20}>
                <div className="flex gap-4 p-5 rounded-[20px] h-full lift-hover" style={{ background: '#FFE9DD' }}>
                  <span className="w-10 h-10 rounded-xl grid place-items-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#FF8A3D,#E11D74)' }}>
                    <x.Icon className="w-[19px] h-[19px] text-white" strokeWidth={1.9} />
                  </span>
                  <div>
                    <h3 className="font-serif text-[15px] font-bold mb-1" style={{ color: '#2A0A22' }}>{x.t}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(42,10,34,.58)' }}>{x.b}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ NEWSLETTER ═══════════════════ */}
      <section className="py-11 sm:py-14 px-4" style={{ background: '#2A0A22' }}>
        <Reveal>
          <div className="max-w-lg mx-auto text-center">
            <p className="font-script text-3xl mb-2" style={{ color: '#FF8A4C' }}>Stay in the loop</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-white mb-3">Drop your email.</h2>
            <p className="text-[14px] mb-7 leading-relaxed" style={{ color: 'rgba(255,233,221,.55)' }}>
              New arrivals, exclusive deals, and a little wonder — straight to your inbox.
            </p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input type="email" placeholder="you@email.com" aria-label="Email address"
                className="flex-1 px-5 py-3.5 rounded-full text-[14px] outline-none focus:ring-2 focus:ring-[#E11D74]/40 transition-all"
                style={{ background: 'rgba(255,255,255,.08)', color: '#FFE9DD', border: '1px solid rgba(255,255,255,.12)' }} />
              <button className="px-5 py-3.5 rounded-full text-white font-bold text-[14px] hover:opacity-90 active:scale-95 transition-all duration-200 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg,#FF8A3D 0%,#FF4D6D 50%,#E11D74 100%)' }}>
                Join
              </button>
            </div>
          </div>
        </Reveal>
      </section>

    </div>
  );
}
