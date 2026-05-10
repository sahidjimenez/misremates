import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Precios' }

type PlanFeature = { text: string; ok: boolean; note?: string }

const plans: Array<{
  key: string
  name: string
  price: number
  desc: string
  popular?: boolean
  features: PlanFeature[]
  cta: string
  href: string
}> = [
  {
    key: 'free',
    name: 'Gratis',
    price: 0,
    desc: 'Para empezar sin compromiso',
    features: [
      { text: '3 productos', ok: true },
      { text: 'Tienda pública', ok: true },
      { text: 'Ventas por WhatsApp', ok: true },
      { text: 'Pagos en línea', ok: false },
    ],
    cta: 'Empezar gratis',
    href: '/register',
  },
  {
    key: 'basico',
    name: 'Básico',
    price: 39.99,
    desc: 'Para emprendedores',
    features: [
      { text: '10 productos', ok: true },
      { text: 'Tienda pública', ok: true },
      { text: 'Ventas por WhatsApp', ok: true },
      { text: 'Pagos en línea', ok: false },
    ],
    cta: 'Elegir Básico',
    href: '/register',
  },
  {
    key: 'intermedio',
    name: 'Intermedio',
    price: 59.99,
    desc: 'Para vendedores en crecimiento',
    features: [
      { text: '20 productos', ok: true },
      { text: 'Tienda pública', ok: true },
      { text: 'Ventas por WhatsApp', ok: true },
      { text: 'Pagos en línea', ok: false },
    ],
    cta: 'Elegir Intermedio',
    href: '/register',
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 99.99,
    popular: true,
    desc: 'Para vendedores activos',
    features: [
      { text: '50 productos', ok: true },
      { text: 'Tienda pública', ok: true },
      { text: 'Ventas por WhatsApp', ok: true },
      { text: 'Pagos en línea', ok: true },
    ],
    cta: 'Elegir Pro',
    href: '/register',
  },
  {
    key: 'corporativo',
    name: 'Corporativo',
    price: 299,
    desc: 'Para negocios de remates',
    features: [
      { text: 'Productos ilimitados', ok: true },
      { text: 'Tienda pública', ok: true },
      { text: 'Ventas por WhatsApp', ok: true },
      { text: 'Pagos en línea', ok: true },
    ],
    cta: 'Elegir Corporativo',
    href: '/register',
  },
]

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <Navbar user={user ? { email: user.email! } : null} />
      <main className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-slate-900">Precios simples y transparentes</h1>
            <p className="mt-4 text-lg text-slate-500">
              Empieza gratis. Actualiza cuando tu negocio crezca.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 ${
                  plan.popular
                    ? 'border-green-500 shadow-lg shadow-green-100'
                    : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="px-4">Más popular</Badge>
                  </div>
                )}

                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{plan.desc}</p>
                  <div className="mt-3">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-extrabold text-slate-900">Gratis</span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold text-slate-900">${plan.price}</span>
                        <span className="text-sm text-slate-400"> MXN/mes</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="mb-6 flex-1 space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {f.ok ? (
                        <Check className="h-4 w-4 shrink-0 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      <span className={f.ok ? 'text-slate-700' : 'text-slate-400'}>
                        {f.text}
                        {f.note && <span className="ml-1 text-xs">({f.note})</span>}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={user ? '/dashboard/billing' : plan.href}>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl bg-slate-50 p-6 text-center">
            <h3 className="font-semibold text-slate-900">Planes flexibles para cada etapa</h3>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl mx-auto">
              Todos los planes de pago incluyen pagos en línea y tienda pública sin límites de precio por producto.
              Actualiza o cancela en cualquier momento.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
