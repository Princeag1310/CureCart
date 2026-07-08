'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutDashboard, Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/inventory',
    label: 'Inventory',
    icon: Package,
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: ShoppingCart,
  },
  {
    href: '/admin/prescriptions',
    label: 'Prescriptions',
    icon: FileText,
  },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 py-6 px-3 space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === '/admin'
            ? pathname === '/admin' || pathname === '/admin/'
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              isActive
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
          >
            <Icon className={cn('w-5 h-5', isActive ? 'text-emerald-400' : 'text-slate-400')} />
            <span className={cn('font-medium', isActive && 'text-white')}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
