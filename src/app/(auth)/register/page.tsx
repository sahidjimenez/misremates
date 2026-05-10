'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import {
  Loader2, Check, ArrowRight, ArrowLeft,
  User, CreditCard, Store, Zap, Star, Crown, Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { PLANS } from '@/lib/plans-config'
import { formatCurrency, getPlanDisplayName, generateUniqueSlug } from '@/lib/utils'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const accountSchema = z.object({
  full_name: z.string().min(2, 'Ingresa tu nombre completo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const storeSchema = z.object({
  store_name: z.string().min(2, 'Mínimo 2 caracteres').max(60),
  whatsapp: z.string().regex(/^[0-9+\s()-]{10,20}$/, 'Número inválido').optional().or(z.literal('')),
})

const productSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(120),
  price: z.number({ message: 'Ingresa un precio válido' }).positive('El precio debe ser mayor a 0'),
  category: z.string().min(1, 'Selecciona una categoría'),
  condition: z.enum(['nuevo', 'como_nuevo', 'buen_estado', 'usado']),
  description: z.string().max(1000).optional(),
})

type AccountData = z.infer<typeof accountSchema>
type StoreData = z.infer<typeof storeSchema>
type ProductData = z.infer<typeof productSchema>

const CATEGORIES = [
  'Electrónica', 'Ropa y calzado', 'Muebles', 'Hogar', 'Juguetes',
  'Deportes', 'Vehículos', 'Libros', 'Arte', 'Joyería', 'Herramientas', 'Otros',
]

// ─── Plan options ─────────────────────────────────────────────────────────────

const PLAN_OPTIONS = [
  {
    key: 'free' as const,
    icon: null,
    label: 'Gratis',
    desc: 'Para empezar',
    color: 'border-slate-200 hover:border-slate-400',
    selectedColor: 'border-slate-400 bg-slate-50',
    features: ['3 productos máx', 'Tienda pública', 'Ventas por WhatsApp'],
    warning: null,
  },
  {
    key: 'basico' as const,
    icon: Zap,
    label: 'Básico',
    desc: '$39.99/mes',
    color: 'border-slate-200 hover:border-blue-400',
    selectedColor: 'border-blue-400 bg-blue-50',
    features: ['10 productos', 'Tienda pública', 'WhatsApp'],
    warning: null,
  },
  {
    key: 'intermedio' as const,
    icon: Star,
    label: 'Intermedio',
    desc: '$59.99/mes',
    color: 'border-slate-200 hover:border-yellow-400',
    selectedColor: 'border-yellow-400 bg-yellow-50',
    features: ['20 productos', 'Tienda pública', 'WhatsApp'],
    warning: null,
  },
  {
    key: 'pro' as const,
    icon: Star,
    label: 'Pro',
    desc: '$99.99/mes',
    color: 'border-slate-200 hover:border-green-400',
    selectedColor: 'border-green-500 bg-green-50',
    popular: true,
    features: ['50 productos', 'Tienda pública', 'Pagos en línea', 'WhatsApp'],
    warning: null,
  },
  {
    key: 'corporativo' as const,
    icon: Crown,
    label: 'Corporativo',
    desc: '$299/mes',
    color: 'border-slate-200 hover:border-purple-400',
    selectedColor: 'border-purple-400 bg-purple-50',
    features: ['Productos ilimitados', 'Tienda pública', 'Pagos en línea', 'WhatsApp'],
    warning: null,
  },
]

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { n: 1, label: 'Cuenta', icon: User },
    { n: 2, label: 'Plan', icon: CreditCard },
    { n: 3, label: 'Tienda', icon: Store },
    { n: 4, label: 'Producto', icon: Package },
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
              <div className={`mx-1.5 mb-4 h-0.5 w-8 ${done ? 'bg-green-500' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main flow ────────────────────────────────────────────────────────────────

function RegisterFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const stepParam = searchParams.get('step')
  const initialStep = stepParam === '4' ? 4 : stepParam === '3' ? 3 : stepParam === '2' ? 2 : 1

  const [step, setStep] = useState(initialStep)
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basico' | 'intermedio' | 'pro' | 'corporativo'>('free')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [accountCreated, setAccountCreated] = useState(initialStep > 1)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Check existing session on mount
  useEffect(() => {
    if (initialStep > 1) return // already mid-flow via URL param, trust the param

    async function checkSession() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setAccountCreated(true)
      setUserId(user.id)

      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (store) {
        // Already fully registered
        router.replace('/dashboard')
      } else {
        // Account exists, skip to plan selection
        setStep(2)
      }
    }
    checkSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const accountForm = useForm<AccountData>({ resolver: zodResolver(accountSchema) })
  const storeForm = useForm<StoreData>({ resolver: zodResolver(storeSchema) })
  const productForm = useForm<ProductData>({
    resolver: zodResolver(productSchema),
    defaultValues: { condition: 'buen_estado' },
  })

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

    setAccountCreated(true)
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

    setUserId(user.id)

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

    const slug = generateUniqueSlug(data.store_name)
    const { data: newStore, error } = await supabase.from('stores').insert({
      user_id: user.id,
      seller_profile_id: sellerProfileId,
      name: data.store_name,
      slug,
      whatsapp: data.whatsapp || null,
      status: 'active',
    }).select('id').single()

    if (error) {
      toast.error('Error al crear la tienda')
      setLoading(false)
      return
    }

    setStoreId(newStore?.id ?? null)
    setStep(4)
    setLoading(false)
  }

  // ── Step 4: agregar primer producto ──────────────────────────────────────
  async function handleProduct(data: ProductData) {
    if (!userId || !storeId) {
      router.push('/dashboard')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // Check limits before inserting
    const res = await fetch('/api/products/check-limits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: data.price }),
    })
    const limits = await res.json()

    if (!limits.canAddProduct) {
      toast.error(limits.reason ?? 'No puedes agregar este producto con tu plan actual')
      setLoading(false)
      return
    }

    const slug = generateUniqueSlug(data.title)
    const { error } = await supabase.from('products').insert({
      store_id: storeId,
      user_id: userId,
      title: data.title,
      slug,
      description: data.description,
      price: data.price,
      category: data.category,
      condition: data.condition,
      images: [],
      status: 'active',
      is_featured: false,
    })

    if (error) {
      toast.error('Error al crear el producto')
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
          <Link href="/" className="inline-flex items-center">
            <Image src="/logo.png" alt="misremates" width={140} height={48} className="h-14 w-auto" priority />
          </Link>
        </div>

        <StepIndicator current={step} />

        {/* ─ STEP 1: Cuenta ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="mb-1 text-xl font-bold text-slate-900">Crea tu cuenta</h1>
            <p className="mb-6 text-sm text-slate-500">Paso 1 de 4 — Solo toma 30 segundos</p>

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
              <div className="flex items-start gap-2 pt-1">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-green-600"
                />
                <label htmlFor="acceptTerms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                  Acepto los{' '}
                  <Link href="/terminos" target="_blank" className="text-green-600 underline hover:text-green-700">
                    Términos y Condiciones
                  </Link>{' '}
                  y el{' '}
                  <Link href="/privacidad" target="_blank" className="text-green-600 underline hover:text-green-700">
                    Aviso de Privacidad
                  </Link>{' '}
                  de misremates.
                </label>
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading || !acceptedTerms}>
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
            <p className="mb-5 text-sm text-slate-500">Paso 2 de 4 — Puedes cambiarlo cuando quieras</p>

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
              {!accountCreated && (
                <Button
                  variant="ghost"
                  className="w-full gap-2 text-slate-500"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4" /> Volver
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ─ STEP 3: Tienda ─────────────────────────────────────────── */}
        {step === 3 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="mb-1 text-xl font-bold text-slate-900">Crea tu tienda</h1>
            <p className="mb-2 text-sm text-slate-500">Paso 3 de 4 — ¡Ya casi terminamos!</p>

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
                <p className="text-xs text-slate-400">Este será el nombre visible en tu tienda pública</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp de contacto</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+52 555 123 4567"
                  {...storeForm.register('whatsapp')}
                />
                <p className="text-xs text-slate-400">Los compradores te contactarán aquí</p>
                {storeForm.formState.errors.whatsapp && (
                  <p className="text-xs text-red-500">{storeForm.formState.errors.whatsapp.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />}
                Crear tienda y continuar
              </Button>
            </form>
          </div>
        )}

        {/* ─ STEP 4: Primer producto ─────────────────────────────────── */}
        {step === 4 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="mb-1 text-xl font-bold text-slate-900">Agrega tu primer producto</h1>
            <p className="mb-2 text-sm text-slate-500">Paso 4 de 4 — Puedes omitir este paso si quieres</p>

            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">¡Tienda creada exitosamente! Ahora publica tu primer remate.</p>
            </div>

            <form onSubmit={productForm.handleSubmit(handleProduct)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nombre del producto *</Label>
                <Input id="title" placeholder="Ej: iPhone 12 Pro 128GB" {...productForm.register('title')} />
                {productForm.formState.errors.title && (
                  <p className="text-xs text-red-500">{productForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio (MXN) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min={1}
                    step={1}
                    placeholder="0"
                    {...productForm.register('price', { valueAsNumber: true })}
                  />
                  {productForm.formState.errors.price && (
                    <p className="text-xs text-red-500">{productForm.formState.errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select onValueChange={(v) => productForm.setValue('category', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {productForm.formState.errors.category && (
                    <p className="text-xs text-red-500">{productForm.formState.errors.category.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Condición *</Label>
                <Select
                  defaultValue="buen_estado"
                  onValueChange={(v) => productForm.setValue('condition', v as ProductData['condition'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nuevo">Nuevo</SelectItem>
                    <SelectItem value="como_nuevo">Como nuevo</SelectItem>
                    <SelectItem value="buen_estado">Buen estado</SelectItem>
                    <SelectItem value="usado">Usado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Estado, accesorios incluidos, detalles..."
                  rows={3}
                  {...productForm.register('description')}
                />
              </div>

              <div className="space-y-2">
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                  Publicar producto e ir al panel
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-slate-500"
                  onClick={() => router.push('/dashboard')}
                  disabled={loading}
                >
                  Omitir por ahora, ir al panel
                </Button>
              </div>
            </form>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-slate-400">
          Al registrarte aceptas nuestros{' '}
          <Link href="/terminos" className="underline">Términos y Condiciones</Link>
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
