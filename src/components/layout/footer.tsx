import Link from 'next/link';
import { Instagram, Music2 } from 'lucide-react';

const SHOP_LINKS = [
  { href: '/shop', label: 'All Bags' },
  { href: '/shop?category=handbags', label: 'Handbags' },
  { href: '/shop?category=clutch-bags', label: 'Clutch Bags' },
  { href: '/shop?category=tote-bags', label: 'Tote Bags' },
];

const HELP_LINKS = [
  { href: '/faq', label: 'FAQ' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/policies/returns', label: 'Returns & Exchanges' },
  { href: '/policies/shipping', label: 'Shipping' },
  { href: '/policies/privacy', label: 'Privacy Policy' },
  { href: '/policies/terms', label: 'Terms & Conditions' },
];

export function Footer() {
  return (
    <footer className="bg-forest-dark text-cream mt-24">
      <div className="max-w-8xl mx-auto section-padding py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <p className="font-display text-2xl mb-3">balora bags</p>
          <p className="text-sm text-cream/70 leading-relaxed">
            Handmade crochet bags, inspired by balance. Made with love in Accra, Ghana.
          </p>
          <div className="flex gap-4 mt-5">
            <a href="https://instagram.com/balora_bags" target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://tiktok.com/@balora.bags" target="_blank" rel="noreferrer" aria-label="TikTok">
              <Music2 size={18} />
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow text-cream/60 mb-4">Shop</p>
          <ul className="space-y-2 text-sm">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-clay-light transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-cream/60 mb-4">Help</p>
          <ul className="space-y-2 text-sm">
            {HELP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-clay-light transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-cream/60 mb-4">Stay updated</p>
          <p className="text-sm text-cream/70 mb-4">Be first to hear about our next drop.</p>
          <form className="flex" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="Email address"
              className="bg-transparent border border-cream/30 px-3 py-2 text-sm flex-1 placeholder:text-cream/40 focus:outline-none focus:border-clay-light"
            />
            <button type="submit" className="border border-l-0 border-cream/30 px-4 text-sm uppercase hover:bg-cream/10">
              Join
            </button>
          </form>
          <p className="text-xs text-cream/50 mt-6">WhatsApp: +233 540 784 922</p>
          <p className="text-xs text-cream/50">Email: balora.bagss@gmail.com</p>
        </div>
      </div>
      <div className="thread-divider" />
      <p className="text-center text-xs text-cream/50 py-6">
        © {new Date().getFullYear()} Balora Bags · Accra, Ghana · All rights reserved
      </p>
    </footer>
  );
}
