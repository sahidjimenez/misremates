'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  user?: { email: string; full_name?: string } | null
}

export function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">
            mis<span className="text-orange-500">remates</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900">
            Precios
          </Link>
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Iniciar sesión</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Empezar gratis</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="flex md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-2 pt-3">
            <Link href="/pricing" className="py-2 text-sm text-slate-600">Precios</Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <LayoutDashboard className="h-4 w-4" />Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Iniciar sesión</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">Empezar gratis</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
