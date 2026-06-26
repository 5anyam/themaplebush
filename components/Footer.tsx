import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Youtube, Facebook } from "lucide-react";

const shopCategories = [
  { name: "Fiction",            to: "/category/fiction" },
  { name: "Non-Fiction",        to: "/category/non-fiction" },
  { name: "Children's Books",   to: "/category/childrens-books" },
  { name: "Academic & Textbooks", to: "/category/academic" },
  { name: "Self-Help",          to: "/category/self-help" },
  { name: "Biography",          to: "/category/biography" },
  { name: "Science & Tech",     to: "/category/science-technology" },
  { name: "Comics & Manga",     to: "/category/comics-manga" },
];

const helpLinks = [
  { name: "My Account",        to: "/account" },
  { name: "Track My Order",    to: "/track-order" },
  { name: "Returns & Refunds", to: "/returns-and-refunds-policy" },
  { name: "Shipping Policy",   to: "/shipping-policy" },
  { name: "Privacy Policy",    to: "/privacy-policy" },
  { name: "Terms of Service",  to: "/terms-and-conditions" },
  { name: "Contact Us",        to: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-white text-gray-600 font-sans border-t border-gray-200">

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="flex flex-col gap-5">
          <Link href="/">
            <img src="/logo.jpg" alt="KD Book Bazaar" className="h-10 w-auto" />
          </Link>
          <p className="text-[12px] leading-relaxed tracking-wide text-gray-500">
            India&apos;s favourite online bookstore — thousands of titles across every genre, delivered fast at the best prices.
          </p>
          <div className="flex gap-4 mt-1">
            <a href="https://instagram.com/kdbookbazaar" target="_blank" rel="noopener noreferrer"
               className="text-gray-400 hover:text-[#ff3131] transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://youtube.com/@kdbookbazaar" target="_blank" rel="noopener noreferrer"
               className="text-gray-400 hover:text-[#ff3131] transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="https://facebook.com/kdbookbazaar" target="_blank" rel="noopener noreferrer"
               className="text-gray-400 hover:text-[#ff3131] transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Shop by Genre */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900 mb-5">
            Shop by Genre
          </h4>
          <ul className="flex flex-col gap-3">
            {shopCategories.map((cat) => (
              <li key={cat.to}>
                <Link
                  href={cat.to}
                  className="text-[12px] tracking-wide text-gray-500 hover:text-[#ff3131] transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help & Info */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900 mb-5">
            Help & Info
          </h4>
          <ul className="flex flex-col gap-3">
            {helpLinks.map((link) => (
              <li key={link.to}>
                <Link
                  href={link.to}
                  className="text-[12px] tracking-wide text-gray-500 hover:text-[#ff3131] transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-900 mb-5">
            Contact Us
          </h4>
          <ul className="flex flex-col gap-4">
            <li>
              <a href="tel:+919911636888"
                 className="flex items-start gap-3 text-[12px] tracking-wide text-gray-500 hover:text-[#ff3131] transition-colors">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                +91 99116 36888
              </a>
            </li>
            <li>
              <a href="mailto:support@kdbookbazaar.com"
                 className="flex items-start gap-3 text-[12px] tracking-wide text-gray-500 hover:text-[#ff3131] transition-colors">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                support@kdbookbazaar.com
              </a>
            </li>
            <li className="flex items-start gap-3 text-[12px] tracking-wide text-gray-500">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              India
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-gray-200" />

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <p className="text-[11px] tracking-widest text-gray-400">
            © {new Date().getFullYear()} KD Book Bazaar. All rights reserved.
          </p>
          <span className="hidden sm:block text-gray-300">·</span>
          <p className="text-[11px] text-gray-400">
            Developed by{' '}
            <a
              href="https://www.proshala.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff3131] hover:underline font-medium"
            >
              Proshala
            </a>
          </p>
        </div>
        <div className="flex items-center gap-4">
          {["Visa", "Mastercard", "UPI", "Razorpay"].map((method) => (
            <span key={method}
              className="text-[10px] uppercase tracking-widest text-gray-400 border border-gray-200 px-2 py-1">
              {method}
            </span>
          ))}
        </div>
      </div>

    </footer>
  );
}
