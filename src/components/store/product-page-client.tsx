'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { ProductActions } from '@/components/store/product-actions'
import { CartDrawer } from '@/components/shared/cart-drawer'

interface ProductPageClientProps {
  storeSlug: string
  whatsapp: string | null
  canPayOnline: boolean
  productId: string
  productSlug: string
  title: string
  price: number
  image: string | null
  stock: number | null
  whatsappUrl: string | null
}

export function ProductPageClient({
  storeSlug,
  whatsapp,
  canPayOnline,
  productId,
  productSlug,
  title,
  price,
  image,
  stock,
  whatsappUrl,
}: ProductPageClientProps) {
  const { items, count, total, addItem, removeItem, updateQuantity, clearCart } = useCart(storeSlug)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <ProductActions
        storeSlug={storeSlug}
        productId={productId}
        productSlug={productSlug}
        title={title}
        price={price}
        image={image}
        stock={stock}
        whatsappUrl={whatsappUrl}
        cartItems={items}
        onAddToCart={addItem}
      />

      {/* Sticky cart bar — visible when items in cart */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-4 py-3 shadow-lg md:hidden">
          <button
            onClick={() => setCartOpen(true)}
            className="flex w-full items-center justify-between rounded-xl bg-green-500 px-4 py-3 text-white"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">Ver carrito</span>
            </div>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-sm font-bold">
              {count} ítem{count !== 1 ? 's' : ''}
            </span>
          </button>
        </div>
      )}

      {/* Cart icon in top-right for desktop */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </div>

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
        open={cartOpen}
        onOpenChange={setCartOpen}
      />
    </>
  )
}
