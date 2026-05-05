import { createClient } from '@/lib/supabase/server'
import { PLANS, PlanKey } from '@/lib/stripe'
import type { PlanLimits } from '@/types'

export async function getUserPlan(userId: string): Promise<PlanKey> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('subscriptions')
    .select('plans(name), status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (!data) return 'free'
  const planName = (data.plans as unknown as { name: string } | null)?.name
  return (planName as PlanKey) ?? 'free'
}

export async function checkPlanLimits(userId: string, productPrice?: number): Promise<PlanLimits> {
  const supabase = await createClient()
  const planKey = await getUserPlan(userId)
  const plan = PLANS[planKey]

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['active', 'draft', 'paused'])

  const currentProductCount = count ?? 0

  const { data: products } = await supabase
    .from('products')
    .select('price')
    .eq('user_id', userId)
    .in('status', ['active'])

  const currentInventoryValue = products?.reduce((sum, p) => sum + p.price, 0) ?? 0

  if (plan.productLimit !== null && currentProductCount >= plan.productLimit) {
    return {
      canAddProduct: false,
      reason: `Tu plan ${plan.name} permite máximo ${plan.productLimit} productos.`,
      currentProductCount,
      productLimit: plan.productLimit,
      currentInventoryValue,
      maxInventoryValue: plan.maxInventoryValue,
    }
  }

  if (plan.maxInventoryValue !== null && productPrice) {
    const newTotal = currentInventoryValue + productPrice
    if (newTotal > plan.maxInventoryValue) {
      return {
        canAddProduct: false,
        reason: `Tu plan ${plan.name} tiene un límite de inventario de $${plan.maxInventoryValue.toLocaleString()} MXN.`,
        currentProductCount,
        productLimit: plan.productLimit,
        currentInventoryValue,
        maxInventoryValue: plan.maxInventoryValue,
      }
    }
  }

  return {
    canAddProduct: true,
    reason: null,
    currentProductCount,
    productLimit: plan.productLimit,
    currentInventoryValue,
    maxInventoryValue: plan.maxInventoryValue,
  }
}
