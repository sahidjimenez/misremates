'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, ShoppingCart, Plus, Minus, Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { CartItem } from '@/lib/cart'

interface ProductActionsProps {
  storeSlug: string
  productId: string
  productSlug: string
  title: string
  price: number
  image: string | null
  stock: number | null
  whatsappUrl: string | null
  cartItems: CartItem[]
  onAddToCart: (item: Omit<CartItem, 'quantity'>) => void
}

export function ProductActions({
  storeSlug,
  productId,
  productSlug,
  title,
  price,
  image,
  stock,
  whatsappUrl,
  cartItems,
  onAddToCart,
}: ProductActionsProps) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const outOfStock = stock !== null && stock <= 0
  const maxQty = stock ?? 99
  const inCart = cartItems.find((i) => i.productId === productId)

  function handleAdd() {
    for (let i = 0; i < qty; i++) {
      onAddToCart({ productId, productSlug, storeSlug, title, price, image, stock })
    }
    setAdded(true)
    toast.success(`${qty > 1 ? `${qty}x ` : ''}${title} agregado al carrito`)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-3">
      {stock !== null && (
        <p className={`text-sm font-medium ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
          {outOfStock ? 'Sin stock disponible' : `${stock} unidad${stock !== 1 ? 'es' : ''} disponible${stock !== 1 ? 's' : ''}`}
        </p>
      )}

      {!outOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">Cantidad:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          {inCart && (
            <span className="text-xs text-slate-400">{inCart.quantity} en carrito</span>
          )}
        </div>
      )}

      <Button
        size="lg"
        className="w-full gap-2"
        disabled={outOfStock}
        onClick={handleAdd}
      >
        {added ? (
          <><Check className="h-5 w-5" /> Agregado al carrito</>
        ) : (
          <><ShoppingCart className="h-5 w-5" /> Agregar al carrito</>
        )}
      </Button>

      {whatsappUrl && (
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <Button size="lg" variant="outline" className="w-full gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white">
            <MessageCircle className="h-5 w-5" />
            Comprar por WhatsApp
          </Button>
        </a>
      )}

      <Link href={`/s/${storeSlug}`}>
        <Button variant="ghost" size="lg" className="w-full gap-2 text-slate-500">
          <ArrowLeft className="h-4 w-4" />
          Seguir comprando
        </Button>
      </Link>

      <p className="text-center text-xs text-slate-400">
        Este vendedor usa misremates.com.mx
      </p>
    </div>
  )
}
