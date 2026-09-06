'use client';
import ProductCard from "../../components/ProductCard";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from 'react';
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
  { name: 'Ananya R.', city: 'Mumbai',    rating: 5, text: 'The quilting is gorgeous — fits way more than it looks. My everyday glam goes everywhere with me now.' },
  { name: 'Kavya S.',  city: 'Bengaluru', rating: 5, text: 'Keeps my lunch warm till 2 pm and gets compliments at the office. Worth every rupee.' },
  { name: 'Meera P.',  city: 'Delhi',     rating: 4, text: 'Tiny but seriously roomy. Zip is so smooth. Wish it came in one more colour!' },
];

const MARQUEE = [
  '✦ New arrivals every week','✦ Made in India','✦ Free shipping over ₹499',
  '✦ 7-day easy returns','✦ COD available','✦ 10,000+ happy carries',
  '✦ Curated · Characterful · Carry-worthy',
];

/* Words that cycle through the hero headline */
const HERO_WORDS = ['wonder', 'character', 'mischief', 'chaos', 'magic'];
const LONGEST_WORD = HERO_WORDS.reduce((a, b) => (b.length > a.length ? b : a), '');

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

/* ── Rotating hero word ──────────────────────────────────── */
function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI(v => (v + 1) % HERO_WORDS.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    /* block on small screens so the word always gets its own line instead of
       pushing the headline past the viewport edge */
    <span className="relative block sm:inline-block align-baseline w-fit">
      {/* invisible sizer keeps the line from jumping */}
      <span className="invisible" aria-hidden>{LONGEST_WORD}</span>
      <span className="sr-only">{HERO_WORDS[i]}</span>
      {HERO_WORDS.map((w, idx) => (
        <span
          key={w}
          aria-hidden
          className="absolute left-0 top-0 whitespace-nowrap grad-text grad-pan"
          style={{
            opacity: idx === i ? 1 : 0,
            transform: idx === i ? 'translateY(0) rotateX(0deg)' : 'translateY(.32em) rotateX(-55deg)',
            transition: 'opacity .55s cubic-bezier(.16,.84,.44,1), transform .55s cubic-bezier(.16,.84,.44,1)',
            transformOrigin: '50% 100%',
          }}
        >
          {w}
        </span>
      ))}
      {/* hand-drawn underline, redrawn on every word change */}
      <svg key={i} className="absolute left-0" width="100%" height="16" viewBox="0 0 220 16" fill="none" preserveAspectRatio="none"
        style={{ bottom: '-.24em', pointerEvents: 'none' }} aria-hidden>
        <path className="underline-path" d="M4 10C44 3 86 2 120 7C150 11 188 13 216 5"
          stroke="#E11D74" strokeWidth="4" strokeLinecap="round"/>
      </svg>
    </span>
  );
}

/* Floating framed product card for hero */
function HeroFrame({ product, style, delay = 0, parallax = 0 }: { product: Product; style: React.CSSProperties; delay?: number; parallax?: number }) {
  const img = product.images?.[0]?.src;
  return (
    <Link
      href={`/product/${product.slug}`}
      className="absolute group"
      style={{ ...style, animationDelay: `${delay}s` }}
    >
      <div
        className="relative rounded-[6px] overflow-visible transition-[translate] duration-500 ease-out"
        style={{
          padding: 10,
          background: 'linear-gradient(#FFFDFB,#FFF1E9)',
          boxShadow: '0 40px 60px -24px rgba(42,10,34,.45), 0 12px 28px -12px rgba(176,19,97,.28), inset 0 0 0 1px rgba(255,255,255,.7), inset 0 0 0 7px rgba(255,255,255,.65), inset 0 0 0 8px rgba(225,29,116,.45)',
          animation: `floatFrame ${4 + delay}s ease-in-out infinite alternate`,
          translate: `0 ${parallax}px`,
        }}
      >
        {/* Outer frame border */}
        <div className="absolute inset-0 rounded-[6px] pointer-events-none" style={{
          background: 'linear-gradient(150deg,#3A0E2A,#7a1450 32%,#3A0E2A 72%)',
          padding: 2,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
        }} />
        {/* Image */}
        <div className="overflow-hidden rounded-[3px]" style={{ width: '100%', height: '100%' }}>
          {img
            ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" draggable={false} />
            : <div className="w-full h-full flex items-center justify-center" style={{ background: '#FFE9DD' }}>
                <span className="font-serif text-4xl font-bold" style={{ color: '#2A0A22', opacity: 0.15 }}>{product.name[0]}</span>
              </div>
          }
          {/* Glass sheen */}
          <div className="absolute inset-[10px] rounded-[3px] pointer-events-none" style={{
            background: 'linear-gradient(125deg,rgba(255,255,255,.4),rgba(255,255,255,.05) 30%,transparent 46%)',
          }} />
          {/* Hover shine sweep */}
          <div className="absolute inset-[10px] rounded-[3px] pointer-events-none overflow-hidden">
            <span className="shine-sweep" />
          </div>
        </div>
        {/* Catalogue plate */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-3.5 whitespace-nowrap font-serif text-[9px] font-semibold tracking-[.14em] uppercase text-white px-3 py-1 rounded-sm z-10"
          style={{ background: 'linear-gradient(135deg,#FF8A3D 0%,#FF4D6D 50%,#E11D74 100%)', boxShadow: '0 4px 10px -4px rgba(42,10,34,.5)' }}
        >
          {product.name.length > 18 ? product.name.slice(0, 16) + '…' : product.name}
        </div>
      </div>
    </Link>
  );
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
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState('');
  const [statsRef, statsVis] = useReveal<HTMLElement>();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = heroSearch.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  /* Gentle pointer parallax for the hero vitrine (desktop only) */
  function handleHeroMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    });
  }

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

  /* Pick up to 3 products with images for the hero vitrine */
  const heroProducts = products.filter(p => p.images?.[0]?.src).slice(0, 3);

  const STATS = [
    { to: 10,  dec: 0, suffix: 'K+', l: 'Happy Carries' },
    { to: 4.9, dec: 1, suffix: '★',  l: 'Avg Rating'    },
    { to: 50,  dec: 0, suffix: '+',  l: 'Unique Styles' },
    { to: 100, dec: 0, suffix: '%',  l: 'Made in India' },
  ];

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: '#FFF6EF', color: '#2A0A22' }}>

      <style>{`
        @keyframes floatFrame { 0%{transform:translateY(0) rotate(var(--r,0deg))} 100%{transform:translateY(-10px) rotate(var(--r,0deg))} }
        @keyframes driftBlob  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(5%,-6%) scale(1.14)} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes underlineDraw { from{stroke-dashoffset:240} to{stroke-dashoffset:0} }
        @keyframes gradPan    { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes sweep      { 0%{transform:translateX(-120%) skewX(-18deg)} 100%{transform:translateX(220%) skewX(-18deg)} }
        @keyframes scrollHint { 0%,100%{transform:translateY(0);opacity:.5} 50%{transform:translateY(6px);opacity:1} }
        .hero-fade { animation: fadeUp .9s ease both; }
        .hero-fade-1 { animation-delay: .05s }
        .hero-fade-2 { animation-delay: .18s }
        .hero-fade-3 { animation-delay: .30s }
        .hero-fade-4 { animation-delay: .44s }
        .hero-fade-5 { animation-delay: .58s }
        .hero-fade-6 { animation-delay: .70s }
        .underline-path { stroke-dasharray:240; stroke-dashoffset:240; animation: underlineDraw 1.1s .35s cubic-bezier(.4,0,.2,1) forwards; }
        .grad-pan { background-size: 220% 220%; animation: gradPan 7s ease-in-out infinite; }
        .shine-sweep {
          position:absolute; top:0; bottom:0; width:42%; left:0; opacity:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);
        }
        .group:hover .shine-sweep { opacity:1; animation: sweep .9s cubic-bezier(.4,0,.2,1); }
        .scroll-hint { animation: scrollHint 2s ease-in-out infinite; }
        .prow { display:none; }
        @media (min-width:768px)  { .prow { display:grid; gap:1rem; grid-template-columns: repeat(var(--n-md,4), minmax(0,1fr)); } }
        @media (min-width:1024px) { .prow { gap:1.25rem; grid-template-columns: repeat(var(--n-lg,5), minmax(0,1fr)); } }
        @media (min-width:1280px) { .prow { grid-template-columns: repeat(var(--n-xl,6), minmax(0,1fr)); } }
        .grain-overlay { position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.055;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size:160px 160px; }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade, .grad-pan, .shine-sweep, .scroll-hint { animation: none !important; }
          .underline-path { animation: none !important; stroke-dashoffset: 0 !important; }
        }
      `}</style>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative overflow-hidden pt-14 pb-16 sm:pt-20 sm:pb-24 px-4">

        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full" style={{ width:'54%', height:'70%', left:'-12%', top:'-18%', background:'radial-gradient(closest-side,rgba(255,178,102,.48),transparent)', filter:'blur(52px)', animation:'driftBlob 22s ease-in-out infinite' }} />
          <div className="absolute rounded-full" style={{ width:'52%', height:'66%', right:'-14%', top:'4%', background:'radial-gradient(closest-side,rgba(255,77,109,.38),transparent)', filter:'blur(52px)', animation:'driftBlob 18s ease-in-out infinite', animationDelay:'-9s' }} />
          <div className="absolute rounded-full" style={{ width:'30%', height:'38%', left:'35%', bottom:'-8%', background:'radial-gradient(closest-side,rgba(225,29,116,.22),transparent)', filter:'blur(48px)', animation:'driftBlob 26s ease-in-out infinite', animationDelay:'-14s' }} />
        </div>
        <div className="grain-overlay" aria-hidden />

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">

          {/* ── Left: Copy ── */}
          <div className="min-w-0">
            <div className="hero-fade hero-fade-1 inline-flex items-center gap-2 mb-5 text-[11.5px] font-bold tracking-[.18em] uppercase" style={{ color: '#E11D74' }}>
              <span className="w-5 h-px" style={{ background: '#E11D74' }} />
              A shelf of small wonders · Made in India
            </div>

            <h1 className="hero-fade hero-fade-2 font-serif font-black leading-[.94] tracking-tight mb-5 break-words"
              style={{ fontSize: 'clamp(2.3rem,6vw,4.8rem)' }}>
              Carry a little{' '}
              <RotatingWord />
            </h1>

            <p className="hero-fade hero-fade-3 font-script mb-5" style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', color: '#E11D74', lineHeight: 1.15 }}>
              all your curiosities, one shelf
            </p>

            <p className="hero-fade hero-fade-3 text-base sm:text-lg leading-relaxed mb-8 max-w-lg" style={{ color: 'rgba(42,10,34,.62)' }}>
              Lunch bags that keep lunch warm till 2pm. Pouches that somehow swallow an entire handbag.
              Organisers that finally make the drawer make sense. Handpicked, honestly priced, made in India.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="hero-fade hero-fade-4 flex items-center max-w-sm mb-8 rounded-full overflow-hidden border border-[#FFE9DD] bg-white/80 focus-within:border-[#E11D74]/50 focus-within:shadow-[0_10px_30px_-14px_rgba(225,29,116,.55)] transition-all duration-300 shadow-sm">
              <svg className="ml-4 flex-shrink-0" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color:'rgba(42,10,34,.35)' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" value={heroSearch} onChange={e => setHeroSearch(e.target.value)}
                placeholder="Search bags, pouches…"
                aria-label="Search products"
                className="flex-1 bg-transparent py-3.5 px-3 text-sm focus:outline-none placeholder-[#2A0A22]/30"
                style={{ color: '#2A0A22' }} />
              <button type="submit" className="m-1 px-4 py-2.5 rounded-full text-white text-xs font-bold tracking-wide hover:opacity-90 active:scale-95 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg,#FF8A3D 0%,#FF4D6D 50%,#E11D74 100%)' }}>
                Search
              </button>
            </form>

            {/* CTAs */}
            <div className="hero-fade hero-fade-5 flex flex-wrap gap-3 mb-8">
              <Link href="/collections" className="mag-btn text-[14px] px-7 py-3.5 group">
                Shop the shelf
                <span className="transition-transform duration-300 group-hover:translate-x-1"><ArrowRight /></span>
              </Link>
              <Link href="/sale" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[14px] border-2 border-[#2A0A22]/15 hover:border-[#E11D74]/40 hover:bg-[#FFE9DD] hover:-translate-y-0.5 transition-all duration-300" style={{ color: '#2A0A22' }}>
                Sale &amp; Deals
              </Link>
            </div>

            {/* Category chips */}
            {chipCategories.length > 0 && (
              <div className="hero-fade hero-fade-6 flex flex-wrap gap-2">
                {chipCategories.slice(0, 6).map(cat => (
                  <Link key={cat.slug} href={`/category/${cat.slug}`}
                    className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold border hover:bg-[#FFE9DD] hover:border-[#E11D74]/40 hover:-translate-y-0.5 transition-all duration-300"
                    style={{ color: '#2A0A22', borderColor: 'rgba(42,10,34,0.18)' }}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Vitrine (floating framed products) ── */}
          <div
            className="hidden lg:block relative"
            style={{ height: 560 }}
            onMouseMove={handleHeroMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          >
            {heroProducts[0] && (
              <HeroFrame product={heroProducts[0]} delay={0} parallax={tilt.y * -18}
                style={{ left: '18%', top: '4%', width: '46%', aspectRatio: '3/4', '--r':'-1.5deg' } as React.CSSProperties} />
            )}
            {heroProducts[1] && (
              <HeroFrame product={heroProducts[1]} delay={1.8} parallax={tilt.y * 12}
                style={{ right: '2%', top: '12%', width: '40%', aspectRatio: '3/4', '--r':'2deg' } as React.CSSProperties} />
            )}
            {heroProducts[2] && (
              <HeroFrame product={heroProducts[2]} delay={3.2} parallax={tilt.y * 22}
                style={{ left: '4%', bottom: '4%', width: '36%', aspectRatio: '3/4', '--r':'-2.5deg' } as React.CSSProperties} />
            )}
            {/* Floating tag */}
            <div className="absolute z-10 font-script text-white text-2xl px-4 py-1.5 rounded-[4px] float-soft"
              style={{ right: '8%', top: '3%', background: 'linear-gradient(135deg,#FF8A3D,#E11D74)', boxShadow: '0 14px 24px -10px rgba(176,19,97,.5)', transform: 'rotate(-2.5deg)', animationDelay: '1.2s' }}>
              handpicked
            </div>
            {/* New season chip */}
            <div className="absolute z-10 flex items-center gap-2 text-[#FFE9DD] text-[11px] font-semibold tracking-[.14em] uppercase px-4 py-2.5 rounded-[4px] float-soft"
              style={{ left: '2%', top: '30%', background: 'linear-gradient(#3A0E2A,#2A0A22)', boxShadow: '0 16px 28px -12px rgba(42,10,34,.6), inset 0 0 0 1px rgba(225,29,116,.45)', animationDelay: '2.4s' }}>
              <span className="w-2 h-2 rounded-full breathe" style={{ background: 'linear-gradient(135deg,#FF8A3D,#E11D74)' }} />
              new season
            </div>
          </div>

          {/* Mobile: simple image strip instead of vitrine */}
          {heroProducts.length > 0 && (
            <div className="lg:hidden flex gap-3 overflow-x-auto no-scrollbar snap-x -mx-4 px-4 pb-1">
              {heroProducts.slice(0, 3).map(p => (
                <Link key={p.id} href={`/product/${p.slug}`} className="flex-shrink-0 w-36 snap-start active:scale-95 transition-transform">
                  <div className="rounded-2xl overflow-hidden border border-[#FFE9DD]" style={{ aspectRatio:'3/4', background:'#FFE9DD' }}>
                    {p.images?.[0]?.src && <img src={p.images[0].src} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <p className="text-[12px] font-semibold mt-1.5 line-clamp-1" style={{ color: '#2A0A22' }}>{p.name}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

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
            { icon: '🚚', t: 'Free Shipping',  s: 'On orders over ₹499'   },
            { icon: '↩️', t: 'Easy Returns',   s: '7-day hassle-free'     },
            { icon: '🔒', t: 'Secure Payment', s: '100% encrypted'        },
            { icon: '💬', t: '24/7 Support',   s: 'Real humans, fast replies' },
          ].map((x, i) => (
            <Reveal key={i} delay={i * 70} y={14}>
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-16px_rgba(42,10,34,.5)]" style={{ background: 'white' }}>
                <span className="text-xl flex-shrink-0">{x.icon}</span>
                <div>
                  <p className="text-[12.5px] font-bold leading-tight" style={{ color: '#2A0A22' }}>{x.t}</p>
                  <p className="text-[11px] leading-tight" style={{ color: 'rgba(42,10,34,.45)' }}>{x.s}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════ CATEGORIES ═══════════════════ */}
      {chipCategories.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[.18em] uppercase mb-2" style={{ color: '#E11D74' }}>
                    <span className="w-5 h-px" style={{ background: '#E11D74' }} />Browse the shelf
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: '#2A0A22' }}>Shop by Category</h2>
                  <p className="text-[13px] mt-1.5" style={{ color: 'rgba(42,10,34,.45)' }}>
                    {chipCategories.length} shelves to rummage through — swipe or use the arrows.
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
          <section key={cat.slug} className="py-12 px-4 border-t border-[#FFE9DD]" style={{ background: idx % 2 === 1 ? 'rgba(255,233,221,.12)' : '#FFF6EF' }}>
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
        <section className="py-12 px-4 border-t border-[#FFE9DD]">
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
        <section className="py-12 px-4 border-t border-[#FFE9DD]">
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
      <section ref={statsRef as React.RefObject<HTMLElement>} className="py-16 px-4" style={{ background: 'linear-gradient(135deg,#FF8A3D 0%,#FF4D6D 50%,#E11D74 100%)' }}>
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
      <section className="py-16 px-4" style={{ background: '#FFF6EF' }}>
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
      <section className="py-14 px-4 border-t border-[#FFE9DD]">
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
              { icon: '✦', t: 'Curated with care',  b: 'Every piece is hand-picked for quality, character and carry-worthiness. No duds, no dupes.' },
              { icon: '🇮🇳', t: 'Made in India',     b: 'Proudly sourced and crafted in India. Supporting local artisans and quality manufacturing.' },
              { icon: '↩️', t: '7-day easy returns', b: 'Not quite right? Return it hassle-free within 7 days. No questions, no drama.' },
              { icon: '🚚', t: 'Free shipping',       b: 'Free pan-India shipping on orders over ₹499. Cash on delivery available almost everywhere.' },
              { icon: '🔒', t: 'Secure checkout',     b: '100% encrypted payments via UPI, card, net banking & COD. Your data stays safe.' },
              { icon: '💬', t: 'Real human support',  b: 'Chat with us on WhatsApp. We reply fast and actually care about your order.' },
            ].map((x, i) => (
              <Reveal key={i} delay={i * 70} y={20}>
                <div className="flex gap-4 p-5 rounded-[20px] h-full lift-hover" style={{ background: '#FFE9DD' }}>
                  <span className="text-2xl flex-shrink-0 mt-0.5">{x.icon}</span>
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
      <section className="py-14 px-4" style={{ background: '#2A0A22' }}>
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
