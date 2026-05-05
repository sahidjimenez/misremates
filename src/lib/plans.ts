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
    .in('status', ['active', 'paused'])

  const currentInventoryValue = products?.reduce((sum, p) => sum + p.price, 0) ?? 0

  const base = {
    currentProductCount,
    productLimit: plan.productLimit ?? null,
    currentInventoryValue,
    maxInventoryValue: plan.maxInventoryValue ?? null,
    maxProductPrice: plan.maxProductPrice ?? null,
  }

  // 1. Límite por precio individual del producto
  if (productPrice !== undefined && plan.maxProductPrice !== null && productPrice > plan.maxProductPrice) {
    const upgradeTarget = productPrice > 30000 ? 'premium' : productPrice > 1000 ? 'pro' : 'basico'
    return {
      ...base,
      canAddProduct: false,
      upgradeRequired: upgradeTarget,
      reason: `Tu plan ${plan.name} solo permite productos de hasta $${plan.maxProductPrice.toLocaleString('es-MX')} MXN. Este producto vale $${productPrice.toLocaleString('es-MX')} MXN.`,
    }
  }

  // 2. Límite de cantidad de productos
  if (plan.productLimit !== null && currentProductCount >= plan.productLimit) {
    const upgradeTarget = plan.productLimit >= 30 ? 'premium' : plan.productLimit >= 10 ? 'pro' : 'basico'
    return {
      ...base,
      canAddProduct: false,
      upgradeRequired: upgradeTarget,
      reason: `Tu plan ${plan.name} permite máximo ${plan.productLimit} productos.`,
    }
  }

  // 3. Límite de valor total del inventario
  if (plan.maxInventoryValue !== null && productPrice !== undefined) {
    const newTotal = currentInventoryValue + productPrice
    if (newTotal > plan.maxInventoryValue) {
      const upgradeTarget = newTotal > 30000 ? 'premium' : newTotal > 1000 ? 'pro' : 'basico'
      return {
        ...base,
        canAddProduct: false,
        upgradeRequired: upgradeTarget,
        reason: `Agregar este producto llevaría tu inventario a $${newTotal.toLocaleString('es-MX')} MXN, superando el límite de $${plan.maxInventoryValue.toLocaleString('es-MX')} MXN de tu plan ${plan.name}.`,
      }
    }
  }

  return {
    ...base,
    canAddProduct: true,
    upgradeRequired: null,
    reason: null,
  }
}

// Para uso en cliente (sin Supabase server)
export function checkPlanLimitsSync(params: {
  planKey: PlanKey
  currentProductCount: number
  currentInventoryValue: number
  productPrice: number
}): { canAddProduct: boolean; reason: string | null; upgradeRequired: string | null } {
  const { planKey, currentProductCount, currentInventoryValue, productPrice } = params
  const plan = PLANS[planKey]

  if (plan.maxProductPrice !== null && productPrice > plan.maxProductPrice) {
    return {
      canAddProduct: false,
      upgradeRequired: 'basico',
      reason: `Tu plan ${plan.name} solo permite productos de hasta $${plan.maxProductPrice.toLocaleString('es-MX')} MXN. Este producto vale $${productPrice.toLocaleString('es-MX')} MXN.`,
    }
  }

  if (plan.productLimit !== null && currentProductCount >= plan.productLimit) {
    return {
      canAddProduct: false,
      upgradeRequired: planKey === 'free' ? 'basico' : planKey === 'basico' ? 'pro' : 'premium',
      reason: `Alcanzaste el límite de ${plan.productLimit} productos de tu plan ${plan.name}.`,
    }
  }

  if (plan.maxInventoryValue !== null) {
    const newTotal = currentInventoryValue + productPrice
    if (newTotal > plan.maxInventoryValue) {
      return {
        canAddProduct: false,
        upgradeRequired: planKey === 'free' || planKey === 'basico' ? 'pro' : 'premium',
        reason: `Tu inventario llegaría a $${newTotal.toLocaleString('es-MX')} MXN, superando el límite de $${plan.maxInventoryValue.toLocaleString('es-MX')} MXN.`,
      }
    }
  }

  return { canAddProduct: true, reason: null, upgradeRequired: null }
}
