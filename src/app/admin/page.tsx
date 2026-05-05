import { redirect } from 'next/navigation'
import { Users, Store, Package, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, getPlanDisplayName } from '@/lib/utils'

export const metadata = { title: 'Admin' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminUser?.role !== 'admin') redirect('/dashboard')

  const [usersResult, storesResult, productsResult, subsResult] = await Promise.all([
    supabase.from('users').select('id, email, full_name, created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('stores').select('id, name, slug, status, created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('products').select('id, title, price, status, created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('subscriptions').select('id, status, user_id, plans(name), created_at').order('created_at', { ascending: false }).limit(20),
  ])

  const stats = {
    users: usersResult.count ?? usersResult.data?.length ?? 0,
    stores: storesResult.count ?? storesResult.data?.length ?? 0,
    products: productsResult.count ?? productsResult.data?.length ?? 0,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel Admin</h1>
        <p className="text-sm text-slate-500">Vista general de la plataforma</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Users className="h-4 w-4" />Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{usersResult.data?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Store className="h-4 w-4" />Tiendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{storesResult.data?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Package className="h-4 w-4" />Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{productsResult.data?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <CreditCard className="h-4 w-4" />Suscripciones activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {subsResult.data?.filter((s) => s.status === 'active').length ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos usuarios registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Nombre</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 font-medium">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usersResult.data?.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 pr-4 font-medium text-slate-900">{u.full_name ?? '—'}</td>
                    <td className="py-3 pr-4 text-slate-600">{u.email}</td>
                    <td className="py-3 text-slate-500">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimos productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Producto</th>
                  <th className="pb-3 pr-4 font-medium">Precio</th>
                  <th className="pb-3 pr-4 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productsResult.data?.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4 font-medium text-slate-900 max-w-xs truncate">{p.title}</td>
                    <td className="py-3 pr-4 text-orange-600 font-semibold">{formatCurrency(p.price)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={p.status as 'active' | 'draft' | 'sold' | 'paused'}>{p.status}</Badge>
                    </td>
                    <td className="py-3 text-slate-500">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
