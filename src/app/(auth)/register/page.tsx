'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  ShoppingBag, Loader2, Check, ArrowRight, ArrowLeft,
  User, CreditCard, Store, Zap, Star, Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { PLANS } from '@/lib/plans-config'
import { formatCurrency, getPlanDisplayName, generateUniqueSlug } from '@/lib/utils'

// ─── Step schemas ─────────────────────────────────────────────────────────────

const accountSchema = z.object({
  full_name: z.string().min(2, 'Ingresa tu nombre completo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const storeSchema = z.object({
  store_name: z.string().min(2, 'Mínimo 2 caracteres').max(60),
  whatsapp: z.string().regex(/^[0-9+\s()-]{10,20}$/, 'Número inválido').optional().or(z.literal('')),
})

type AccountData = z.infer<typeof accountSchema>
type StoreData = z.infer<typeof storeSchema>

// ─── Plan options ─────────────────────────────────────────────────────────────

const PLAN_OPTIONS = [
  {
    key: 'free' as const,
    icon: null,
    label: 'Gratis',
    desc: 'Para empezar',
    color: 'border-slate-200 hover:border-slate-400',
    selectedColor: 'border-slate-400 bg-slate-50',
    features: ['3 productos máx', 'Precio por producto ≤ $100 MXN', 'Total inventario ≤ $1,000 MXN', 'Ventas por WhatsApp'],
    warning: 'Solo para productos de $100 o menos.',
  },
  {
    key: 'basico' as const,
    icon: Zap,
    label: 'Básico',
    desc: '$99/mes',
    color: 'border-slate-200 hover:border-blue-400',
    selectedColor: 'border-blue-400 bg-blue-50',
    features: ['10 productos', 'Sin límite por producto', 'Total inventario ≤ $1,000 MXN', '8% comisión'],
    warning: null,
  },
  {
    key: 'pro' as const,
    icon: Star,
    label: 'Pro',
    desc: '$299/mes',
    color: 'border-slate-200 hover:border-green-400',
    selectedColor: 'border-green-500 bg-green-50',
    popular: true,
    features: ['30 productos', 'Total hasta $30,000 MXN', 'Pagos en línea', '5% comisión'],
    warning: null,
  },
  {
    key: 'premium' as const,
    icon: Crown,
    label: 'Premium',
    desc: '$699/mes',
    color: 'border-slate-200 hover:border-purple-400',
    selectedColor: 'border-purple-400 bg-purple-50',
    features: ['Ilimitados', 'Sin límite de valor', 'Pagos online', 'Destacados + Analytics', '2.5% comisión'],
    warning: null,
  },
]

// ─── Step indicators ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { n: 1, label: 'Cuenta', icon: User },
    { n: 2, label: 'Plan', icon: CreditCard },
    { n: 3, label: 'Tienda', icon: Store },
  ]
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => {
        const Icon = s.icon
        const done = s.n < current
        const active = s.n === current
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                done ? 'border-green-600 bg-green-600 text-white'
                : active ? 'border-green-600 bg-white text-green-600'
                : 'border-slate-200 bg-white text-slate-400'
              }`}>
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={`mt-1 text-xs font-medium ${active ? 'text-green-700' : done ? 'text-green-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-2 mb-4 h-0.5 w-12 ${done ? 'bg-green-500' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function RegisterFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialStep = searchParams.get('step') === '3' ? 3 : 1

  const [step, setStep] = useState(initialStep)
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basico' | 'pro' | 'premium'>('free')

  const accountForm = useForm<AccountData>({ resolver: zodResolver(accountSchema) })
  const storeForm = useForm<StoreData>({ resolver: zodResolver(storeSchema) })

  // ── Step 1: crear cuenta ──────────────────────────────────────────────────
  async function handleAccount(data: AccountData) {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.full_name } },
    })

    if (error) {
      toast.error(error.message === 'User already registered' ? 'Este email ya está registrado' : error.message)
      setLoading(false)
      return
    }

    setStep(2)
    setLoading(false)
  }

  // ── Step 2: elegir plan ───────────────────────────────────────────────────
  async function handlePlanSelect() {
    if (selectedPlan === 'free') {
      setStep(3)
      return
    }

    setLoading(true)
    const res = await fetch('/api/stripe/create-checkout-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planKey: selectedPlan,
        successUrl: `${window.location.origin}/register?step=3&plan=${selectedPlan}`,
        cancelUrl: `${window.location.origin}/register?step=2`,
      }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error('Error al iniciar el pago')
      setLoading(false)
    }
  }

  // ── Step 3: crear tienda ──────────────────────────────────────────────────
  async function handleStore(data: StoreData) {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Sesión expirada, por favor inicia sesión')
      router.push('/login')
      return
    }

    // Crear seller profile si no existe
    const { data: existingProfile } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    let sellerProfileId = existingProfile?.id

    if (!sellerProfileId) {
      const { data: newProfile } = await supabase
        .from('seller_profiles')
        .insert({ user_id: user.id, display_name: data.store_name, phone: data.whatsapp })
        .select('id')
        .single()
      sellerProfileId = newProfile?.id
    }

    // Crear tienda
    const slug = generateUniqueSlug(data.store_name)
    const { error } = await supabase.from('stores').insert({
      user_id: user.id,
      seller_profile_id: sellerProfileId,
      name: data.store_name,
      slug,
      whatsapp: data.whatsapp || null,
      status: 'active',
    })

    if (error) {
      toast.error('Error al crear la tienda')
      setLoading(false)
      return
    }

    toast.success('¡Todo listo! Bienvenido a misremates')
    router.push('/dashboard')
  }

  const paidPlanParam = searchParams.get('plan')

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              mis<span className="text-orange-500">remates</span>
            </span>
          </Link>
        </div>

        <StepIndicator current={step} />

        {/* ─ STEP 1: Cuenta ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="mb-1 text-xl font-bold text-slate-900">Crea tu cuenta</h1>
            <p className="mb-6 text-sm text-slate-500">Paso 1 de 3 — Solo toma 30 segundos</p>

            <form onSubmit={accountForm.handleSubmit(handleAccount)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input id="full_name" placeholder="Tu nombre" {...accountForm.register('full_name')} />
                {accountForm.formState.errors.full_name && (
                  <p className="text-xs text-red-500">{accountForm.formState.errors.full_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="tu@email.com" {...accountForm.register('email')} />
                {accountForm.formState.errors.email && (
                  <p className="text-xs text-red-500">{accountForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="Mínimo 6 caracteres" {...accountForm.register('password')} />
                {accountForm.formState.errors.password && (
                  <p className="text-xs text-red-500">{accountForm.formState.errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Continuar <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="font-medium text-green-600 hover:underline">Iniciar sesión</Link>
            </p>
          </div>
        )}

        {/* ─ STEP 2: Plan ───────────────────────────────────────────── */}
        {step === 2 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="mb-1 text-xl font-bold text-slate-900">Elige tu plan</h1>
            <p className="mb-5 text-sm text-slate-500">Paso 2 de 3 — Puedes cambiarlo cuando quieras</p>

            <div className="grid grid-cols-2 gap-3">
              {PLAN_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const selected = selectedPlan === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSelectedPlan(opt.key)}
                    className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                      selected ? opt.selectedColor : opt.color
                    }`}
                  >
                    {opt.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Más popular
                      </span>
                    )}
                    <div className="mb-2 flex items-center gap-1.5">
                      {Icon && <Icon className="h-4 w-4 text-green-600" />}
                      <span className="font-bold text-slate-900">{opt.label}</span>
                      {selected && <Check className="ml-auto h-4 w-4 text-green-600" />}
                    </div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">{opt.desc}</p>
                    <ul className="space-y-1">
                      {opt.features.map((f) => (
                        <li key={f} className="flex items-start gap-1 text-xs text-slate-600">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {opt.warning && (
                      <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
                        ⚠ {opt.warning}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-5 space-y-2">
              {selectedPlan !== 'free' && (
                <p className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-700">
                  Serás redirigido a Stripe para pagar{' '}
                  <strong>{formatCurrency(PLANS[selectedPlan].price)}/mes</strong> de forma segura.
                  Después regresarás aquí para crear tu tienda.
                </p>
              )}
              <Button className="w-full gap-2" onClick={handlePlanSelect} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {selectedPlan === 'free' ? (
                  <>Continuar con plan Gratis <ArrowRight className="h-4 w-4" /></>
                ) : (
                  <>Pagar {formatCurrency(PLANS[selectedPlan].price)}/mes con Stripe <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-2 text-slate-500"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" /> Volver
              </Button>
            </div>
          </div>
        )}

        {/* ─ STEP 3: Tienda ─────────────────────────────────────────── */}
        {step === 3 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="mb-1 text-xl font-bold text-slate-900">Crea tu tienda</h1>
            <p className="mb-2 text-sm text-slate-500">Paso 3 de 3 — ¡Ya casi terminamos!</p>

            {paidPlanParam && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                <Check className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-700">
                  ¡Plan <strong>{getPlanDisplayName(paidPlanParam)}</strong> activado correctamente!
                </p>
              </div>
            )}

            <form onSubmit={storeForm.handleSubmit(handleStore)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store_name">Nombre de tu tienda *</Label>
                <Input
                  id="store_name"
                  placeholder="Ej: Remates García, Tienda de Juan"
                  {...storeForm.register('store_name')}
                />
                {storeForm.formState.errors.store_name && (
                  <p className="text-xs text-red-500">{storeForm.formState.errors.store_name.message}</p>
                )}
                <p className="text-xs text-slate-400">
                  Este será el nombre visible en tu tienda pública
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp de contacto</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+52 555 123 4567"
                  {...storeForm.register('whatsapp')}
                />
                <p className="text-xs text-slate-400">
                  Los compradores te contactarán aquí
                </p>
                {storeForm.formState.errors.whatsapp && (
                  <p className="text-xs text-red-500">{storeForm.formState.errors.whatsapp.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />}
                Crear mi tienda e ir al dashboard
              </Button>
            </form>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-slate-400">
          Al registrarte aceptas nuestros{' '}
          <Link href="/terminos" className="underline">Términos de uso</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    }>
      <RegisterFlow />
    </Suspense>
  )
}
