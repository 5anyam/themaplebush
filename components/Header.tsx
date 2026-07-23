'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from "next/link";
import CartIcon from "./CartIcon";
import { useIsMobile } from "../hooks/use-mobile";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../lib/AuthContext";

const QUICK_CHIPS = ['Pouches', 'Lunch Bags', 'Organisers', 'Laptop Bags', 'Cosmetic Bags'];

const NAV_LINKS = [
  { name: "Home",        to: "/" },
  { name: "Shop All",   to: "/collections" },
  { name: "Sale",        to: "/sale" },
  { name: "About",       to: "/about" },
  { name: "Contact",     to: "/contact" },
];

interface Suggestion {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  image: string | null;
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function UserIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
function CloseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SearchDropdown({
  query,
  suggestions,
  loading,
  onSelect,
  onViewAll,
}: {
  query: string;
  suggestions: Suggestion[];
  loading: boolean;
  onSelect: () => void;
  onViewAll: () => void;
}) {
  if (query.length < 2) return null;

  return (
    <div className="absolute top-full left-0 right-0 border border-[#F5DDD2] z-50 mt-1 overflow-hidden rounded-2xl" style={{ background: '#FAF0E8', boxShadow: '0 18px 50px -18px rgba(255,106,43,.32), 0 8px 24px -12px rgba(225,29,116,.18)' }}>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-[#2A0A22]/50">
          <div className="w-4 h-4 border-2 border-[#E11D74]/30 border-t-[#E11D74] rounded-full animate-spin" />
          Searching…
        </div>
      ) : suggestions.length === 0 ? (
        <div className="py-6 text-center text-sm text-[#2A0A22]/50">
          No results for &ldquo;{query}&rdquo;
        </div>
      ) : (
        <>
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] text-[#2A0A22]/40 uppercase tracking-wider font-semibold">Suggestions</p>
          </div>
          {suggestions.map((s) => {
            const isOnSale = Number(s.regular_price) > Number(s.price) && Number(s.regular_price) > 0;
            return (
              <Link
                key={s.id}
                href={`/product/${s.slug}`}
                onClick={onSelect}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FFE9DD] transition-colors group"
              >
                <div className="w-9 h-11 bg-[#FFE9DD] rounded-lg overflow-hidden flex-shrink-0">
                  {s.image
                    ? <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-[#FFE9DD]" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#2A0A22] truncate group-hover:text-[#E11D74] transition-colors leading-snug font-medium">
                    {s.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-[#2A0A22]">₹{Number(s.price).toLocaleString('en-IN')}</span>
                    {isOnSale && (
                      <span className="text-[10px] text-[#2A0A22]/40 line-through">₹{Number(s.regular_price).toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
          <div className="border-t border-[#FFE9DD]">
            <button
              onClick={onViewAll}
              className="w-full text-left px-4 py-3 text-xs font-semibold text-[#E11D74] hover:bg-[#FFE9DD] transition-colors"
            >
              See all results for &ldquo;{query}&rdquo; →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Header() {
  const location = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('announcementBarClosed') !== 'true';
  });

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedSearch = useDebounce(search, 320);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setShowDropdown(false);
    setSearch("");
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setShowUserMenu(false);
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowDropdown(false); setShowMobileSearch(false); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    setSuggestionsLoading(true);
    setShowDropdown(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSuggestions(debouncedSearch); }, [debouncedSearch, fetchSuggestions]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setShowDropdown(false);
    setShowMobileSearch(false);
    setTimeout(() => setSearch(""), 100);
  }

  function handleViewAll() {
    const q = search.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setShowDropdown(false);
  }

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push("/");
  };

  return (
    <>
      {/* Announcement bar */}
      {announcementVisible && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4 py-2 text-white text-[12px] font-semibold tracking-wide"
          style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
        >
          <span className="font-script text-base leading-none">✦</span>
          Free shipping pan-India · COD available · 7-day easy returns
          <button
            onClick={() => {
              setAnnouncementVisible(false);
              localStorage.setItem('announcementBarClosed', 'true');
            }}
            className="ml-3 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}

      {announcementVisible && <div className="h-9" />}

      {/* Main header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 nav-blur ${
          scrolled
            ? 'shadow-soft border-b border-[#F5DDD2]'
            : 'border-b border-[#F0D8CB]/60'
        }`}
        style={{ backdropFilter: 'blur(16px) saturate(160%)', background: scrolled ? 'rgba(250,240,232,0.96)' : 'rgba(250,240,232,0.88)' }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6">

          {/* ── MOBILE HEADER ── */}
          {isMobile ? (
            <div className="relative flex items-center justify-between h-14">
              {/* Left: hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="w-10 h-10 grid place-items-center rounded-full hover:bg-[#FFE9DD] transition-colors text-[#2A0A22] flex-shrink-0"
                aria-label="Open menu"
              >
                <MenuIcon />
              </button>

              {/* Center: logo — absolutely centered so it's always in the middle */}
              <Link href="/" className="absolute left-1/2 -translate-x-1/2 select-none">
                <img src="/logo.jpeg" alt="The Curio Shelf" className="h-10 w-auto object-contain" draggable={false} />
              </Link>

              {/* Right: search + cart */}
              <div className="flex items-center flex-shrink-0">
                <button
                  onClick={() => setShowMobileSearch(true)}
                  className="w-10 h-10 grid place-items-center rounded-full hover:bg-[#FFE9DD] transition-colors text-[#2A0A22]"
                  aria-label="Search"
                >
                  <SearchIcon size={19} />
                </button>
                <CartIcon />
              </div>
            </div>
          ) : (

          /* ── DESKTOP HEADER ── */
          <div className="flex items-center gap-4 h-[68px]">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 select-none">
              <img src="/logo.jpeg" alt="The Curio Shelf" className="h-12 w-auto object-contain" draggable={false} />
            </Link>

            {/* Nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-6">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`px-3.5 py-2 rounded-full text-[13.5px] font-semibold transition-all duration-200 ${
                    location === item.to
                      ? 'bg-[#FFE9DD] text-[#E11D74]'
                      : 'text-[#2A0A22]/70 hover:text-[#2A0A22] hover:bg-[#FFE9DD]/60'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search */}
            <div ref={desktopSearchRef} className="flex-1 relative max-w-sm ml-auto">
              <form
                onSubmit={handleSearch}
                className="flex items-center bg-white/70 border border-[#FFE9DD] hover:border-[#FF6A2B]/40 focus-within:border-[#E11D74]/60 focus-within:bg-white transition-all duration-200 rounded-full overflow-hidden"
              >
                <span className="ml-4 text-[#2A0A22]/40 flex-shrink-0">
                  <SearchIcon size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search bags, pouches…"
                  className="flex-1 bg-transparent py-2.5 px-3 text-sm text-[#2A0A22] focus:outline-none placeholder-[#2A0A22]/35"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => { if (search.length >= 2) setShowDropdown(true); }}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 mr-1 rounded-full text-white text-xs font-bold tracking-wide transition-transform hover:scale-105 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
                >
                  Go
                </button>
              </form>
              {showDropdown && (
                <SearchDropdown
                  query={search}
                  suggestions={suggestions}
                  loading={suggestionsLoading}
                  onSelect={() => { setShowDropdown(false); setSearch(""); }}
                  onViewAll={handleViewAll}
                />
              )}
            </div>

            {/* Auth + Cart */}
            <div className="flex items-center gap-1 ml-2">
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[#FFE9DD] transition-colors text-[#2A0A22] group"
                  >
                    <span className="w-7 h-7 rounded-full grid place-items-center text-white text-[12px] font-bold" style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #E11D74 100%)' }}>
                      {(user.first_name || user.username || 'U')[0].toUpperCase()}
                    </span>
                    <span className="text-[13px] font-semibold text-[#2A0A22] max-w-[90px] truncate">
                      {user.first_name || user.username}
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="w-10 h-10 grid place-items-center rounded-full hover:bg-[#FFE9DD] transition-colors text-[#2A0A22]"
                    aria-label="Sign in"
                  >
                    <UserIcon size={19} />
                  </Link>
                )}
                {showUserMenu && user && (
                  <div className="absolute right-0 top-full mt-2 w-56 border border-[#FFE9DD] shadow-lift py-2 z-50 rounded-2xl overflow-hidden" style={{ background: '#FAF0E8' }}>
                    <div className="px-4 py-3 border-b border-[#FFE9DD]">
                      <p className="text-[10px] text-[#2A0A22]/40 uppercase tracking-wider mb-0.5">Signed in as</p>
                      <p className="text-xs font-bold text-[#2A0A22] truncate">{user.first_name ? `${user.first_name} ${user.last_name}`.trim() : user.username}</p>
                      <p className="text-[10px] text-[#2A0A22]/40 truncate">{user.email}</p>
                    </div>
                    <Link href="/dashboard" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#2A0A22] hover:bg-[#FFE9DD] transition-colors font-medium">
                      My Orders
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#E11D74] hover:bg-[#FFE9DD] transition-colors border-t border-[#FFE9DD] font-medium">
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <CartIcon />
            </div>
          </div>
          )}
        </div>
      </header>

      {/* Mobile Side Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-[#2A0A22]/40 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-[82%] max-w-sm z-50 overflow-y-auto shadow-lift" style={{ background: '#FAF0E8' }}>
            <div className="flex items-center justify-between p-5 border-b border-[#FFE9DD]">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="select-none">
                <img src="/logo.jpeg" alt="The Curio Shelf" className="h-10 w-auto object-contain" draggable={false} />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 grid place-items-center rounded-full hover:bg-[#FFE9DD] transition-colors"
                aria-label="Close menu"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <nav className="p-5">
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.to}
                    href={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-3 px-3 rounded-xl text-[15px] font-medium transition-colors ${
                      location === item.to
                        ? 'bg-[#FFE9DD] text-[#E11D74]'
                        : 'text-[#2A0A22] hover:bg-[#FFE9DD]'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-[#FFE9DD] space-y-1">
                {user ? (
                  <>
                    <div className="px-3 pb-4 mb-2 border-b border-[#FFE9DD]">
                      <p className="text-[10px] text-[#2A0A22]/40 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-[#2A0A22] mt-0.5">{user.first_name || user.username}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-3 rounded-xl text-[14px] font-medium text-[#2A0A22] hover:bg-[#FFE9DD] transition-colors"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 py-3 px-3 rounded-xl text-[14px] font-medium text-[#E11D74] hover:bg-[#FFE9DD] transition-colors w-full text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 px-3 rounded-xl text-[14px] font-medium text-[#2A0A22] hover:bg-[#FFE9DD] transition-colors"
                  >
                    <UserIcon size={18} />
                    Sign In / Register
                  </Link>
                )}
                <a
                  href="mailto:hello@thecurioshelf.in"
                  className="flex items-center gap-3 py-3 px-3 rounded-xl text-[14px] font-medium text-[#2A0A22]/60 hover:bg-[#FFE9DD] transition-colors border-t border-[#FFE9DD] mt-1"
                >
                  hello@thecurioshelf.in
                </a>
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Mobile Search Modal */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: '#FAF0E8' }}>
          <div className="flex items-center px-4 pt-5 pb-4 gap-3 border-b border-[#FFE9DD] flex-shrink-0">
            <form onSubmit={handleSearch} className="flex-1 flex items-center border-b-2 border-[#E11D74] pb-2">
              <span className="text-[#2A0A22]/40 mr-3"><SearchIcon size={19} /></span>
              <input
                ref={mobileSearchInputRef}
                autoFocus
                type="text"
                placeholder="Search bags, pouches…"
                className="flex-1 text-base focus:outline-none placeholder-[#2A0A22]/35 bg-transparent font-light text-[#2A0A22]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
              />
              {suggestionsLoading && (
                <div className="w-4 h-4 border-2 border-[#E11D74]/30 border-t-[#E11D74] rounded-full animate-spin ml-2" />
              )}
            </form>
            <button
              onClick={() => { setShowMobileSearch(false); setSearch(""); }}
              className="w-9 h-9 grid place-items-center rounded-full hover:bg-[#FFE9DD] transition-colors flex-shrink-0"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {search.length >= 2 ? (
              <>
                {suggestionsLoading ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#2A0A22]/40">
                    <div className="w-5 h-5 border-2 border-[#E11D74]/30 border-t-[#E11D74] rounded-full animate-spin" />
                    Searching…
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="py-12 text-center text-sm text-[#2A0A22]/40">
                    No results for &ldquo;{search}&rdquo;
                  </div>
                ) : (
                  <>
                    <div className="px-4 pt-4 pb-2">
                      <p className="text-[10px] text-[#2A0A22]/40 uppercase tracking-wider font-semibold">Suggestions</p>
                    </div>
                    {suggestions.map((s) => {
                      const isOnSale = Number(s.regular_price) > Number(s.price) && Number(s.regular_price) > 0;
                      return (
                        <Link
                          key={s.id}
                          href={`/product/${s.slug}`}
                          onClick={() => { setShowMobileSearch(false); setSearch(""); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[#FFE9DD] transition-colors"
                        >
                          <div className="w-10 h-12 bg-[#FFE9DD] rounded-lg overflow-hidden flex-shrink-0">
                            {s.image && <img src={s.image} alt={s.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-[#2A0A22] font-medium truncate">{s.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold">₹{Number(s.price).toLocaleString('en-IN')}</span>
                              {isOnSale && <span className="text-[10px] text-[#2A0A22]/40 line-through">₹{Number(s.regular_price).toLocaleString('en-IN')}</span>}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    <div className="border-t border-[#FFE9DD] mt-1">
                      <button
                        onClick={handleViewAll}
                        className="w-full text-left px-4 py-3.5 text-sm font-semibold text-[#E11D74] hover:bg-[#FFE9DD] transition-colors"
                      >
                        See all results for &ldquo;{search}&rdquo; →
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#2A0A22]/40 mb-4">Popular</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => { router.push(`/search?q=${chip}`); setShowMobileSearch(false); setSearch(""); }}
                      className="px-4 py-2 border border-[#FFE9DD] text-xs font-semibold text-[#2A0A22] hover:bg-[#FFE9DD] hover:text-[#E11D74] transition-colors rounded-full"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
