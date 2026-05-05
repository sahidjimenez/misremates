import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'

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

            const { data: plan } = await supabase
              .from('plans')
              .select('id')
              .eq('stripe_price_id', priceId)
              .single()

            await supabase.from('subscriptions').upsert({
              user_id: userId,
              plan_id: plan?.id,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
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
        const userId = subscription.metadata?.supabase_user_id

        if (userId) {
          const priceId = subscription.items.data[0]?.price.id
          const { data: plan } = await supabase
            .from('plans')
            .select('id')
            .eq('stripe_price_id', priceId)
            .single()

          await supabase
            .from('subscriptions')
            .update({
              plan_id: plan?.id,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)
        }
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

        if (account.charges_enabled && account.payouts_enabled) {
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
