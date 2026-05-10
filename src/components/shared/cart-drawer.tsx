'use client'

import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ShoppingCart, X, Plus, Minus, Trash2, Loader2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import type { CartItem } from '@/lib/cart'

interface CartDrawerProps {
  storeSlug: string
  whatsapp: string | null
  canPayOnline: boolean
  items: CartItem[]
  count: number
  total: number
  onUpdateQuantity: (id: string, qty: number) => void
  onRemove: (id: string) => void
  onClear: () => void
}

export function CartDrawer({
  storeSlug,
  whatsapp,
  canPayOnline,
  items,
  count,
  total,
  onUpdateQuantity,
  onRemove,
  onClear,
}: CartDrawerProps) {
  const [open, setOpen] = useState(false)
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    if (!buyerName.trim() || !buyerEmail.trim()) {
      toast.error('Completa tu nombre y correo para continuar')
      return
    }
    if (!buyerEmail.includes('@')) {
      toast.error('Ingresa un correo válido')
      return
    }
    setLoading(true)
    const res = await fetch('/api/stripe/create-cart-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        buyerEmail: buyerEmail.trim(),
        buyerName: buyerName.trim(),
      }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error(data.error ?? 'Error al procesar el pago')
      setLoading(false)
    }
  }

  function handleWhatsApp() {
    if (!whatsapp) return
    const lines = items.map(
      (i) => `• ${i.quantity}x ${i.title} — ${formatCurrency(i.price * i.quantity)}`
    )
    const msg = `Hola, me gustaría comprar los siguientes productos de tu tienda:\n\n${lines.join('\n')}\n\nTotal: ${formatCurrency(total)}`
    window.open(
      `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`,
      '_blank'
    )
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      {/* Trigger — cart icon with badge */}
      <DialogPrimitive.Trigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-green-400 hover:text-green-600 transition-colors">
          <ShoppingCart className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-200">
          <DialogPrimitive.Title className="sr-only">Carrito de compra</DialogPrimitive.Title>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-slate-600" />
              <span className="font-semibold text-slate-900">Carrito</span>
              {count > 0 && (
                <Badge variant="secondary" className="text-xs">{count} ítem{count !== 1 ? 's' : ''}</Badge>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <ShoppingCart className="h-12 w-12 text-slate-200" />
                <p className="font-medium text-slate-500">Tu carrito está vacío</p>
                <p className="text-sm text-slate-400">Agrega productos para continuar</p>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3 rounded-lg border border-slate-100 p-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                        <p className="text-sm font-bold text-orange-600">{formatCurrency(item.price)}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.stock !== null && item.quantity >= item.stock}
                            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-40"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => onRemove(item.productId)}
                            className="ml-auto text-slate-300 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-4 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total</span>
                    <span className="text-lg font-extrabold text-slate-900">{formatCurrency(total)}</span>
                  </div>

                  {canPayOnline && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Nombre</Label>
                          <Input
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            placeholder="Tu nombre"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Correo</Label>
                          <Input
                            type="email"
                            value={buyerEmail}
                            onChange={(e) => setBuyerEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full gap-2"
                        onClick={handleCheckout}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Pagar con tarjeta — {formatCurrency(total)}
                      </Button>
                    </div>
                  )}

                  {whatsapp && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                      onClick={handleWhatsApp}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {canPayOnline ? 'O contactar por WhatsApp' : 'Contactar por WhatsApp'}
                    </Button>
                  )}

                  <button
                    onClick={onClear}
                    className="w-full text-center text-xs text-slate-400 hover:text-red-500"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
