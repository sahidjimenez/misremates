'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, X, Plus, Minus, Tag, Package } from 'lucide-react'
import { ProductCard } from '@/components/shared/product-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { CartItem } from '@/lib/cart'

interface StoreProduct {
  id: string
  title: string
  price: number
  category: string
  condition: string
  description?: string | null
  images: string[]
  status: string
  slug: string
  is_featured: boolean
  stock: number | null
  store: { slug: string; whatsapp: string | null; name: string }
}

interface Props {
  products: StoreProduct[]
  cartItems?: CartItem[]
  onAddToCart?: (item: Omit<CartItem, 'quantity'>) => void
  onUpdateQuantity?: (productId: string, qty: number) => void
}

export function StoreProductSearch({ products, cartItems = [], onAddToCart, onUpdateQuantity }: Props) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort()
    return cats
  }, [products])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return products.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      const matchesCategory = !selectedCategory || p.category === selectedCategory
      return matchesQuery && matchesCategory
    })
  }, [products, query, selectedCategory])

  const hasFilters = query || selectedCategory

  function clearFilters() {
    setQuery('')
    setSelectedCategory(null)
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="pl-9 pr-9"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-green-400 hover:text-green-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
          {hasFilters ? (
            <>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              {query && <span className="ml-1 text-slate-500">para &ldquo;{query}&rdquo;</span>}
              {selectedCategory && (
                <Badge variant="secondary" className="ml-2 text-xs">{selectedCategory}</Badge>
              )}
            </>
          ) : (
            'Remates disponibles'
          )}
        </h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-slate-500">
            <X className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 font-medium text-slate-600">Sin resultados</p>
          <p className="mt-1 text-sm text-slate-400">
            Intenta con otro término o{' '}
            <button onClick={clearFilters} className="text-green-600 underline">quita los filtros</button>
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: compact list */}
          <div className="divide-y divide-slate-100 md:hidden">
            {filtered.map((product) => {
              const cartItem = cartItems.find((i) => i.productId === product.id)
              const outOfStock = product.stock !== null && product.stock <= 0
              const storeSlug = product.store.slug
              const productUrl = `/s/${storeSlug}/p/${product.slug}`

              return (
                <div key={product.id} className="flex items-center gap-3 py-3">
                  {/* Image */}
                  <Link href={productUrl} className="shrink-0">
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Tag className="h-6 w-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={productUrl}>
                      <p className="truncate text-sm font-semibold text-slate-900 leading-tight">
                        {product.title}
                      </p>
                    </Link>
                    {product.description && (
                      <p className="truncate text-xs text-slate-400 mt-0.5">{product.description}</p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-orange-600">
                        {formatCurrency(product.price)}
                      </span>
                      {product.stock !== null && product.stock > 0 && (
                        <span className="text-xs text-slate-400">{product.stock} disp.</span>
                      )}
                      {outOfStock && (
                        <span className="text-xs text-red-400">Sin stock</span>
                      )}
                    </div>
                  </div>

                  {/* Cart controls */}
                  <div className="shrink-0">
                    {outOfStock ? null : cartItem ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateQuantity?.(product.id, cartItem.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-slate-900">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => onAddToCart?.({
                            productId: product.id,
                            productSlug: product.slug,
                            storeSlug,
                            title: product.title,
                            price: product.price,
                            image: product.images?.[0] ?? null,
                            stock: product.stock,
                          })}
                          disabled={product.stock !== null && cartItem.quantity >= product.stock}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAddToCart?.({
                          productId: product.id,
                          productSlug: product.slug,
                          storeSlug,
                          title: product.title,
                          price: product.price,
                          image: product.images?.[0] ?? null,
                          stock: product.stock,
                        })}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white shadow-sm hover:bg-green-600 active:bg-green-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop: grid */}
          <div className="hidden md:grid md:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <ProductCard key={product.id} product={product as any} onAddToCart={onAddToCart} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
