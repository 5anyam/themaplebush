'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible]   = useState(false);
  const [completing, setCompleting] = useState(false);
  const tickRef    = useRef<NodeJS.Timeout | null>(null);
  const hideRef    = useRef<NodeJS.Timeout | null>(null);
  const startedRef = useRef(false);
  const pathname   = usePathname();
  const prevPath   = useRef(pathname);

  const start = useCallback(() => {
    if (hideRef.current) clearTimeout(hideRef.current);
    if (tickRef.current) clearTimeout(tickRef.current);

    startedRef.current = true;
    setCompleting(false);
    setProgress(0);
    setVisible(true);

    let current = 0;
    const tick = () => {
      current += current < 40 ? 10 : current < 70 ? 5 : current < 85 ? 1.5 : 0.4;
      if (current > 85) current = 85;
      setProgress(current);
      tickRef.current = setTimeout(tick, 100);
    };
    tick();
  }, []);

  const finish = useCallback(() => {
    if (!startedRef.current) return;
    if (tickRef.current) clearTimeout(tickRef.current);
    startedRef.current = false;
    setCompleting(true);
    setProgress(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setCompleting(false);
      setProgress(0);
    }, 500);
  }, []);

  // Link click → start
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('[data-no-loader]') ||
        target.closest('.no-loader') ||
        target.closest('.submenu')
      ) return;

      const link = target.closest('a');
      if (
        link &&
        link.hostname === window.location.hostname &&
        link.href !== window.location.href
      ) start();
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [start]);

  // Pathname change → finish
  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    finish();
  }, [pathname, finish]);

  useEffect(() => () => {
    if (tickRef.current) clearTimeout(tickRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[4px]" style={{ pointerEvents: 'none' }}>
      <div
        style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)',
          transition: completing ? 'width 300ms ease-out' : 'width 100ms linear',
          boxShadow: '0 0 12px rgba(225,29,116,.7), 0 0 4px rgba(255,106,43,.5)',
        }}
      />
    </div>
  );
}
