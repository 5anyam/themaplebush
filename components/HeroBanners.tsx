'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Full-bleed hero banner carousel.
 *
 * The artwork has its headline baked into the image, always to one side of the
 * product. That drives the whole responsive strategy:
 *
 *  - From 768px up the frame uses the artwork's native 1856:576 ratio, so the
 *    image is shown whole and the baked-in text stays legible.
 *  - Below that a 4:3 frame would crop the sides and slice the text in half, so
 *    each slide carries its own `focus` value that pans the crop onto the
 *    product and away from the text. Our own caption then supplies the words.
 *
 * `focus` is the object-position X used on mobile only; the windows it produces
 * were checked against each image so no baked text is ever clipped.
 */

interface Slide {
  src: string;
  alt: string;
  href: string;
  /** Mobile object-position X. Pans the crop onto the product, off the text. */
  focus: string;
  /** Mobile-only caption — the baked headline is cropped out at that size. */
  caption: string;
  cta: string;
}

const SLIDES: Slide[] = [
  {
    src: '/banners/IMG_5526.jpg.jpeg',
    alt: 'A woman on a beach lounger with a jute tote and a pink mesh pouch — made for the moments between places',
    href: '/collections',
    focus: '75%',
    caption: 'Made for the moments between places',
    cta: 'Shop the collection',
  },
  {
    src: '/banners/IMG_5574.jpg.jpeg',
    alt: 'A heart-print insulated lunch bag surrounded by steel tiffins, a flask and fruit',
    href: '/category/lunch-bags',
    focus: '38%',
    caption: 'Carry your day beautifully',
    cta: 'Shop lunch bags',
  },
  {
    src: '/banners/IMG_5710.jpg.jpeg',
    alt: 'A quilted blush makeup case on a marble counter with perfume and brushes',
    href: '/category/makeup-pouch',
    focus: '78%',
    caption: 'Premium everyday makeup companion',
    cta: 'Shop makeup pouches',
  },
  {
    src: '/banners/IMG_5801.jpg.jpeg',
    alt: 'A cobalt blue quilted pouch on a gold tray with lipstick and perfume',
    href: '/sale',
    focus: '68%',
    caption: 'Carry beauty beautifully',
    cta: 'Shop the sale',
  },
];

const AUTOPLAY_MS = 5500;

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: dir === 'left' ? 'rotate(180deg)' : undefined }}
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function HeroBanners() {
  const railRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  /** Derive the active slide from scroll position — the rail is the source of truth. */
  const syncIndex = useCallback(() => {
    const el = railRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  const goTo = useCallback((i: number) => {
    const el = railRef.current;
    if (!el) return;
    const next = (i + SLIDES.length) % SLIDES.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    el.addEventListener('scroll', syncIndex, { passive: true });
    window.addEventListener('resize', syncIndex);
    return () => {
      el.removeEventListener('scroll', syncIndex);
      window.removeEventListener('resize', syncIndex);
    };
  }, [syncIndex]);

  // Autoplay, held while the visitor is hovering, focused inside, or touching.
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(() => {
      const el = railRef.current;
      if (!el) return;
      // Skip a beat while the tab is hidden so slides don't pile up.
      if (document.hidden) return;
      const current = Math.round(el.scrollLeft / el.clientWidth);
      el.scrollTo({ left: ((current + 1) % SLIDES.length) * el.clientWidth, behavior: 'smooth' });
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section
      aria-label="Featured collections"
      aria-roledescription="carousel"
      className="relative"
      style={{ background: '#FFF6EF' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={() => setPaused(true)}
    >
      <style>{`
        /* Mobile pans onto the product; from md the artwork is shown whole. */
        .hb-frame { aspect-ratio: 4 / 3; }
        .hb-img   { object-position: var(--hb-focus, center) center; }
        @media (min-width: 768px) {
          .hb-frame { aspect-ratio: 1856 / 576; }
          .hb-img   { object-position: center center; }
        }
        .hb-rail { scrollbar-width: none; }
        .hb-rail::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .hb-rail { scroll-behavior: auto; }
        }
      `}</style>

      <div
        ref={railRef}
        className="hb-rail flex overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {SLIDES.map((slide, i) => (
          <Link
            key={slide.src}
            href={slide.href}
            className="group relative flex-[0_0_100%] snap-start block"
            aria-label={slide.cta}
            aria-roledescription="slide"
            aria-hidden={i !== index}
            tabIndex={i === index ? undefined : -1}
          >
            <div className="hb-frame relative w-full overflow-hidden" style={{ background: '#FFE9DD' }}>
              <img
                src={slide.src}
                alt={slide.alt}
                className="hb-img absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                style={{ ['--hb-focus' as string]: slide.focus } as React.CSSProperties}
                // The first slide is the LCP element; the rest can wait.
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'low'}
                decoding="async"
                draggable={false}
                width={1856}
                height={576}
              />

              {/* Mobile-only caption. Hidden from md up, where the artwork
                  carries its own headline. */}
              <div className="md:hidden absolute inset-x-0 bottom-0 pt-16 pb-5 px-5"
                style={{ background: 'linear-gradient(to top, rgba(42,10,34,.82) 0%, rgba(42,10,34,.45) 45%, transparent 100%)' }}>
                <p className="font-serif text-white text-[19px] leading-snug font-bold max-w-[19ch]">
                  {slide.caption}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-bold" style={{ color: '#FFB37A' }}>
                  {slide.cta}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Arrows — pointer devices only, the rail itself is swipeable */}
      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Previous banner"
        className="hidden md:grid absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 place-items-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ background: 'rgba(255,246,239,.82)', color: '#2A0A22', backdropFilter: 'blur(8px)', boxShadow: '0 8px 22px -10px rgba(42,10,34,.5)' }}
      >
        <Chevron dir="left" />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Next banner"
        className="hidden md:grid absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 place-items-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ background: 'rgba(255,246,239,.82)', color: '#2A0A22', backdropFilter: 'blur(8px)', boxShadow: '0 8px 22px -10px rgba(42,10,34,.5)' }}
      >
        <Chevron dir="right" />
      </button>

      {/* Dots */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 md:bottom-6 flex items-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to banner ${i + 1}`}
            aria-current={i === index}
            className="h-2 rounded-full transition-all duration-400"
            style={{
              width: i === index ? 26 : 8,
              background: i === index
                ? 'linear-gradient(135deg,#FF8A3D,#E11D74)'
                : 'rgba(255,255,255,.6)',
              boxShadow: i === index ? 'none' : '0 1px 4px rgba(42,10,34,.35)',
            }}
          />
        ))}
      </div>
    </section>
  );
}
