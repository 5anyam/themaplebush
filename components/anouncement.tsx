'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

interface AnnouncementBarProps {
  onClose?: () => void;
}

export default function AnnouncementBar({ onClose }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const isClosed = localStorage.getItem('announcementBarClosed');
    if (isClosed) setIsVisible(false);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('announcementBarClosed', 'true');
    onClose?.();
  };

  if (!isVisible) return null;

  const announcements = [
    {
      icon: '✦',
      text: (
        <span>
          Free shipping pan-India &nbsp;·&nbsp; <span className="font-bold text-white">COD available</span>
        </span>
      ),
    },
    {
      icon: '✦',
      text: (
        <span>
          <span className="font-bold text-white">7-day easy returns</span> on every order — no questions asked
        </span>
      ),
    },
    {
      icon: '✦',
      text: (
        <span>
          <span className="font-bold" style={{ color: '#FFE9DD' }}>Sale is live!</span>{' '}
          Up to 40% off on our best-loved carry goods.{' '}
          <Link href="/sale" className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity">
            Shop Now →
          </Link>
        </span>
      ),
    },
    {
      icon: '✦',
      text: (
        <span>
          <span className="font-bold text-white">Made in India</span> &nbsp;·&nbsp; Curated · Characterful · Carry-worthy
        </span>
      ),
    },
  ];

  const announcementContent = (
    <span className="inline-flex items-center gap-6 whitespace-nowrap">
      {announcements.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-2 px-6">
          <span className="text-sm flex-shrink-0">{item.icon}</span>
          <span className="text-xs sm:text-[13px] text-white/90 font-medium tracking-wide leading-tight">
            {item.text}
          </span>
          {i < announcements.length - 1 && (
            <span className="ml-6 text-gray-600 flex-shrink-0">•</span>
          )}
        </span>
      ))}
    </span>
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-[999] border-b border-white/10" style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}>
      <div className="relative flex items-center h-10 lg:h-11 overflow-hidden">

        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#FF4D6D] to-transparent z-10 pointer-events-none" />

        {/* Marquee */}
        <div className="w-full overflow-hidden">
          <div
            className="flex animate-marquee hover:[animation-play-state:paused] items-center"
            style={{ animationDuration: '30s' }}
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0">
                {announcementContent}
              </div>
            ))}
          </div>
        </div>

        {/* Right gradient fade */}
        <div className="absolute right-8 top-0 bottom-0 w-16 bg-gradient-to-l from-[#E11D74] to-transparent z-10 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Close announcement"
        >
          <X className="w-3.5 h-3.5 text-gray-400 hover:text-white transition-colors" />
        </button>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
