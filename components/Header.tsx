'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from "next/link";
import CartIcon from "./CartIcon";
import { useIsMobile } from "../hooks/use-mobile";
import React, { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { BiChevronDown } from "react-icons/bi";
import { Phone, UserCircle2 } from "lucide-react";
import AnnouncementBar from './anouncement';

interface NavItem {
  name: string;
  to: string;
  submenu?: { name: string; to: string }[];
}

const navItems: NavItem[] = [
  { name: "HOME", to: "/" },
  { name: "HOME DECOR", to: "/category/home-decor" },
  { name: "FASHION", to: "/category/fashion" },
  { name: "HOME & KITCHEN", to: "/category/home-kitchen" },
  { name: "ELECTRONICS", to: "/category/mobile-electronics-accessories" },
  {
    name: "MORE",
    to: "#",
    submenu: [
      { name: "Bike & Car Accessories",  to: "/category/bike-car-accessories" },
      { name: "Sports & Outdoors",       to: "/category/sports-outdoors" },
      { name: "Toys & Games",            to: "/category/toys-games" },
      { name: "Office Products",         to: "/category/office-products" },
    ],
  },
  { name: "DEALS", to: "/sale" },
];

const QUICK_SEARCH_CHIPS = ['Home Decor', 'Fashion', 'Electronics', 'Kitchen'];

export default function Header() {
  const location = usePathname();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [showDesktopSearch, setShowDesktopSearch] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [mobileActiveSubmenu, setMobileActiveSubmenu] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [announcementVisible, setAnnouncementVisible] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('announcementBarClosed') !== 'true';
  });

  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const email = localStorage.getItem("userEmail");
    setIsAuthenticated(auth === "true");
    setUserEmail(email || "");
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setActiveSubmenu(null);
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
    setShowDesktopSearch(false);
    setShowMobileSearch(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setTimeout(() => setSearch(""), 100);
  }

  const handleLogout = async () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    router.push("/");
  };

  const headerTop = announcementVisible ? 'top-10 lg:top-11' : 'top-0';
  const mobileDrawerTop = announcementVisible ? 'top-10' : 'top-0';

  return (
    <>
      <AnnouncementBar onClose={() => setAnnouncementVisible(false)} />
      {announcementVisible && <div className="h-10 lg:h-11" />}

      <header className={`sticky ${headerTop} z-40 bg-white border-b border-gray-200 transition-all duration-300 font-sans`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* LEFT - Search (Desktop) & Hamburger (Mobile) */}
            <div className="flex items-center">
              {isMobile ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-800">
                    <HiOutlineMenuAlt3 className="text-2xl" />
                  </button>
                  <button onClick={() => setShowMobileSearch(true)} className="p-2 text-gray-800">
                    <FiSearch className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowDesktopSearch(!showDesktopSearch)} className="p-2 text-gray-700 hover:text-[#ff3131] transition-colors">
                  <FiSearch className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* CENTER — Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <img src="/logo.jpg" alt="KD Book Bazaar" className="h-10 md:h-12 w-auto" />
            </Link>

            {/* RIGHT - Auth & Cart */}
            <div className="flex items-center gap-1 md:gap-4">
              {!isMobile && (
                <div className="relative" ref={userMenuRef}>
                  {isAuthenticated ? (
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="p-2 text-gray-700 hover:text-[#ff3131] transition-colors">
                      <UserCircle2 className="w-5 h-5 stroke-[1.5]" />
                    </button>
                  ) : (
                    <Link href="/login" className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-700 hover:text-[#ff3131] transition-colors border-b border-transparent hover:border-[#ff3131] pb-0.5">
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
                      <Link href="/account" className="block px-5 py-2 text-xs text-gray-700 hover:bg-gray-50">My Account</Link>
                      <button onClick={handleLogout} className="w-full text-left px-5 py-2 text-xs text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1">Logout</button>
                    </div>
                  )}
                </div>
              )}
              <CartIcon />
            </div>
          </div>
        </div>

        {/* Desktop Search Bar */}
        {!isMobile && showDesktopSearch && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-4 animate-in slide-in-from-top duration-300">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for products..."
                className="w-full bg-transparent border-b-2 border-[#ff3131] py-2 text-sm text-gray-800 focus:outline-none placeholder-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <button type="submit" className="ml-4 text-xs font-bold uppercase tracking-widest text-[#ff3131]">Search</button>
              <button type="button" onClick={() => setShowDesktopSearch(false)} className="ml-6 text-gray-400 hover:text-gray-700">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden lg:block border-t border-gray-100" ref={menuRef}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2">
              {navItems.map((item) => (
                <div key={item.name} className="relative group"
                     onMouseEnter={() => setActiveSubmenu(item.name)}
                     onMouseLeave={() => setActiveSubmenu(null)}>

                  <Link href={item.to} className={`block px-6 py-4 text-[11px] font-semibold tracking-[0.2em] transition-all duration-200 ${
                    item.name === "DEALS"
                      ? "text-[#ff3131]"
                      : location === item.to
                        ? "text-[#ff3131]"
                        : "text-gray-700 hover:text-[#ff3131]"
                  }`}>
                    {item.name}
                    {item.submenu && <BiChevronDown className="inline-block ml-1 text-sm group-hover:rotate-180 transition-transform" />}
                  </Link>

                  {item.submenu && activeSubmenu === item.name && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white border border-gray-200 min-w-[240px] shadow-xl py-2 z-50">
                      {item.submenu.map((sub) => (
                        <Link key={sub.name} href={sub.to} className="block px-6 py-2.5 text-[11px] tracking-wider text-gray-600 hover:text-[#ff3131] hover:bg-red-50 transition-colors">
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className={`fixed ${mobileDrawerTop} left-0 h-full w-full max-w-[320px] bg-white z-50 overflow-y-auto transition-all duration-300`}>

            <div className="p-6 bg-[#ff3131] flex items-center justify-between">
              <span className="text-white font-bold text-lg tracking-wide">KD Book Bazaar</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 border border-white/30">
                <HiOutlineX className="text-xl text-white" />
              </button>
            </div>

            <nav className="p-6">
              {navItems.map((item) => (
                <div key={item.name} className="mb-1">
                  <div className="flex items-center justify-between border-b border-gray-100 py-4">
                    <Link href={item.to} className={`text-sm font-semibold tracking-widest ${item.name === 'DEALS' ? 'text-[#ff3131]' : 'text-gray-800'}`} onClick={() => setMobileMenuOpen(false)}>
                      {item.name}
                    </Link>
                    {item.submenu && (
                      <button onClick={() => setMobileActiveSubmenu(mobileActiveSubmenu === item.name ? null : item.name)}>
                        <BiChevronDown className={`text-xl text-gray-500 transition-transform ${mobileActiveSubmenu === item.name ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  {item.submenu && mobileActiveSubmenu === item.name && (
                    <div className="bg-red-50 px-4 py-2 flex flex-col gap-3 animate-in fade-in duration-300">
                      {item.submenu.map((sub) => (
                        <Link key={sub.name} href={sub.to} className="text-xs text-gray-600 py-1 tracking-wide hover:text-[#ff3131] transition-colors" onClick={() => setMobileMenuOpen(false)}>
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-10 space-y-5 border-t border-gray-100 pt-6">
                <Link href="/account" className="flex items-center gap-3 text-xs tracking-widest text-gray-700 uppercase" onClick={() => setMobileMenuOpen(false)}>
                  <UserCircle2 className="w-5 h-5 stroke-[1.5] text-[#ff3131]" /> My Account
                </Link>
                <a href="tel:+919911636888" className="flex items-center gap-3 text-xs tracking-widest text-gray-700 uppercase">
                  <Phone className="w-5 h-5 stroke-[1.5] text-[#ff3131]" /> Help Center
                </a>
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Mobile Search Modal */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-white z-[60] p-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff3131]">Search</span>
            <button onClick={() => setShowMobileSearch(false)}>
              <HiOutlineX className="text-2xl text-gray-800" />
            </button>
          </div>
          <form onSubmit={handleSearch}>
            <input
              autoFocus
              type="text"
              placeholder="What are you looking for?"
              className="w-full text-lg border-b-2 border-[#ff3131] pb-4 focus:outline-none placeholder-gray-400 font-light"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCH_CHIPS.map(chip => (
                <button key={chip} onClick={() => {router.push(`/search?q=${chip}`); setShowMobileSearch(false)}} className="px-4 py-2 border border-gray-200 text-xs font-medium text-gray-700 hover:border-[#ff3131] hover:text-[#ff3131] transition-colors">
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
