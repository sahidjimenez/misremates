'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface BillingButtonProps {
  planKey: string
  priceId: string
}

export function BillingButton({ planKey, priceId }: BillingButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    const res = await fetch('/api/stripe/create-checkout-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, planKey }),
    })

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error('Error al iniciar el checkout')
      setLoading(false)
    }
  }

  return (
    <Button className="w-full" onClick={handleSubscribe} disabled={loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Suscribirse
    </Button>
  )
}
