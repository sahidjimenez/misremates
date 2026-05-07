import { redirect } from 'next/navigation'
import { ExternalLink, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/plans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConnectButton } from './connect-button'

export const metadata = { title: 'Cobros online' }

export default async function ConnectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planKey = await getUserPlan(user.id)
  const hasOnlinePayments = planKey !== 'free'

  const { data: sellerProfile } = await supabase
    .from('seller_profiles')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const hasConnectAccount = !!sellerProfile?.stripe_account_id
  const onboardingComplete = sellerProfile?.stripe_onboarding_complete ?? false

  if (!hasOnlinePayments) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cobros online</h1>
          <p className="text-sm text-slate-500">Acepta pagos con tarjeta en tu tienda</p>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-center">
            <Zap className="mx-auto mb-3 h-10 w-10 text-amber-500" />
            <h3 className="font-semibold text-slate-900">Disponible en planes de pago</h3>
            <p className="mt-2 text-sm text-slate-600">
              Activa pagos en línea y acepta tarjetas directamente en tu tienda.
              Tus compradores pagan de forma segura y tú recibes el dinero en tu cuenta bancaria.
            </p>
            <div className="mt-4">
              <a href="/dashboard/billing">
                <Button className="gap-2">
                  <Zap className="h-4 w-4" />
                  Mejorar a Pro
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cobros online</h1>
        <p className="text-sm text-slate-500">Configura tu cuenta de Stripe para recibir pagos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Estado de tu cuenta de pagos
            {onboardingComplete ? (
              <Badge variant="active">Activa</Badge>
            ) : hasConnectAccount ? (
              <Badge variant="warning">Pendiente</Badge>
            ) : (
              <Badge variant="secondary">Sin configurar</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Usamos Stripe Connect para transferirte los pagos de tus ventas de forma segura.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {onboardingComplete ? (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Cuenta configurada correctamente</p>
                <p className="text-sm text-green-600">Ya puedes activar pagos en línea en tus productos.</p>
              </div>
            </div>
          ) : hasConnectAccount ? (
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="h-6 w-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Verificación pendiente</p>
                <p className="text-sm text-amber-600">Completa tu perfil en Stripe para activar los pagos.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Conecta tu cuenta de Stripe para recibir pagos directamente en tu cuenta bancaria.
                El proceso toma menos de 5 minutos.
              </p>
            </div>
          )}

          <div className="space-y-2 text-sm text-slate-500">
            <p>✓ Recibes el dinero directamente en tu cuenta bancaria</p>
            <p>✓ Pagos seguros con tarjeta de crédito o débito</p>
            <p>✓ La plataforma retiene solo la comisión de tu plan</p>
          </div>

          {!onboardingComplete && (
            <ConnectButton
              hasAccount={hasConnectAccount}
              accountId={sellerProfile?.stripe_account_id ?? null}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
