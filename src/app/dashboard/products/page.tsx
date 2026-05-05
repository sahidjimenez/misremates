import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Package, Edit, Eye, EyeOff, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate, getConditionLabel } from '@/lib/utils'

export const metadata = { title: 'Mis productos' }

const statusVariant: Record<string, 'active' | 'draft' | 'sold' | 'paused'> = {
  active: 'active',
  draft: 'draft',
  sold: 'sold',
  paused: 'paused',
}

const statusLabel: Record<string, string> = {
  active: 'Activo',
  draft: 'Borrador',
  sold: 'Vendido',
  paused: 'Pausado',
}

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: products } = await supabase
    .from('products')
    .select('*, stores(slug, name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis productos</h1>
          <p className="text-sm text-slate-500">{products?.length ?? 0} producto(s) en tu tienda</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />Agregar producto
          </Button>
        </Link>
      </div>

      {!products?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-20">
          <Package className="h-12 w-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-600">Sin productos aún</p>
          <p className="text-sm text-slate-400">Agrega tu primer producto en remate</p>
          <Link href="/dashboard/products/new" className="mt-6">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />Agregar producto
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => {
            const store = product.stores as { slug: string; name: string } | null
            return (
              <Card key={product.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Tag className="h-6 w-6 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 truncate">{product.title}</p>
                      <Badge variant={statusVariant[product.status] ?? 'secondary'}>
                        {statusLabel[product.status] ?? product.status}
                      </Badge>
                      {product.is_featured && <Badge variant="accent">Destacado</Badge>}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span>{product.category}</span>
                      <span>·</span>
                      <span>{getConditionLabel(product.condition)}</span>
                      <span>·</span>
                      <span>{formatDate(product.created_at)}</span>
                    </div>
                    <p className="mt-1 text-base font-bold text-orange-600">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {store && (
                      <a
                        href={`/s/${store.slug}/p/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" title="Ver producto">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Link href={`/dashboard/products/${product.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
