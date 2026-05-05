'use client'

import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { ProductCard } from '@/components/shared/product-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
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
  store: { slug: string; whatsapp: string | null; name: string }
}

interface Props {
  products: StoreProduct[]
}

export function StoreProductSearch({ products }: Props) {
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
    <div className="space-y-6">
      {/* Search bar + category pills */}
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
        <h2 className="text-xl font-semibold text-slate-900">
          {hasFilters ? (
            <>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              {query && <span className="ml-1 text-slate-500">para &ldquo;{query}&rdquo;</span>}
              {selectedCategory && (
                <Badge variant="secondary" className="ml-2 text-xs">{selectedCategory}</Badge>
              )}
            </>
          ) : (
            <>Remates disponibles</>
          )}
        </h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-slate-500">
            <X className="h-3.5 w-3.5" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Grid or empty state */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 font-medium text-slate-600">Sin resultados</p>
          <p className="mt-1 text-sm text-slate-400">
            Intenta con otro término o{' '}
            <button onClick={clearFilters} className="text-green-600 underline">
              quita los filtros
            </button>
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}
    </div>
  )
}
