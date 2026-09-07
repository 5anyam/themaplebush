'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Floating WhatsApp button.
 * The number comes from NEXT_PUBLIC_WHATSAPP_NUMBER (digits only, with country
 * code, e.g. 918076013164). If it is not set the button renders nothing rather
 * than linking somewhere wrong.
 */

const RAW_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
const NUMBER = RAW_NUMBER.replace(/\D/g, '');

// Checkout is the one place a floating button gets in the way of the form.
const HIDDEN_ON = ['/checkout'];

function WhatsAppGlyph({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.48-1.76-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.53.07-.8.37-.28.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.55.72.3 1.28.49 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.86 9.86 0 0 0 4.76 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.05-.2-.31a8.16 8.16 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.25 8.23z" />
    </svg>
  );
}

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // Nudge the label open once, a few seconds in, so it gets noticed without nagging.
  useEffect(() => {
    setMounted(true);
    const show = window.setTimeout(() => setOpen(true), 2600);
    const hide = window.setTimeout(() => setOpen(false), 8200);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  }, []);

  if (!NUMBER || !mounted) return null;
  if (HIDDEN_ON.some((p) => pathname?.startsWith(p))) return null;

  const message = encodeURIComponent(
    "Hi The Curio Shelf! I'd like to know more about a product on your website."
  );

  return (
    <a
      href={`https://wa.me/${NUMBER}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      data-no-loader
      className="group fixed z-[900] flex items-center gap-2.5 rounded-full pl-3.5 pr-3.5 py-3.5 text-white shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95"
      style={{
        right: 18,
        bottom: 'calc(18px + env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(140deg,#3ED47B,#25D366 55%,#12A150)',
        boxShadow: '0 16px 34px -12px rgba(18,161,80,.6), 0 4px 12px -4px rgba(42,10,34,.3)',
      }}
    >
      {/* Pulse ring uses the shared .pulse-ring keyframes from globals.css */}
      <span className="pulse-ring absolute inset-0 rounded-full pointer-events-none" aria-hidden />

      <WhatsAppGlyph />

      {/* Label expands on hover, and once on its own shortly after load */}
      <span
        className="overflow-hidden whitespace-nowrap text-[13.5px] font-bold transition-all duration-500 ease-[cubic-bezier(.16,.84,.44,1)] group-hover:max-w-[150px] group-hover:opacity-100 group-hover:ml-0"
        style={{
          maxWidth: open ? 150 : 0,
          opacity: open ? 1 : 0,
        }}
      >
        Chat with us
      </span>
    </a>
  );
}
