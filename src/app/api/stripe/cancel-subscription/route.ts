import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { stripe, PLANS, type PlanKey } from '@/lib/stripe'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id, plan_key, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!subscription?.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
  }

  try {
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
  } catch (err) {
    console.error('[cancel-subscription] Stripe error:', err)
    return NextResponse.json({ error: 'Error al cancelar en Stripe' }, { status: 500 })
  }

  const admin = adminClient()

  // Mark subscription as canceled
  await admin
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('user_id', user.id)

  // If the canceled plan had online payments, disable Stripe Connect and all products
  const hadOnlinePayments = PLANS[subscription.plan_key as PlanKey]?.onlinePayments ?? false

  if (hadOnlinePayments) {
    await admin
      .from('seller_profiles')
      .update({ stripe_onboarding_complete: false })
      .eq('user_id', user.id)

    await admin
      .from('products')
      .update({ accepts_card_payment: false })
      .eq('user_id', user.id)
  }

  return NextResponse.json({ success: true })
}
