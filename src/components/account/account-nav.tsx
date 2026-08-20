'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const LINKS = [
  { href: '/account', label: 'Profile' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/wishlist', label: 'Wishlist' },
  { href: '/account/addresses', label: 'Addresses' },
  { href: '/account/settings', label: 'Settings' },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`block text-sm py-2 border-b border-ink/5 ${pathname === l.href ? 'text-clay font-medium' : 'text-ink/70'}`}
        >
          {l.label}
        </Link>
      ))}
      <button onClick={() => signOut({ callbackUrl: '/' })} className="block text-sm py-2 text-ink/50 hover:text-clay">
        Sign Out
      </button>
    </nav>
  );
}
