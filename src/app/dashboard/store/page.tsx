'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Save, Loader2, Store, ExternalLink } from 'lucide-react'
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
        reset({ name: data.name, description: data.description ?? '', whatsapp: data.whatsapp ?? '' })
      }
    }
    loadStore()
  }, [reset])

  async function onSubmit(data: FormData) {
    if (!userId) return
    setLoading(true)
    const supabase = createClient()

    if (store) {
      const { error } = await supabase
        .from('stores')
        .update({ name: data.name, description: data.description, whatsapp: data.whatsapp })
        .eq('id', store.id)

      if (error) toast.error('Error al guardar')
      else toast.success('Tienda actualizada')
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
          status: 'active',
        })
        .select('id, slug')
        .single()

      if (error) toast.error('Error al crear la tienda')
      else {
        setStore({ id: newStore.id, slug: newStore.slug })
        toast.success('¡Tienda creada!')
      }
    }
    setLoading(false)
  }

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
