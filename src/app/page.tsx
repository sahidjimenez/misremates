import Link from 'next/link'
import { ArrowRight, Check, ShoppingBag, Store, Package, Share2, MessageCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const features = [
    { icon: Store, title: 'Tu tienda propia', desc: 'Un enlace único para compartir todos tus productos en remate.' },
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
              Vende tus remates con{' '}
              <span className="text-orange-500">tu propia tienda</span>
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
                <Button size="lg" variant="outline">Ver precios</Button>
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

        {/* Pricing teaser */}
        <section className="py-20">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Precios transparentes</h2>
            <p className="mt-4 text-slate-500">Empieza gratis. Actualiza cuando necesites más alcance.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border-2 border-slate-200 p-6 text-left">
                <p className="font-bold text-slate-900">Gratis</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">$0</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {['3 productos', 'Tienda pública', 'Ventas por WhatsApp'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border-2 border-green-500 bg-green-50 p-6 text-left">
                <p className="font-bold text-green-700">Pro — Más popular</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">$299 <span className="text-base font-normal text-slate-500">/mes</span></p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {['30 productos', 'Pagos en línea', '5% comisión', 'Valor hasta $30,000 MXN'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link href="/pricing" className="mt-6 inline-block">
              <Button variant="outline">Ver todos los planes</Button>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-900 py-20 text-center text-white">
          <div className="mx-auto max-w-2xl px-4">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-orange-400" />
            <h2 className="text-3xl font-bold">¿Listo para vender tus remates?</h2>
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
