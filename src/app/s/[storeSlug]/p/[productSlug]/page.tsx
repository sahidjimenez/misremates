import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, ChevronLeft, MapPin, Tag, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, getConditionLabel } from '@/lib/utils'

interface Props {
  params: Promise<{ storeSlug: string; productSlug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { productSlug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('title, description')
    .eq('slug', productSlug)
    .single()

  if (!product) return { title: 'Producto no encontrado' }
  return { title: product.title, description: product.description ?? product.title }
}

export default async function ProductPage({ params }: Props) {
  const { storeSlug, productSlug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, stores!inner(slug, name, whatsapp, status)')
    .eq('slug', productSlug)
    .eq('stores.slug', storeSlug)
    .eq('status', 'active')
    .single()

  if (!product) notFound()

  const store = product.stores as { slug: string; name: string; whatsapp: string | null; status: string }

  const whatsappMsg = encodeURIComponent(
    `Hola, me interesa el producto: *${product.title}* por ${formatCurrency(product.price)}. Vi tu tienda en misremates.com.mx`
  )
  const whatsappUrl = store.whatsapp
    ? `https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`
    : null

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Link
          href={`/s/${storeSlug}`}
          className="mb-6 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a {store.name}
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Tag className="h-20 w-20 text-slate-300" />
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((img: string, i: number) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="accent" className="text-sm">🔥 EN REMATE</Badge>
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant="secondary">{getConditionLabel(product.condition)}</Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{product.title}</h1>
            </div>

            <div>
              <p className="text-4xl font-extrabold text-orange-600">
                {formatCurrency(product.price)}
              </p>
              <p className="mt-1 text-sm text-slate-400">Precio de remate</p>
            </div>

            {product.description && (
              <div>
                <h3 className="mb-2 font-semibold text-slate-900">Descripción</h3>
                <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                <Package className="h-4 w-4" />
                <Link href={`/s/${storeSlug}`} className="font-medium text-green-600 hover:underline">
                  {store.name}
                </Link>
              </div>
              <p className="text-xs text-slate-400">Publicado el {formatDate(product.created_at)}</p>
            </div>

            {whatsappUrl ? (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white">
                  <MessageCircle className="h-5 w-5" />
                  Contactar por WhatsApp
                </Button>
              </a>
            ) : (
              <Button size="lg" className="w-full" disabled>
                Vendedor sin WhatsApp configurado
              </Button>
            )}

            <p className="text-center text-xs text-slate-400">
              Este vendedor usa misremates.com.mx
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
