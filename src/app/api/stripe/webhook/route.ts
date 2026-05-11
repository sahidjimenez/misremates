import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { stripe, PLANS, type PlanKey } from '@/lib/stripe'

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

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

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
          const customerId = session.customer as string
          const subscriptionId = session.subscription as string
          const userId = session.metadata?.supabase_user_id

          console.log('[webhook] checkout.session.completed', { userId, subscriptionId, customerId })

          if (userId && subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            console.log('[webhook] subscription retrieved', { status: subscription.status, id: subscription.id })

            const priceId = subscription.items.data[0]?.price.id
            const planKey = planKeyFromPriceId(priceId)
            console.log('[webhook] planKey resolved', { priceId, planKey })

            // In Stripe SDK v22+ (API 2026-04-22.dahlia) current_period_end moved to
            // the subscription item level
            const periodEndTs = subscription.items.data[0]?.current_period_end ?? null
            const periodEndIso = periodEndTs ? new Date(periodEndTs * 1000).toISOString() : null

            console.log('[webhook] upserting subscription', { userId, planKey, periodEndIso })

            const { error: upsertError } = await supabase.from('subscriptions').upsert({
              user_id: userId,
              plan_key: planKey,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: subscription.status,
              current_period_end: periodEndIso,
            }, { onConflict: 'user_id' })

            if (upsertError) {
              console.error('[webhook] upsert error', upsertError)
              throw new Error(`Supabase upsert failed: ${upsertError.message}`)
            }

            console.log('[webhook] subscription upserted successfully')
          }
        }

        if (session.mode === 'payment') {
          const paymentIntentId = session.payment_intent as string
          // Support both single order_id and cart order_ids (comma-separated)
          const orderIds = session.metadata?.order_ids
            ? session.metadata.order_ids.split(',').filter(Boolean)
            : session.metadata?.order_id
            ? [session.metadata.order_id]
            : []

          for (const orderId of orderIds) {
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

        const priceId = subscription.items.data[0]?.price.id
        const planKey = planKeyFromPriceId(priceId)

        const periodEndTs = subscription.items.data[0]?.current_period_end ?? null
        const periodEndIso = periodEndTs ? new Date(periodEndTs * 1000).toISOString() : null

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            plan_key: planKey,
            status: subscription.status,
            current_period_end: periodEndIso,
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('[webhook] subscription.updated error', updateError)
          throw new Error(`Supabase update failed: ${updateError.message}`)
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
