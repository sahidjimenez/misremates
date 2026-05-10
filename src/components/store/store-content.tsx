'use client'

import Link from 'next/link'
import { MapPin, Package, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StoreProductSearch } from '@/components/shared/store-product-search'
import { CartDrawer } from '@/components/shared/cart-drawer'
import { useCart } from '@/lib/cart'

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

interface StoreContentProps {
  storeSlug: string
  storeName: string
  storeDescription: string | null
  whatsapp: string | null
  seller: { display_name: string; city?: string; state?: string } | null
  canPayOnline: boolean
  products: StoreProduct[]
}

export function StoreContent({
  storeSlug,
  storeName,
  storeDescription,
  whatsapp,
  seller,
  canPayOnline,
  products,
}: StoreContentProps) {
  const { items, count, total, addItem, removeItem, updateQuantity, clearCart } = useCart(storeSlug)

  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, vi tu tienda en misremates.com.mx y me gustaría más información.`)}`
    : null

  return (
    <>
      {/* Store header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-2xl font-bold text-white shadow-md">
                {storeName[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{storeName}</h1>
                {seller && (seller.city || seller.state) && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {[seller.city, seller.state].filter(Boolean).join(', ')}
                  </div>
                )}
                {storeDescription && (
                  <p className="mt-2 text-sm text-slate-600 max-w-lg">{storeDescription}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <Package className="h-3 w-3" />
                {products.length} productos
              </Badge>
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#20BA5A]">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </button>
                </a>
              )}
              <CartDrawer
                storeSlug={storeSlug}
                whatsapp={whatsapp}
                canPayOnline={canPayOnline}
                items={items}
                count={count}
                total={total}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
                onClear={clearCart}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products grid with search */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {!products.length ? (
          <div className="py-20 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-500">Esta tienda aún no tiene productos publicados</p>
          </div>
        ) : (
          <StoreProductSearch
            products={products}
            cartItems={items}
            onAddToCart={addItem}
            onUpdateQuantity={updateQuantity}
          />
        )}
      </div>
    </>
  )
}
