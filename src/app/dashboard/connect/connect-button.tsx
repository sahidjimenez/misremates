'use client'

import { useState } from 'react'
import { Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ConnectButtonProps {
  hasAccount: boolean
  accountId: string | null
}

export function ConnectButton({ hasAccount, accountId }: ConnectButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleConnect() {
    setLoading(true)

    if (!hasAccount) {
      const res = await fetch('/api/stripe/create-connect-account', { method: 'POST' })
      const data = await res.json()
      if (data.error) {
        toast.error('Error al crear cuenta')
        setLoading(false)
        return
      }
    }

    const res = await fetch('/api/stripe/create-account-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId }),
    })
    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error('Error al obtener enlace de Stripe')
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleConnect} disabled={loading} className="gap-2">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ExternalLink className="h-4 w-4" />
      )}
      {hasAccount ? 'Completar verificación en Stripe' : 'Conectar con Stripe'}
    </Button>
  )
}
