import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { stripe, calculatePlatformFee } from '@/lib/stripe'
import { getUserPlan } from '@/lib/plans'
import { PLANS } from '@/lib/stripe'

const schema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(100),
  })).min(1).max(20),
  buyerEmail: z.string().email(),
  buyerName: z.string().min(2),
})

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { items, buyerEmail, buyerName } = parsed.data
  const supabase = createAdminClient()

  const productIds = items.map((i) => i.productId)
  const { data: products } = await supabase
    .from('products')
    .select('*, stores(id, slug, user_id, seller_profiles(stripe_account_id, stripe_onboarding_complete))')
    .in('id', productIds)
    .eq('status', 'active')

  if (!products || products.length !== productIds.length) {
    return NextResponse.json({ error: 'Uno o más productos no están disponibles' }, { status: 400 })
  }

  // All products must belong to the same store
  const storeIds = new Set(products.map((p) => (p.stores as { id: string }).id))
  if (storeIds.size > 1) {
    return NextResponse.json({ error: 'El carrito solo puede tener productos de una tienda' }, { status: 400 })
  }

  const firstProduct = products[0]
  const store = firstProduct.stores as { id: string; slug: string; user_id: string }
  const sellerProfile = (firstProduct.stores as any)?.seller_profiles

  if (!sellerProfile?.stripe_account_id || !sellerProfile.stripe_onboarding_complete) {
    return NextResponse.json({ error: 'Este vendedor no tiene pagos en línea configurados' }, { status: 400 })
  }

  const planKey = await getUserPlan(store.user_id)
  const plan = PLANS[planKey]

  if (!plan.onlinePayments) {
    return NextResponse.json({ error: 'El plan del vendedor no soporta pagos en línea' }, { status: 403 })
  }

  // Validate stock for each item
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!
    if (product.stock !== null && product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Stock insuficiente para "${product.title}". Disponible: ${product.stock}` },
        { status: 400 }
      )
    }
  }

  // Build line items and create orders
  const orderIds: string[] = []
  const lineItems: { quantity: number; price_data: { currency: string; unit_amount: number; product_data: { name: string; description?: string; images: string[] } } }[] = []
  let totalPlatformFee = 0

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!
    const amountCents = Math.round(product.price * 100)
    const feeCents = calculatePlatformFee(amountCents * item.quantity, plan.commissionPercentage)
    totalPlatformFee += feeCents

    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: 'mxn',
        unit_amount: amountCents,
        product_data: {
          name: product.title,
          description: product.description ?? undefined,
          images: product.images?.slice(0, 1) ?? [],
        },
      },
    })

    const { data: order } = await supabase
      .from('orders')
      .insert({
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        product_id: product.id,
        seller_user_id: store.user_id,
        store_id: store.id,
        amount: product.price * item.quantity,
        platform_fee: feeCents / 100,
        seller_amount: (amountCents * item.quantity - feeCents) / 100,
        status: 'pending',
      })
      .select('id')
      .single()

    if (order?.id) orderIds.push(order.id)
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: buyerEmail,
    line_items: lineItems,
    payment_intent_data: {
      application_fee_amount: totalPlatformFee,
      transfer_data: { destination: sellerProfile.stripe_account_id },
      metadata: { order_ids: orderIds.join(',') },
    },
    success_url: `${appUrl}/s/${store.slug}?paid=true`,
    cancel_url: `${appUrl}/s/${store.slug}`,
    metadata: { order_ids: orderIds.join(',') },
  })

  return NextResponse.json({ url: session.url })
}
