import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, MapPin, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/shared/product-card'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types'

interface Props {
  params: Promise<{ storeSlug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { storeSlug } = await params
  const supabase = await createClient()
  const { data: store } = await supabase
    .from('stores')
    .select('name, description')
    .eq('slug', storeSlug)
    .single()

  if (!store) return { title: 'Tienda no encontrada' }

  return {
    title: store.name,
    description: store.description ?? `Tienda de remates: ${store.name}`,
  }
}

export default async function StorePage({ params }: Props) {
  const { storeSlug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('*, seller_profiles(display_name, city, state)')
    .eq('slug', storeSlug)
    .eq('status', 'active')
    .single()

  if (!store) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  const seller = store.seller_profiles as { display_name: string; city?: string; state?: string } | null

  const whatsappUrl = store.whatsapp
    ? `https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, vi tu tienda en misremates.com.mx y me gustaría más información.`)}`
    : null

  return (
    <>
      <Navbar />
      <main>
        {/* Store header */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-2xl font-bold text-white shadow-md">
                  {store.name[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{store.name}</h1>
                  {seller && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      {(seller.city || seller.state) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[seller.city, seller.state].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                  {store.description && (
                    <p className="mt-2 text-sm text-slate-600 max-w-lg">{store.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-1">
                  <Package className="h-3 w-3" />
                  {products?.length ?? 0} productos
                </Badge>
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <button className="flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#20BA5A]">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products grid */}
        <div className="mx-auto max-w-7xl px-4 py-8">
          {!products?.length ? (
            <div className="py-20 text-center">
              <Package className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">Esta tienda aún no tiene productos publicados</p>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-xl font-semibold text-slate-900">
                Remates disponibles
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{ ...product, store: { slug: store.slug, whatsapp: store.whatsapp, name: store.name } }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
