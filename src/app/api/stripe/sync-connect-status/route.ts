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
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('user_id', user.id)
    .single()

  if (!profile?.stripe_account_id) {
    return NextResponse.json({ error: 'No Stripe account linked' }, { status: 400 })
  }

  if (profile.stripe_onboarding_complete) {
    return NextResponse.json({ complete: true, alreadySynced: true })
  }

  try {
    const account = await stripe.accounts.retrieve(profile.stripe_account_id)

    if (account.charges_enabled) {
      await supabase
        .from('seller_profiles')
        .update({ stripe_onboarding_complete: true })
        .eq('user_id', user.id)

      return NextResponse.json({ complete: true })
    }

    return NextResponse.json({ complete: false, detailsSubmitted: account.details_submitted })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al verificar cuenta'
    console.error('[sync-connect-status]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
