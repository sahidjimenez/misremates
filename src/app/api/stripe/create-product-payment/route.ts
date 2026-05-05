import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { stripe, calculatePlatformFee } from '@/lib/stripe'
import { getUserPlan } from '@/lib/plans'
import { PLANS } from '@/lib/stripe'

const schema = z.object({
  productId: z.string().uuid(),
  buyerEmail: z.string().email(),
  buyerName: z.string().min(2),
})

export async function POST(request: Request) {
  const supabase = await createClient()

  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { productId, buyerEmail, buyerName } = parsed.data

  const { data: product } = await supabase
    .from('products')
    .select('*, stores(id, user_id, seller_profiles(stripe_account_id, stripe_onboarding_complete))')
    .eq('id', productId)
    .eq('status', 'active')
    .single()

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const store = product.stores as { id: string; user_id: string }
  const sellerProfile = (product.stores as any)?.seller_profiles

  if (!sellerProfile?.stripe_account_id || !sellerProfile.stripe_onboarding_complete) {
    return NextResponse.json({ error: 'Seller payment account not configured' }, { status: 400 })
  }

  const planKey = await getUserPlan(store.user_id)
  const plan = PLANS[planKey]

  if (!plan.onlinePayments) {
    return NextResponse.json({ error: 'Seller plan does not support online payments' }, { status: 403 })
  }

  const amountCents = Math.round(product.price * 100)
  const platformFeeCents = calculatePlatformFee(amountCents, plan.commissionPercentage)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const { data: order } = await supabase
    .from('orders')
    .insert({
      buyer_email: buyerEmail,
      buyer_name: buyerName,
      product_id: productId,
      seller_user_id: store.user_id,
      store_id: store.id,
      amount: product.price,
      platform_fee: platformFeeCents / 100,
      seller_amount: (amountCents - platformFeeCents) / 100,
      status: 'pending',
    })
    .select('id')
    .single()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: buyerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'mxn',
          unit_amount: amountCents,
          product_data: {
            name: product.title,
            description: product.description ?? undefined,
            images: product.images?.slice(0, 1) ?? [],
          },
        },
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFeeCents,
      transfer_data: { destination: sellerProfile.stripe_account_id },
      metadata: { order_id: order?.id ?? '', product_id: productId },
    },
    success_url: `${appUrl}/s/${product.stores?.slug ?? ''}/p/${product.slug}?paid=true`,
    cancel_url: `${appUrl}/s/${product.stores?.slug ?? ''}/p/${product.slug}`,
    metadata: { order_id: order?.id ?? '' },
  })

  return NextResponse.json({ url: session.url })
}
