import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { StoreContent } from '@/components/store/store-content'
import { getUserPlan } from '@/lib/plans'
import { PLANS } from '@/lib/stripe'

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
    .select('*, seller_profiles(display_name, city, state, stripe_account_id, stripe_onboarding_complete)')
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

  const seller = store.seller_profiles as {
    display_name: string
    city?: string
    state?: string
    stripe_account_id?: string | null
    stripe_onboarding_complete?: boolean
  } | null

  // Check if seller can accept online payments
  let canPayOnline = false
  if (seller?.stripe_account_id && seller.stripe_onboarding_complete) {
    const planKey = await getUserPlan(store.user_id)
    canPayOnline = PLANS[planKey].onlinePayments
  }

  const storeProducts = (products ?? []).map((p) => ({
    ...p,
    stock: p.stock ?? null,
    store: { slug: store.slug, whatsapp: store.whatsapp, name: store.name },
  }))

  return (
    <>
      <Navbar />
      <main>
        <StoreContent
          storeSlug={storeSlug}
          storeName={store.name}
          storeDescription={store.description}
          whatsapp={store.whatsapp}
          seller={seller}
          canPayOnline={canPayOnline}
          products={storeProducts}
        />
      </main>
      <Footer />
    </>
  )
}
