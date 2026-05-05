'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Package, Edit, Eye, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EditProductModal, type ProductForEdit } from '@/components/shared/edit-product-modal'
import { formatCurrency, formatDate, getConditionLabel } from '@/lib/utils'

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

interface Product extends ProductForEdit {
  slug: string
  is_featured: boolean
  created_at: string
  stores: { slug: string; name: string } | null
}

export function ProductsList({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  function handleUpdated(updated: ProductForEdit) {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    )
    router.refresh()
  }

  function handleDeleted(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis productos</h1>
          <p className="text-sm text-slate-500">{products.length} producto(s) en tu tienda</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />Agregar producto
          </Button>
        </Link>
      </div>

      {!products.length ? (
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
          {products.map((product) => (
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
                  {product.stores && (
                    <a
                      href={`/s/${product.stores.slug}/p/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="icon" title="Ver producto">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Editar"
                    onClick={() => setEditingProduct(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EditProductModal
        product={editingProduct}
        open={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </>
  )
}
