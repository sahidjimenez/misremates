'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  hadOnlinePayments: boolean
}

export function CancelPlanButton({ hadOnlinePayments }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<'idle' | 'confirm'>('idle')
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/cancel-subscription', { method: 'POST' })
      const data = await res.json()

      if (!res.ok || data.error) {
        toast.error(data.error ?? 'Error al cancelar el plan')
        return
      }

      toast.success('Plan cancelado. Tu cuenta pasa al plan Gratis.')
      router.refresh()
    } catch {
      toast.error('Error al cancelar el plan')
    } finally {
      setLoading(false)
      setStep('idle')
    }
  }

  if (step === 'idle') {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
        onClick={() => setStep('confirm')}
      >
        Cancelar plan
      </Button>
    )
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div className="text-sm text-red-800">
          <p className="font-semibold">¿Confirmas la cancelación?</p>
          <ul className="mt-1 space-y-0.5 text-red-700">
            <li>• Tu plan pasa a <strong>Gratis</strong> de inmediato</li>
            <li>• Solo podrás tener 3 productos activos</li>
            {hadOnlinePayments && (
              <>
                <li>• Se desactivarán los <strong>cobros en línea</strong></li>
                <li>• Los botones de pago con tarjeta desaparecerán de tus productos</li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancel}
          disabled={loading}
          className="gap-1.5"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Sí, cancelar plan
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep('idle')}
          disabled={loading}
        >
          No, conservar
        </Button>
      </div>
    </div>
  )
}
