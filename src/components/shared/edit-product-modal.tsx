'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, X, Upload, Trash2, AlertTriangle } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  'Electrónica', 'Ropa y calzado', 'Muebles', 'Hogar', 'Juguetes',
  'Deportes', 'Vehículos', 'Libros', 'Arte', 'Joyería', 'Herramientas', 'Otros',
]

const schema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(120),
  description: z.string().max(1000).optional(),
  price: z.number({ message: 'El precio debe ser mayor a 0' }).positive('El precio debe ser mayor a 0'),
  stock: z.number().int().min(1).optional().nullable(),
  category: z.string().min(1, 'Selecciona una categoría'),
  condition: z.enum(['nuevo', 'como_nuevo', 'buen_estado', 'usado']),
  status: z.enum(['draft', 'active', 'paused', 'sold']),
})

type FormData = z.infer<typeof schema>

export interface ProductForEdit {
  id: string
  user_id: string
  title: string
  description?: string | null
  price: number
  stock?: number | null
  category: string
  condition: string
  images: string[]
  status: string
}

interface EditProductModalProps {
  product: ProductForEdit | null
  open: boolean
  onClose: () => void
  onUpdated: (updated: ProductForEdit) => void
  onDeleted: (id: string) => void
}

export function EditProductModal({ product, open, onClose, onUpdated, onDeleted }: EditProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Reset form whenever product changes
  useEffect(() => {
    if (!product) return
    reset({
      title: product.title,
      description: product.description ?? '',
      price: product.price,
      stock: product.stock ?? undefined,
      category: product.category,
      condition: product.condition as FormData['condition'],
      status: product.status as FormData['status'],
    })
    setExistingImages(product.images ?? [])
    setNewFiles([])
    setNewPreviews([])
    setConfirmDelete(false)
  }, [product, reset])

  function handleClose() {
    setConfirmDelete(false)
    onClose()
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const totalSlots = 4 - existingImages.length - newFiles.length
    if (totalSlots <= 0) return
    const picked = Array.from(e.target.files ?? []).slice(0, totalSlots)
    const merged = [...newFiles, ...picked]
    setNewFiles(merged)
    setNewPreviews(merged.map((f) => URL.createObjectURL(f)))
    e.target.value = ''
  }

  function removeExisting(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  function removeNew(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
    setNewPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: FormData) {
    if (!product) return
    setLoading(true)

    const supabase = createClient()

    // Upload new images
    const uploadedUrls: string[] = []
    for (const file of newFiles) {
      const ext = file.name.split('.').pop()
      const path = `products/${product.user_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data: uploaded, error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: false })

      if (!error && uploaded) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
        uploadedUrls.push(urlData.publicUrl)
      }
    }

    const allImages = [...existingImages, ...uploadedUrls]

    const res = await fetch('/api/products/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: product.id, ...data, images: allImages }),
    })

    const result = await res.json()

    if (!res.ok) {
      toast.error('Error al actualizar el producto')
      setLoading(false)
      return
    }

    toast.success('Producto actualizado')
    onUpdated({ ...product, ...data, images: allImages })
    handleClose()
    setLoading(false)
  }

  async function handleDelete() {
    if (!product) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setLoading(true)
    const res = await fetch(`/api/products/delete?id=${product.id}`, { method: 'DELETE' })

    if (!res.ok) {
      toast.error('Error al eliminar el producto')
      setLoading(false)
      return
    }

    toast.success('Producto eliminado')
    onDeleted(product.id)
    handleClose()
    setLoading(false)
  }

  const totalImages = existingImages.length + newFiles.length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título *</Label>
            <Input id="edit-title" {...register('title')} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea id="edit-description" rows={3} {...register('description')} />
          </div>

          {/* Price + Stock */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Precio (MXN) *</Label>
              <Input
                id="edit-price"
                type="number"
                min={1}
                step={1}
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-stock">Cantidad en stock</Label>
              <Input
                id="edit-stock"
                type="number"
                min={1}
                step={1}
                placeholder="Vacío = ilimitado"
                {...register('stock', { valueAsNumber: true, setValueAs: (v) => v === '' || isNaN(v) ? null : Number(v) })}
              />
              <p className="text-xs text-slate-400">Vacío = sin límite de stock</p>
            </div>
          </div>

          {/* Category */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select
                defaultValue={product?.category}
                onValueChange={(v) => setValue('category', v)}
              >
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

          {/* Condition + Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Condición *</Label>
              <Select
                defaultValue={product?.condition}
                onValueChange={(v) => setValue('condition', v as FormData['condition'])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                defaultValue={product?.status}
                onValueChange={(v) => setValue('status', v as FormData['status'])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo (visible)</SelectItem>
                  <SelectItem value="draft">Borrador (oculto)</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="sold">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Fotos ({totalImages}/4)</Label>
            <div className="grid grid-cols-4 gap-2">
              {/* Existing images */}
              {existingImages.map((url, i) => (
                <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExisting(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* New image previews */}
              {newPreviews.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Upload slot */}
              {totalImages < 4 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:border-green-400 hover:bg-green-50 transition-colors">
                  <Upload className="h-5 w-5 text-slate-400" />
                  <span className="mt-1 text-xs text-slate-400">Subir</span>
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
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>

            <div className="ml-auto">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" /> ¿Confirmar?
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={loading}
                    className="gap-1"
                  >
                    {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                    Sí, eliminar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                    disabled={loading}
                  >
                    No
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                  className="gap-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
