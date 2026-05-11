'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Save, Loader2, Store, ExternalLink, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { slugify, generateUniqueSlug } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(60, 'Máximo 60 caracteres'),
  description: z.string().max(300, 'Máximo 300 caracteres').optional(),
  whatsapp: z.string().regex(/^[0-9+\s()-]{10,20}$/, 'Número inválido').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function StorePage() {
  const [loading, setLoading] = useState(false)
  const [store, setStore] = useState<{ id: string; slug: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    async function loadStore() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (data) {
        setStore({ id: data.id, slug: data.slug })
        setLogoUrl(data.logo_url ?? null)
        reset({ name: data.name, description: data.description ?? '', whatsapp: data.whatsapp ?? '' })
      }
    }
    loadStore()
  }, [reset])

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function removeLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadLogo(userId: string): Promise<string | null> {
    if (!logoFile) return logoUrl
    const supabase = createClient()
    const ext = logoFile.name.split('.').pop()
    const path = `logos/${userId}/${Date.now()}.${ext}`
    const { data: uploaded, error } = await supabase.storage
      .from('product-images')
      .upload(path, logoFile, { upsert: true })
    if (error || !uploaded) return logoUrl
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
    return urlData.publicUrl
  }

  async function onSubmit(data: FormData) {
    if (!userId) return
    setLoading(true)
    const supabase = createClient()

    const newLogoUrl = await uploadLogo(userId)

    if (store) {
      const { error } = await supabase
        .from('stores')
        .update({ name: data.name, description: data.description, whatsapp: data.whatsapp, logo_url: newLogoUrl })
        .eq('id', store.id)

      if (error) toast.error('Error al guardar')
      else {
        setLogoUrl(newLogoUrl)
        setLogoFile(null)
        setLogoPreview(null)
        toast.success('Tienda actualizada')
      }
    } else {
      const slug = generateUniqueSlug(data.name)
      const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
        .single()

      let sellerProfileId = sellerProfile?.id

      if (!sellerProfileId) {
        const { data: newProfile } = await supabase
          .from('seller_profiles')
          .insert({ user_id: userId, display_name: data.name })
          .select('id')
          .single()
        sellerProfileId = newProfile?.id
      }

      const { data: newStore, error } = await supabase
        .from('stores')
        .insert({
          user_id: userId,
          seller_profile_id: sellerProfileId,
          name: data.name,
          slug,
          description: data.description,
          whatsapp: data.whatsapp,
          logo_url: newLogoUrl,
          status: 'active',
        })
        .select('id, slug')
        .single()

      if (error) toast.error('Error al crear la tienda')
      else {
        setStore({ id: newStore.id, slug: newStore.slug })
        setLogoUrl(newLogoUrl)
        setLogoFile(null)
        setLogoPreview(null)
        toast.success('¡Tienda creada!')
      }
    }
    setLoading(false)
  }

  const displayLogo = logoPreview ?? logoUrl

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi tienda</h1>
        <p className="text-sm text-slate-500">
          {store ? 'Edita la información de tu tienda pública' : 'Crea tu tienda para empezar a vender'}
        </p>
      </div>

      {store && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <Store className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">
            Tu tienda está en:{' '}
            <code className="font-mono font-semibold">misremates.com.mx/s/{store.slug}</code>
          </span>
          <a href={`/s/${store.slug}`} target="_blank" rel="noopener noreferrer" className="ml-auto">
            <Button variant="ghost" size="sm" className="gap-1 text-green-700">
              <ExternalLink className="h-3 w-3" />Ver
            </Button>
          </a>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{store ? 'Información de la tienda' : 'Crear tienda'}</CardTitle>
          <CardDescription>Esta información es visible para tus compradores</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo de la tienda</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
                  {displayLogo ? (
                    <>
                      <img src={displayLogo} alt="Logo" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Store className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleLogoSelect}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {displayLogo ? 'Cambiar logo' : 'Subir logo'}
                  </Button>
                  <p className="text-xs text-slate-400">PNG, JPG o WebP. Recomendado: 200×200 px</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la tienda *</Label>
              <Input id="name" placeholder="Ej: Remates González" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente lo que vendes..."
                rows={3}
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp para contacto</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+52 555 123 4567"
                {...register('whatsapp')}
              />
              <p className="text-xs text-slate-500">Los compradores te contactarán por este número</p>
              {errors.whatsapp && <p className="text-xs text-red-500">{errors.whatsapp.message}</p>}
            </div>

            <Button type="submit" className="gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {store ? 'Guardar cambios' : 'Crear tienda'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
