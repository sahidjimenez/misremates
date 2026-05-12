import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/plans'
import { PLANS } from '@/lib/stripe'
import { ProductsList } from './products-list'

export const metadata = { title: 'Mis productos' }

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: products }, { data: profile }] = await Promise.all([
    supabase.from('products').select('*, stores(slug, name)').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('seller_profiles').select('stripe_account_id, stripe_onboarding_complete').eq('user_id', user.id).single(),
  ])

  let stripeEnabled = false
  if (profile?.stripe_account_id && profile.stripe_onboarding_complete) {
    const planKey = await getUserPlan(user.id)
    stripeEnabled = PLANS[planKey].onlinePayments
  }

  return (
    <div className="space-y-6">
      <ProductsList initialProducts={(products ?? []) as any} stripeEnabled={stripeEnabled} />
    </div>
  )
}
