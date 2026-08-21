'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/components/cart/cart-context';
import { useSession } from 'next-auth/react';
import { CartDrawer } from '@/components/cart/cart-drawer';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/shop?filter=new', label: 'New Arrivals' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { itemCount, setIsOpen } = useCart();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-ink/10">
        <div className="max-w-8xl mx-auto section-padding flex items-center justify-between h-20">
          <button
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="font-display text-2xl tracking-wide">
            balora <span className="text-clay italic">bags</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-9">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide uppercase hover:text-clay transition-colors ${
                  pathname === link.href ? 'text-clay' : 'text-ink'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 md:gap-5">
            <button aria-label="Search" onClick={() => setSearchOpen((v) => !v)}>
              <Search size={20} />
            </button>
            <Link href={session ? '/account' : '/account/login'} aria-label="Account">
              <User size={20} />
            </Link>
            <Link href="/account/wishlist" aria-label="Wishlist" className="hidden sm:block">
              <Heart size={20} />
            </Link>
            <button aria-label="Shopping bag" className="relative" onClick={() => setIsOpen(true)}>
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-clay text-cream text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={submitSearch} className="border-t border-ink/10 bg-paper section-padding py-4">
            <div className="max-w-xl mx-auto flex gap-3">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for bags..."
                className="input-field"
              />
              <button type="submit" className="btn-primary">
                Search
              </button>
            </div>
          </form>
        )}

        {menuOpen && (
          <div className="fixed inset-0 z-50 bg-ink/40" onClick={() => setMenuOpen(false)}>
            <div
              className="absolute left-0 top-0 h-full w-72 bg-cream p-6 flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="self-end">
                <X size={22} />
              </button>
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-display"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
