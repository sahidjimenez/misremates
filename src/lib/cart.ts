'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CartItem {
  productId: string
  productSlug: string
  storeSlug: string
  title: string
  price: number
  image: string | null
  quantity: number
  stock: number | null
}

export function useCart(storeSlug: string) {
  const key = `cart_${storeSlug}`
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    setReady(true)
  }, [key])

  const save = useCallback((next: CartItem[]) => {
    setItems(next)
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {}
  }, [key])

  function addItem(item: Omit<CartItem, 'quantity'>) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId)
      let next: CartItem[]
      if (existing) {
        const maxQty = item.stock ?? Infinity
        next = prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + 1, maxQty) }
            : i
        )
      } else {
        next = [...prev, { ...item, quantity: 1 }]
      }
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function removeItem(productId: string) {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId)
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) { removeItem(productId); return }
    setItems((prev) => {
      const next = prev.map((i) => {
        if (i.productId !== productId) return i
        const maxQty = i.stock ?? Infinity
        return { ...i, quantity: Math.min(quantity, maxQty) }
      })
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function clearCart() {
    setItems([])
    try { localStorage.removeItem(key) } catch {}
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return { items, ready, addItem, removeItem, updateQuantity, clearCart, total, count }
}
