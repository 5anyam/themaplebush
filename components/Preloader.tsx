'use client';

import { useEffect, useState } from 'react';

/**
 * Full-screen branded preloader shown on the first paint of a session.
 * Route-to-route navigation keeps using the thin top progress bar in <Loader />,
 * so this only ever appears once and never interrupts browsing.
 */

const SESSION_KEY = 'tcs_preloaded';

export default function Preloader() {
  // Assume "already seen" until we've checked, so a returning visitor never
  // gets a flash of the overlay before the effect runs.
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let seen = true;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      // Private mode / blocked storage — treat it as a fresh visit.
      seen = false;
    }
    if (seen) return;

    setShow(true);
    document.body.style.overflow = 'hidden';

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Creep towards 90% while the page settles, then finish on window load.
    let current = 0;
    const tick = window.setInterval(() => {
      current += current < 50 ? 9 : current < 75 ? 4 : 1.4;
      if (current > 90) current = 90;
      setProgress(current);
    }, reduce ? 40 : 90);

    const finish = () => {
      window.clearInterval(tick);
      setProgress(100);
      window.setTimeout(() => setLeaving(true), reduce ? 0 : 260);
      window.setTimeout(() => {
        setShow(false);
        document.body.style.overflow = '';
        try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
      }, reduce ? 120 : 900);
    };

    if (document.readyState === 'complete') {
      window.setTimeout(finish, reduce ? 0 : 450);
    } else {
      window.addEventListener('load', finish, { once: true });
    }

    // Hard ceiling so a hanging asset can never trap the visitor behind the overlay.
    const bail = window.setTimeout(finish, 5000);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(bail);
      window.removeEventListener('load', finish);
      document.body.style.overflow = '';
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center px-6"
      style={{
        background: '#FFF6EF',
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.04)' : 'none',
        transition: 'opacity .62s cubic-bezier(.16,.84,.44,1), transform .62s cubic-bezier(.16,.84,.44,1)',
        pointerEvents: leaving ? 'none' : 'auto',
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading The Curio Shelf"
    >
      <style>{`
        @keyframes tcsBlob  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(6%,-7%) scale(1.16)} }
        @keyframes tcsRise  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tcsDraw  { to { stroke-dashoffset: 0 } }
        @keyframes tcsFloat { 0%,100%{transform:translateY(0) rotate(var(--tr,0deg))} 50%{transform:translateY(-9px) rotate(var(--tr,0deg))} }
        .tcs-rise  { animation: tcsRise .7s cubic-bezier(.16,.84,.44,1) both; }
        .tcs-draw  { stroke-dasharray: 260; stroke-dashoffset: 260; animation: tcsDraw 1.15s .35s cubic-bezier(.4,0,.2,1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .tcs-rise, .tcs-draw { animation: none !important; }
          .tcs-draw { stroke-dashoffset: 0 !important; }
        }
      `}</style>

      {/* Ambient brand blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute rounded-full" style={{ width: '60%', height: '60%', left: '-14%', top: '-16%', background: 'radial-gradient(closest-side,rgba(255,178,102,.5),transparent)', filter: 'blur(56px)', animation: 'tcsBlob 14s ease-in-out infinite' }} />
        <div className="absolute rounded-full" style={{ width: '55%', height: '58%', right: '-14%', bottom: '-12%', background: 'radial-gradient(closest-side,rgba(225,29,116,.34),transparent)', filter: 'blur(56px)', animation: 'tcsBlob 18s ease-in-out infinite', animationDelay: '-7s' }} />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Three little shelf items settling into place */}
        <div className="flex items-end gap-2.5 mb-7" aria-hidden>
          {[
            { w: 30, h: 38, d: '0s',   r: '-4deg' },
            { w: 38, h: 50, d: '.5s',  r: '2deg'  },
            { w: 28, h: 34, d: '1s',   r: '-2deg' },
          ].map((b, i) => (
            <span
              key={i}
              className="block rounded-[5px]"
              style={{
                width: b.w,
                height: b.h,
                background: 'linear-gradient(150deg,#FF8A3D,#FF4D6D 55%,#E11D74)',
                boxShadow: '0 12px 22px -12px rgba(176,19,97,.65), inset 0 0 0 2px rgba(255,255,255,.5)',
                ['--tr' as string]: b.r,
                // Rise in once, then keep bobbing gently.
                animation: `tcsRise .7s ${i * 0.11}s cubic-bezier(.16,.84,.44,1) both, tcsFloat 3.4s ${b.d} ease-in-out infinite`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* The shelf they sit on */}
        <svg width="150" height="12" viewBox="0 0 150 12" fill="none" className="mb-6" aria-hidden>
          <path className="tcs-draw" d="M4 5 C40 2, 110 2, 146 5" stroke="#2A0A22" strokeWidth="3" strokeLinecap="round" opacity=".85" />
        </svg>

        <p className="tcs-rise font-serif text-[22px] font-black tracking-tight mb-1" style={{ color: '#2A0A22', animationDelay: '.2s' }}>
          The Curio Shelf
        </p>
        <p className="tcs-rise font-script text-[19px] mb-7" style={{ color: '#E11D74', animationDelay: '.3s' }}>
          carry a little wonder
        </p>

        {/* Progress */}
        <div className="w-[170px] h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(42,10,34,.1)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg,#FF8A3D,#FF4D6D 50%,#E11D74)',
              transition: 'width .3s cubic-bezier(.16,.84,.44,1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
