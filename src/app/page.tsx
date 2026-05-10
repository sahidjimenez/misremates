import Link from 'next/link'
import { ArrowRight, Check, X, ShoppingBag, Store, Package, Share2, MessageCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const features = [
    { icon: Store, title: 'Tu tienda online', desc: 'Un enlace único para compartir todos tus productos en remate.' },
    { icon: Package, title: 'Gestión de productos', desc: 'Sube fotos, precio, categoría y estado de cada artículo.' },
    { icon: MessageCircle, title: 'Ventas por WhatsApp', desc: 'Tus clientes te contactan directo por WhatsApp sin complicaciones.' },
    { icon: Share2, title: 'Comparte al instante', desc: 'Copia tu enlace y compártelo en grupos, redes sociales o WhatsApp.' },
    { icon: Zap, title: 'Pagos en línea (Pro+)', desc: 'Acepta tarjetas directamente en tu tienda con Stripe Connect.' },
  ]

  const steps = [
    { n: '1', title: 'Regístrate gratis', desc: 'Crea tu cuenta en menos de 2 minutos, sin tarjeta.' },
    { n: '2', title: 'Crea tu tienda', desc: 'Dale nombre, descripción y personaliza tu tienda.' },
    { n: '3', title: 'Publica tus remates', desc: 'Sube fotos y precio de cada producto.' },
    { n: '4', title: 'Comparte y vende', desc: 'Comparte tu tienda y recibe pedidos por WhatsApp.' },
  ]

  return (
    <>
      <Navbar user={user ? { email: user.email! } : null} />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-slate-50 to-white py-20 text-center">
          <div className="mx-auto max-w-4xl px-4">
            <Badge variant="accent" className="mb-4 text-sm">
              🔥 La plataforma de remates #1 en México
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Vende tus productos en remate con{' '}
              <span className="text-orange-500">tu propia tienda online</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Crea tu tienda online de remates en minutos. Publica productos, comparte tu enlace
              y recibe pedidos por WhatsApp — o activa pagos en línea con tu plan Pro.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Crear mi tienda gratis <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">Ver planes</Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-400">Sin tarjeta de crédito · Plan gratis para siempre</p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
              Todo lo que necesitas para vender
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                      <Icon className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="mb-2 font-semibold text-slate-900">{f.title}</h3>
                    <p className="text-sm text-slate-500">{f.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">Cómo funciona</h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {steps.map((s) => (
                <div key={s.n} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-white font-bold text-sm">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{s.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900">Precios transparentes</h2>
              <p className="mt-4 text-slate-500">Empieza gratis. Actualiza cuando tu negocio crezca.</p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {[
                {
                  name: 'Gratis', price: 0, desc: 'Para empezar sin compromiso', popular: false,
                  features: [
                    { text: '3 productos', ok: true },
                    { text: 'Tienda pública', ok: true },
                    { text: 'Ventas por WhatsApp', ok: true },
                    { text: 'Pagos en línea', ok: false },
                  ],
                  cta: 'Empezar gratis',
                },
                {
                  name: 'Básico', price: 39.99, desc: 'Para emprendedores', popular: false,
                  features: [
                    { text: '10 productos', ok: true },
                    { text: 'Tienda pública', ok: true },
                    { text: 'Ventas por WhatsApp', ok: true },
                    { text: 'Pagos en línea', ok: false },
                  ],
                  cta: 'Elegir Básico',
                },
                {
                  name: 'Intermedio', price: 59.99, desc: 'Para vendedores en crecimiento', popular: false,
                  features: [
                    { text: '20 productos', ok: true },
                    { text: 'Tienda pública', ok: true },
                    { text: 'Ventas por WhatsApp', ok: true },
                    { text: 'Pagos en línea', ok: false },
                  ],
                  cta: 'Elegir Intermedio',
                },
                {
                  name: 'Pro', price: 99.99, desc: 'Para vendedores activos', popular: true,
                  features: [
                    { text: '50 productos', ok: true },
                    { text: 'Tienda pública', ok: true },
                    { text: 'Ventas por WhatsApp', ok: true },
                    { text: 'Pagos en línea', ok: true },
                  ],
                  cta: 'Elegir Pro',
                },
                {
                  name: 'Corporativo', price: 299, desc: 'Para negocios de remates', popular: false,
                  features: [
                    { text: 'Productos ilimitados', ok: true },
                    { text: 'Tienda pública', ok: true },
                    { text: 'Ventas por WhatsApp', ok: true },
                    { text: 'Pagos en línea', ok: true },
                  ],
                  cta: 'Elegir Corporativo',
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 ${
                    plan.popular ? 'border-green-500 shadow-lg shadow-green-100' : 'border-slate-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge variant="default" className="px-4">Más popular</Badge>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{plan.desc}</p>
                    <div className="mt-3">
                      {plan.price === 0 ? (
                        <span className="text-3xl font-extrabold text-slate-900">Gratis</span>
                      ) : (
                        <>
                          <span className="text-3xl font-extrabold text-slate-900">${plan.price}</span>
                          <span className="text-sm text-slate-400"> MXN/mes</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ul className="mb-6 flex-1 space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        {f.ok
                          ? <Check className="h-4 w-4 shrink-0 text-green-600" />
                          : <X className="h-4 w-4 shrink-0 text-slate-300" />}
                        <span className={f.ok ? 'text-slate-700' : 'text-slate-400'}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} size="sm">
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-900 py-20 text-center text-white">
          <div className="mx-auto max-w-2xl px-4">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-orange-400" />
            <h2 className="text-3xl font-bold">¿Listo para vender tus productos en remate?</h2>
            <p className="mt-4 text-slate-400">Crea tu tienda gratis hoy y empieza a vender en minutos.</p>
            <Link href="/register" className="mt-8 inline-block">
              <Button size="lg" variant="accent" className="gap-2">
                Empezar gratis <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
