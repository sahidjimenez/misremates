'use client'

import { useState } from 'react'
import { Zap, Loader2, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { PLANS, type PlanKey } from '@/lib/stripe'
import { getPlanDisplayName, formatCurrency } from '@/lib/utils'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  reason: string
  upgradeRequired?: 'basico' | 'pro' | 'premium' | null
}

const PLAN_FEATURES: Record<string, string[]> = {
  basico: ['10 productos', 'Valor total hasta $1,000 MXN', 'Sin límite por producto', 'Ventas por WhatsApp', '8% comisión'],
  pro: ['30 productos', 'Valor total hasta $30,000 MXN', 'Pagos en línea', 'Ventas por WhatsApp', '5% comisión'],
  premium: ['Productos ilimitados', 'Sin límite de valor', 'Pagos en línea', 'Productos destacados', 'Analytics', '2.5% comisión'],
}

export function UpgradeModal({ open, onClose, reason, upgradeRequired }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)

  const planKey = upgradeRequired ?? 'basico'
  const plan = PLANS[planKey as PlanKey]
  const features = PLAN_FEATURES[planKey] ?? []

  async function handleUpgrade() {
    if (!plan.stripePriceId) return
    setLoading(true)

    const res = await fetch('/api/stripe/create-checkout-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: plan.stripePriceId, planKey }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error('Error al iniciar el pago')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Zap className="h-6 w-6 text-orange-600" />
          </div>
          <DialogTitle className="text-center">Necesitas mejorar tu plan</DialogTitle>
          <DialogDescription className="text-center text-sm">{reason}</DialogDescription>
        </DialogHeader>

        <div className="mt-2 rounded-xl border-2 border-green-500 bg-green-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Plan {getPlanDisplayName(planKey)}</span>
              <Badge className="text-xs">Recomendado</Badge>
            </div>
            <span className="text-xl font-extrabold text-slate-900">
              {formatCurrency(plan.price)}<span className="text-xs font-normal text-slate-500">/mes</span>
            </span>
          </div>
          <ul className="space-y-1.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="h-3.5 w-3.5 shrink-0 text-green-600" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <Button className="w-full gap-2" onClick={handleUpgrade} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Activar Plan {getPlanDisplayName(planKey)} — {formatCurrency(plan.price)}/mes
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancelar
          </Button>
        </div>

        <p className="text-center text-xs text-slate-400">
          Pago seguro con Stripe · Cancela cuando quieras
        </p>
      </DialogContent>
    </Dialog>
  )
}
