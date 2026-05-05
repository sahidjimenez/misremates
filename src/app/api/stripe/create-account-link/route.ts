import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
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

  const accountId = profile?.stripe_account_id
  if (!accountId) {
    return NextResponse.json({ error: 'No Stripe account found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard/connect`,
    return_url: `${appUrl}/dashboard/connect?connected=true`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}
