import { redirect } from 'next/navigation'
import { Check, Zap, Crown, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/plans'
import { PLANS } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, getPlanDisplayName } from '@/lib/utils'
import { BillingButton } from './billing-button'

export const metadata = { title: 'Plan y pagos' }

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const currentPlan = await getUserPlan(user.id)

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  const plans = [
    {
      key: 'free' as const,
      icon: null,
      features: ['3 productos', 'Tienda pública', 'Ventas por WhatsApp'],
    },
    {
      key: 'basico' as const,
      icon: Zap,
      features: ['10 productos', 'Tienda pública', 'Pagos en línea', 'WhatsApp'],
    },
    {
      key: 'intermedio' as const,
      icon: Star,
      features: ['20 productos', 'Tienda pública', 'Pagos en línea', 'WhatsApp'],
    },
    {
      key: 'pro' as const,
      icon: Star,
      popular: true,
      features: ['50 productos', 'Tienda pública', 'Pagos en línea', 'WhatsApp'],
    },
    {
      key: 'corporativo' as const,
      icon: Crown,
      features: ['Productos ilimitados', 'Tienda pública', 'Pagos en línea', 'WhatsApp'],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Plan y pagos</h1>
        <p className="text-sm text-slate-500">
          Plan actual: <strong>{getPlanDisplayName(currentPlan)}</strong>
        </p>
      </div>

      {subscription && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-green-800">
              Suscripción activa hasta:{' '}
              {subscription.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString('es-MX')
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {plans.map(({ key, icon: Icon, popular, features }) => {
          const plan = PLANS[key]
          const isCurrent = currentPlan === key

          return (
            <Card
              key={key}
              className={`relative flex flex-col ${popular ? 'border-2 border-green-500' : ''} ${isCurrent ? 'ring-2 ring-green-400' : ''}`}
            >
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="text-xs">Más popular</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-3">
                  <Badge variant="secondary" className="text-xs">Tu plan</Badge>
                </div>
              )}

              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-5 w-5 text-green-600" />}
                  <CardTitle className="text-base">{getPlanDisplayName(key)}</CardTitle>
                </div>
                <div className="mt-2">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-extrabold text-slate-900">Gratis</span>
                  ) : (
                    <>
                      <span className="text-3xl font-extrabold text-slate-900">
                        ${plan.price}
                      </span>
                      <span className="text-sm text-slate-500">/mes MXN</span>
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col justify-between pt-0">
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Plan actual
                    </Button>
                  ) : key === 'free' ? (
                    <Button variant="outline" className="w-full" disabled>
                      Siempre gratis
                    </Button>
                  ) : (
                    <BillingButton planKey={key} priceId={plan.stripePriceId ?? ''} />
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-center text-xs text-slate-400">
        Los pagos son procesados de forma segura por Stripe. Puedes cancelar en cualquier momento.
      </p>
    </div>
  )
}
