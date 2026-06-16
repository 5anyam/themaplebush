'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from "next/link";
import CartIcon from "./CartIcon";
import { useIsMobile } from "../hooks/use-mobile";
import React, { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { Phone, UserCircle2 } from "lucide-react";
import AnnouncementBar from './anouncement';

const QUICK_SEARCH_CHIPS = ['Fiction', 'Non-Fiction', "Children's", 'Self-Help', 'Academic'];

const mobileNavItems = [
  { name: "Home",         to: "/" },
  { name: "All Books",    to: "/collections" },
  { name: "Sale & Deals", to: "/sale" },
  { name: "About Us",     to: "/about" },
  { name: "Contact",      to: "/contact" },
];

export default function Header() {
  const location = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('announcementBarClosed') !== 'true';
  });

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const email = localStorage.getItem("userEmail");
    setIsAuthenticated(auth === "true");
    setUserEmail(email || "");
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node))
        setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setShowMobileSearch(false);
    setTimeout(() => setSearch(""), 100);
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    router.push("/");
  };

  const headerTop = announcementVisible ? 'top-10 lg:top-11' : 'top-0';

  return (
    <>
      <AnnouncementBar onClose={() => setAnnouncementVisible(false)} />
      {announcementVisible && <div className="h-10 lg:h-11" />}

      <header className={`sticky ${headerTop} z-40 bg-white border-b border-gray-200 font-sans`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 md:gap-5 h-16 md:h-[72px]">

            {/* Mobile hamburger */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-gray-800 flex-shrink-0 p-1"
                aria-label="Open menu"
              >
                <HiOutlineMenuAlt3 className="text-2xl" />
              </button>
            )}

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <img src="/logo.jpg" alt="KD Book Bazaar" className="h-9 md:h-11 w-auto" />
            </Link>

            {/* Search — always visible on desktop */}
            {!isMobile && (
              <form
                onSubmit={handleSearch}
                className="flex-1 flex items-center bg-gray-50 border border-gray-200 hover:border-gray-400 focus-within:border-[#ff3131] focus-within:bg-white transition-all duration-200"
              >
                <FiSearch className="ml-4 text-gray-400 w-4 h-4 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search books, authors, genres..."
                  className="flex-1 bg-transparent py-3 px-3 text-sm text-gray-800 focus:outline-none placeholder-gray-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-[#ff3131] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#cc0000] transition-colors flex-shrink-0"
                >
                  Search
                </button>
              </form>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-2 md:gap-3 ml-auto md:ml-0">

              {/* Mobile search icon */}
              {isMobile && (
                <button
                  onClick={() => setShowMobileSearch(true)}
                  className="p-2 text-gray-800"
                  aria-label="Search"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              )}

              {/* Auth — desktop */}
              {!isMobile && (
                <div className="relative" ref={userMenuRef}>
                  {isAuthenticated ? (
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="p-2 text-gray-600 hover:text-[#ff3131] transition-colors"
                    >
                      <UserCircle2 className="w-5 h-5 stroke-[1.5]" />
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-600 hover:text-[#ff3131] transition-colors whitespace-nowrap"
                    >
                      Sign In
                    </Link>
                  )}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 shadow-xl py-2 z-50">
                      {userEmail && (
                        <div className="px-5 py-2 border-b border-gray-100 mb-1 bg-gray-50">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Signed in as</p>
                          <p className="text-xs font-medium text-gray-800 truncate">{userEmail}</p>
                        </div>
                      )}
                      <Link href="/account" className="block px-5 py-2 text-xs text-gray-700 hover:bg-gray-50">
                        My Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-2 text-xs text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              <CartIcon />
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Side Drawer ──────────────────────────────────────── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-[300px] bg-white z-50 overflow-y-auto shadow-2xl">
            <div className="p-5 bg-[#ff3131] flex items-center justify-between">
              <span className="text-white font-bold text-base tracking-wide">KD Book Bazaar</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <HiOutlineX className="text-xl text-white" />
              </button>
            </div>
            <nav className="p-5">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.to}
                  href={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3.5 text-sm font-medium border-b border-gray-100 ${
                    location === item.to ? 'text-[#ff3131]' : 'text-gray-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
                <Link
                  href="/account"
                  className="flex items-center gap-3 text-xs tracking-widest text-gray-600 uppercase"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircle2 className="w-5 h-5 stroke-[1.5] text-[#ff3131]" />
                  My Account
                </Link>
                <a
                  href="tel:+919911636888"
                  className="flex items-center gap-3 text-xs tracking-widest text-gray-600 uppercase"
                >
                  <Phone className="w-5 h-5 stroke-[1.5] text-[#ff3131]" />
                  Help Center
                </a>
              </div>
            </nav>
          </div>
        </>
      )}

      {/* ── Mobile Search Modal ─────────────────────────────────────── */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-white z-[60] p-6 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff3131]">Search Books</span>
            <button onClick={() => setShowMobileSearch(false)} aria-label="Close search">
              <HiOutlineX className="text-2xl text-gray-800" />
            </button>
          </div>
          <form onSubmit={handleSearch}>
            <div className="flex items-center border-b-2 border-[#ff3131] pb-3">
              <FiSearch className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search books, authors..."
                className="flex-1 text-base focus:outline-none placeholder-gray-400 font-light"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
          <div className="mt-7">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">Popular</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => { router.push(`/search?q=${chip}`); setShowMobileSearch(false); }}
                  className="px-4 py-2 border border-gray-200 text-xs font-medium text-gray-700 hover:border-[#ff3131] hover:text-[#ff3131] transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
