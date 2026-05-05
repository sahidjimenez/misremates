import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('seller_profiles')
    .select('stripe_account_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (profile?.stripe_account_id) {
    return NextResponse.json({ accountId: profile.stripe_account_id })
  }

  const account = await stripe.accounts.create({
    type: 'express',
    country: 'MX',
    email: user.email!,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { supabase_user_id: user.id },
  })

  await supabase
    .from('seller_profiles')
    .update({ stripe_account_id: account.id, stripe_onboarding_complete: false })
    .eq('user_id', user.id)

  return NextResponse.json({ accountId: account.id })
}
