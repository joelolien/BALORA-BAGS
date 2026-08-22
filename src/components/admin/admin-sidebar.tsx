'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Settings, FolderTree,
} from 'lucide-react';

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/promo-codes', label: 'Promo Codes', icon: Tag },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="bg-forest-dark text-cream p-6 flex flex-col">
      <Link href="/" className="font-display text-xl mb-10">
        balora <span className="text-clay-light italic">admin</span>
      </Link>
      <nav className="space-y-1 flex-1">
        {LINKS.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors ${
                active ? 'bg-cream/10 text-cream' : 'text-cream/60 hover:text-cream hover:bg-cream/5'
              }`}
            >
              <Icon size={17} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <Link href="/" className="text-xs text-cream/50 hover:text-cream mt-6">
        ← Back to storefront
      </Link>
    </aside>
  );
}
