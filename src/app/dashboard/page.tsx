import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package, Store, ExternalLink, Plus, TrendingUp, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan, checkPlanLimits } from '@/lib/plans'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlanLimitBar } from '@/components/shared/plan-limit-bar'
import { getPlanDisplayName, formatCurrency } from '@/lib/utils'

export const metadata = { title: 'Panel' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [planKey, limits, storeData, productsData] = await Promise.all([
    getUserPlan(user.id),
    checkPlanLimits(user.id),
    supabase.from('stores').select('*').eq('user_id', user.id).limit(1).single(),
    supabase.from('products').select('id, status, price').eq('user_id', user.id),
  ])

  const store = storeData.data
  const products = productsData.data ?? []
  const activeProducts = products.filter((p) => p.status === 'active')
  const soldProducts = products.filter((p) => p.status === 'sold')
  const totalValue = activeProducts.reduce((s, p) => s + p.price, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel</h1>
          <p className="text-sm text-slate-500">Gestiona tu tienda y productos</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />Nuevo producto
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Productos activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-slate-900">{activeProducts.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Valor en inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalValue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold text-slate-900">{soldProducts.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Plan actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={planKey === 'free' ? 'secondary' : 'default'}>
                {getPlanDisplayName(planKey)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan limits */}
        <div className="lg:col-span-1">
          <PlanLimitBar limits={limits} planName={planKey} />
          {planKey === 'free' && (
            <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm font-medium text-orange-800">¿Necesitas más?</p>
              <p className="mt-1 text-xs text-orange-600">Mejora tu plan para publicar más productos y activar pagos en línea.</p>
              <Link href="/dashboard/billing" className="mt-3 inline-block">
                <Button size="sm" variant="accent">Ver planes</Button>
              </Link>
            </div>
          )}
        </div>

        {/* My store quick link */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-green-600" />
                Mi tienda
              </CardTitle>
            </CardHeader>
            <CardContent>
              {store ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900">{store.name}</p>
                    <p className="text-sm text-slate-500">{store.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/s/${store.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Button variant="outline" size="sm" className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Ver tienda pública
                      </Button>
                    </a>
                    <Link href="/dashboard/store">
                      <Button variant="ghost" size="sm">Editar tienda</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Store className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">Aún no tienes una tienda creada</p>
                  <Link href="/dashboard/store" className="mt-3 inline-block">
                    <Button size="sm">Crear mi tienda</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
