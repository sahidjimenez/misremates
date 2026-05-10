import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type Stripe from 'stripe'
import { stripe, PLANS, type PlanKey } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'

function planKeyFromPriceId(priceId: string): PlanKey {
  const entry = (Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][])
    .find(([, p]) => p.stripePriceId === priceId)
  return entry?.[0] ?? 'free'
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
          const customerId = session.customer as string
          const subscriptionId = session.subscription as string
          const userId = session.metadata?.supabase_user_id

          if (userId && subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const priceId = subscription.items.data[0]?.price.id
            const planKey = planKeyFromPriceId(priceId)

            const sub = subscription as unknown as { current_period_end: number; status: string }
            await supabase.from('subscriptions').upsert({
              user_id: userId,
              plan_key: planKey,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: sub.status,
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            }, { onConflict: 'user_id' })
          }
        }

        if (session.mode === 'payment') {
          const orderId = session.metadata?.order_id
          if (orderId) {
            const paymentIntentId = session.payment_intent as string
            await supabase
              .from('orders')
              .update({ status: 'paid', stripe_payment_intent_id: paymentIntentId })
              .eq('id', orderId)

            await supabase.from('payments').insert({
              order_id: orderId,
              stripe_payment_intent_id: paymentIntentId,
              status: 'succeeded',
            })

            const { data: order } = await supabase
              .from('orders')
              .select('product_id')
              .eq('id', orderId)
              .single()

            if (order?.product_id) {
              await supabase
                .from('products')
                .update({ status: 'sold' })
                .eq('id', order.product_id)
            }
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const subData = subscription as unknown as { current_period_end: number; status: string; metadata: Record<string, string>; items: { data: Array<{ price: { id: string } }> }; id: string }

        const priceId = subData.items.data[0]?.price.id
        const planKey = planKeyFromPriceId(priceId)

        await supabase
          .from('subscriptions')
          .update({
            plan_key: planKey,
            status: subData.status,
            current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subData.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account

        // charges_enabled is sufficient to accept payments and receive transfers.
        // payouts_enabled (bank account verification) can lag days in MX — don't block on it.
        if (account.charges_enabled) {
          await supabase
            .from('seller_profiles')
            .update({ stripe_onboarding_complete: true })
            .eq('stripe_account_id', account.id)
        }
        break
      }

      default:
        console.log(`Unhandled event: ${event.type}`)
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
