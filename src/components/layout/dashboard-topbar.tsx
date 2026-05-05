'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'

interface DashboardTopbarProps {
  user: { email: string; full_name?: string | null }
}

export function DashboardTopbar({ user }: DashboardTopbarProps) {
  const router = useRouter()
  const initials = user.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email[0].toUpperCase()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="text-sm font-medium text-slate-600">
        Hola, <span className="text-slate-900">{user.full_name || user.email}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-green-100 text-green-700 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-slate-900">{user.full_name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />Mi cuenta
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
