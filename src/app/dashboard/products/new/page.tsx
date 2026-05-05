'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Upload, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UpgradeModal } from '@/components/shared/upgrade-modal'
import { createClient } from '@/lib/supabase/client'
import { generateUniqueSlug } from '@/lib/utils'

const CATEGORIES = [
  'Electrónica', 'Ropa y calzado', 'Muebles', 'Hogar', 'Juguetes',
  'Deportes', 'Vehículos', 'Libros', 'Arte', 'Joyería', 'Herramientas', 'Otros',
]

const schema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(120),
  description: z.string().max(1000).optional(),
  price: z.number({ message: 'El precio debe ser mayor a 0' }).positive('El precio debe ser mayor a 0'),
  category: z.string().min(1, 'Selecciona una categoría'),
  condition: z.enum(['nuevo', 'como_nuevo', 'buen_estado', 'usado']),
  status: z.enum(['draft', 'active']),
})

type FormData = z.infer<typeof schema>

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')
  const [storeId, setStoreId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', condition: 'buen_estado' },
  })

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      setStoreId(store?.id ?? null)
    }
    init()
  }, [])

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 4 - images.length)
    const newImages = [...images, ...files].slice(0, 4)
    setImages(newImages)
    const newPreviews = newImages.map((f) => URL.createObjectURL(f))
    setPreviews(newPreviews)
  }

  function removeImage(index: number) {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setImages(newImages)
    setPreviews(newPreviews)
  }

  async function onSubmit(data: FormData) {
    if (!userId) return toast.error('Debes iniciar sesión')

    setLoading(true)
    const supabase = createClient()

    // Check limits via API
    const res = await fetch('/api/products/check-limits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: data.price }),
    })
    const limitsResult = await res.json()

    if (!limitsResult.canAddProduct) {
      setUpgradeReason(limitsResult.reason)
      setUpgradeOpen(true)
      setLoading(false)
      return
    }

    if (!storeId) {
      toast.error('Primero crea tu tienda en "Mi tienda"')
      setLoading(false)
      return
    }

    // Upload images
    const imageUrls: string[] = []
    for (const file of images) {
      const ext = file.name.split('.').pop()
      const path = `products/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data: uploaded, error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: false })

      if (!error && uploaded) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
        imageUrls.push(urlData.publicUrl)
      }
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
      images: imageUrls,
      status: data.status,
      is_featured: false,
    })

    if (error) {
      toast.error('Error al crear el producto')
    } else {
      toast.success('¡Producto publicado!')
      router.push('/dashboard/products')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nuevo producto</h1>
        <p className="text-sm text-slate-500">Publica un artículo en tu tienda de remates</p>
      </div>

      {!storeId && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <p className="text-sm text-amber-700">
            Necesitas <a href="/dashboard/store" className="font-medium underline">crear tu tienda</a> primero para publicar productos.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Título del producto *</Label>
              <Input id="title" placeholder="Ej: iPhone 12 Pro 128GB negro" {...register('title')} />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Detalla el estado, características, incluye o no accesorios..."
                rows={4}
                {...register('description')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Precio de remate (MXN) *</Label>
                <Input
                  id="price"
                  type="number"
                  min={1}
                  step={1}
                  placeholder="0"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select onValueChange={(v) => setValue('category', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Condición *</Label>
                <Select
                  defaultValue="buen_estado"
                  onValueChange={(v) => setValue('condition', v as FormData['condition'])}
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
                <Label>Estado de publicación</Label>
                <Select
                  defaultValue="active"
                  onValueChange={(v) => setValue('status', v as FormData['status'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo (visible)</SelectItem>
                    <SelectItem value="draft">Borrador (oculto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fotos del producto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {images.length < 4 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:border-green-400 hover:bg-green-50 transition-colors">
                  <Upload className="h-6 w-6 text-slate-400" />
                  <span className="mt-1 text-xs text-slate-400">Subir foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400">Máximo 4 fotos. Formatos: JPG, PNG, WebP.</p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading || !storeId} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Publicar producto
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason={upgradeReason}
      />
    </div>
  )
}
