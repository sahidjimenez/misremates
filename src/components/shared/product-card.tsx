import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, Tag, ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, getConditionLabel } from '@/lib/utils'
import type { Product } from '@/types'
import type { CartItem } from '@/lib/cart'

interface ProductCardProps {
  product: Product & { store?: { slug: string; whatsapp?: string | null; name: string }; stock?: number | null }
  showStoreLink?: boolean
  onAddToCart?: (item: Omit<CartItem, 'quantity'>) => void
}

export function ProductCard({ product, showStoreLink = false, onAddToCart }: ProductCardProps) {
  const storeSlug = product.store?.slug
  const productUrl = storeSlug ? `/s/${storeSlug}/p/${product.slug}` : '#'
  const whatsapp = product.store?.whatsapp
  const stock = product.stock ?? null
  const outOfStock = stock !== null && stock <= 0

  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, me interesa el producto: ${product.title} - ${formatCurrency(product.price)}`)}`
    : null

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {product.is_featured && (
        <div className="absolute left-2 top-2 z-10">
          <Badge variant="accent">⭐ Destacado</Badge>
        </div>
      )}
      {outOfStock && (
        <div className="absolute right-2 top-2 z-10">
          <Badge variant="secondary" className="bg-slate-700 text-white">Sin stock</Badge>
        </div>
      )}

      <Link href={productUrl} className="aspect-square overflow-hidden bg-slate-100">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Tag className="h-12 w-12 text-slate-300" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {showStoreLink && product.store && (
          <Link
            href={`/s/${product.store.slug}`}
            className="mb-1 text-xs text-slate-500 hover:text-green-600"
          >
            {product.store.name}
          </Link>
        )}

        <Link href={productUrl}>
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-green-700">
            {product.title}
          </h3>
        </Link>

        <div className="mt-1 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
          <span className="text-xs text-slate-400">{getConditionLabel(product.condition)}</span>
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-bold text-orange-600">{formatCurrency(product.price)}</p>
            {stock !== null && stock > 0 && (
              <span className="text-xs text-slate-400">{stock} disp.</span>
            )}
          </div>

          {onAddToCart ? (
            <Button
              size="sm"
              className="mt-2 w-full gap-2"
              disabled={outOfStock}
              onClick={() => onAddToCart({
                productId: product.id,
                productSlug: product.slug,
                storeSlug: storeSlug ?? '',
                title: product.title,
                price: product.price,
                image: product.images?.[0] ?? null,
                stock,
              })}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
            </Button>
          ) : (
            whatsappUrl && product.status === 'active' && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block">
                <Button size="sm" className="w-full gap-2 bg-[#25D366] hover:bg-[#20BA5A]">
                  <MessageCircle className="h-4 w-4" />
                  Contactar por WhatsApp
                </Button>
              </a>
            )
          )}
        </div>
      </div>
    </div>
  )
}
