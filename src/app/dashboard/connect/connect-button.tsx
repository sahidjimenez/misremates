'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ConnectButtonProps {
  hasAccount: boolean
  accountId: string | null
}

export function ConnectButton({ hasAccount, accountId }: ConnectButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

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

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/stripe/sync-connect-status', { method: 'POST' })
      const data = await res.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      if (data.complete) {
        toast.success('¡Cuenta verificada! Tu cuenta de Stripe está activa.')
        router.refresh()
      } else {
        toast.warning('La verificación en Stripe aún no está completa. Termina el proceso en Stripe primero.')
      }
    } catch {
      toast.error('Error al verificar el estado')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={handleConnect} disabled={loading || syncing} className="gap-2">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ExternalLink className="h-4 w-4" />
        )}
        {hasAccount ? 'Completar verificación en Stripe' : 'Conectar con Stripe'}
      </Button>

      {hasAccount && (
        <Button
          variant="outline"
          onClick={handleSync}
          disabled={loading || syncing}
          className="gap-2"
        >
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Sincronizar estado
        </Button>
      )}
    </div>
  )
}
