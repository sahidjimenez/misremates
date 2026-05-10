import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { ProductPageClient } from '@/components/store/product-page-client'
import { ProductImageCarousel } from '@/components/store/product-image-carousel'
import { formatCurrency, formatDate, getConditionLabel } from '@/lib/utils'
import { getUserPlan } from '@/lib/plans'
import { PLANS } from '@/lib/stripe'

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
    .select('*, stores!inner(id, slug, name, whatsapp, status, user_id, seller_profiles(stripe_account_id, stripe_onboarding_complete))')
    .eq('slug', productSlug)
    .eq('stores.slug', storeSlug)
    .eq('status', 'active')
    .single()

  if (!product) notFound()

  const store = product.stores as {
    id: string
    slug: string
    name: string
    whatsapp: string | null
    status: string
    user_id: string
    seller_profiles: { stripe_account_id: string | null; stripe_onboarding_complete: boolean } | null
  }
  const stock: number | null = product.stock ?? null

  const whatsappMsg = encodeURIComponent(
    `Hola, me interesa el producto: *${product.title}* por ${formatCurrency(product.price)}. Vi tu tienda en misremates.com.mx`
  )
  const whatsappUrl = store.whatsapp
    ? `https://wa.me/${store.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`
    : null

  let canPayOnline = false
  const sp = store.seller_profiles
  if (sp?.stripe_account_id && sp.stripe_onboarding_complete) {
    const planKey = await getUserPlan(store.user_id)
    canPayOnline = PLANS[planKey].onlinePayments
  }

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
          <ProductImageCarousel
            images={product.images ?? []}
            title={product.title}
          />

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

            <ProductPageClient
              storeSlug={storeSlug}
              whatsapp={store.whatsapp}
              canPayOnline={canPayOnline}
              productId={product.id}
              productSlug={product.slug}
              title={product.title}
              price={product.price}
              image={product.images?.[0] ?? null}
              stock={stock}
              whatsappUrl={whatsappUrl}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
