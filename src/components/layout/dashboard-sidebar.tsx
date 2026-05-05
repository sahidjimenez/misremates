'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Package,
  CreditCard,
  Zap,
  ShoppingBag,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/store', label: 'Mi tienda', icon: Store },
  { href: '/dashboard/products', label: 'Productos', icon: Package },
  { href: '/dashboard/billing', label: 'Plan y pagos', icon: CreditCard },
  { href: '/dashboard/connect', label: 'Cobros online', icon: Zap },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:block">
      <div className="flex h-full flex-col py-4">
        <div className="px-4 pb-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">
              mis<span className="text-orange-500">remates</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-green-50 text-green-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-2 pt-4 border-t border-slate-200">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-xs text-slate-400 hover:text-slate-600"
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        </div>
      </div>
    </aside>
  )
}
