import Link from "next/link";

const SHOP_LINKS = [
  { name: "All Products",      to: "/collections" },
  { name: "Cosmetic Pouches",  to: "/category/cosmetic-pouches" },
  { name: "Lunch Bags",        to: "/category/lunch-bags" },
  { name: "Organisers",        to: "/category/organisers" },
  { name: "Laptop Bags",       to: "/category/laptop-bags" },
  { name: "Travel Bags",       to: "/category/travel-bags" },
  { name: "Sale & Deals",      to: "/sale" },
];

const HELP_LINKS = [
  { name: "My Account",           to: "/dashboard" },
  { name: "Returns & Refunds",    to: "/returns-and-refunds-policy" },
  { name: "Shipping Policy",      to: "/shipping-policy" },
  { name: "Cancellation Policy",  to: "/cancellation-policy" },
  { name: "Privacy Policy",       to: "/privacy-policy" },
  { name: "Terms & Conditions",   to: "/terms-and-conditions" },
  { name: "Contact Us",           to: "/contact" },
];

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function PinterestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden" style={{ background: '#2A0A22', color: '#FFE9DD' }}>
      {/* Subtle mesh glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FF6A2B 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #E11D74 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-12 gap-10">

        {/* Brand column */}
        <div className="md:col-span-4">
          <Link href="/">
            <img src="/logo.jpg" alt="The Curio Shelf" className="h-10 w-auto" />
          </Link>
          <p className="text-[#FFE9DD]/65 text-[13.5px] mt-4 max-w-xs leading-relaxed font-sans">
            A shelf of curiosities you actually use. Curated, characterful carry goods — premium, warm, and proudly made in India.
          </p>
          <div className="flex gap-3 mt-5">
            <a
              href="https://instagram.com/thecurioshelf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition-colors text-[#FFE9DD]"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://pinterest.com/thecurioshelf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition-colors text-[#FFE9DD]"
              aria-label="Pinterest"
            >
              <PinterestIcon />
            </a>
            <a
              href="https://youtube.com/@thecurioshelf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition-colors text-[#FFE9DD]"
              aria-label="YouTube"
            >
              <YoutubeIcon />
            </a>
          </div>
        </div>

        {/* Shop links */}
        <div className="md:col-span-3">
          <h4 className="font-serif text-[15px] font-semibold mb-4 text-white">Shop</h4>
          <ul className="space-y-2.5">
            {SHOP_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  href={link.to}
                  className="text-[13.5px] text-[#FFE9DD]/60 hover:text-[#FF8A4C] transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help links */}
        <div className="md:col-span-2">
          <h4 className="font-serif text-[15px] font-semibold mb-4 text-white">Support</h4>
          <ul className="space-y-2.5">
            {HELP_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  href={link.to}
                  className="text-[13.5px] text-[#FFE9DD]/60 hover:text-[#FF8A4C] transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="md:col-span-3">
          <h4 className="font-serif text-[15px] font-semibold mb-3 text-white">Carry the news</h4>
          <p className="text-[#FFE9DD]/60 text-[13.5px] mb-4 leading-relaxed">
            Little drops, big magic. Get first dibs on new arrivals.
          </p>
          <NewsletterForm />
          <p className="text-[#FFE9DD]/40 text-[12px] mt-4">
            📍 Delhi · India base &nbsp;·&nbsp; ✉ hello@thecurioshelf.in
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-[#FFE9DD]/45">
          <span>© {new Date().getFullYear()} The Curio Shelf · Made in India 🇮🇳</span>
          <span className="flex items-center gap-2">
            {['UPI', 'VISA', 'RuPay', 'COD'].map((b) => (
              <span key={b} className="px-2.5 py-1 rounded-md bg-white/10 font-semibold tracking-wide text-[#FFE9DD]/60">
                {b}
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  return (
    <div className="flex gap-2">
      <input
        type="email"
        placeholder="you@email.com"
        className="flex-1 bg-white/10 rounded-full px-4 py-2.5 text-[13.5px] outline-none placeholder-[#FFE9DD]/40 focus:bg-white/15 text-[#FFE9DD] border border-white/10 focus:border-white/20 transition-colors"
      />
      <button
        className="px-4 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #FF8A3D 0%, #FF4D6D 50%, #E11D74 100%)' }}
      >
        →
      </button>
    </div>
  );
}
