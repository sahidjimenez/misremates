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

export async function checkPlanLimits(userId: string): Promise<PlanLimits> {
  const supabase = await createClient()
  const planKey = await getUserPlan(userId)
  const plan = PLANS[planKey]

  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['active', 'draft', 'paused'])

  const currentProductCount = count ?? 0
  const productLimit = plan.productLimit ?? null

  if (productLimit !== null && currentProductCount >= productLimit) {
    const upgradeTarget =
      planKey === 'free' ? 'basico'
      : planKey === 'basico' ? 'intermedio'
      : planKey === 'intermedio' ? 'pro'
      : 'corporativo'
    return {
      currentProductCount,
      productLimit,
      canAddProduct: false,
      upgradeRequired: upgradeTarget,
      reason: `Tu plan ${plan.name} permite máximo ${productLimit} productos.`,
    }
  }

  return {
    currentProductCount,
    productLimit,
    canAddProduct: true,
    upgradeRequired: null,
    reason: null,
  }
}

// Para uso en cliente (sin Supabase server)
export function checkPlanLimitsSync(params: {
  planKey: PlanKey
  currentProductCount: number
}): { canAddProduct: boolean; reason: string | null; upgradeRequired: string | null } {
  const { planKey, currentProductCount } = params
  const plan = PLANS[planKey]

  if (plan.productLimit !== null && currentProductCount >= plan.productLimit) {
    const upgradeRequired =
      planKey === 'free' ? 'basico'
      : planKey === 'basico' ? 'intermedio'
      : planKey === 'intermedio' ? 'pro'
      : 'corporativo'
    return {
      canAddProduct: false,
      upgradeRequired,
      reason: `Alcanzaste el límite de ${plan.productLimit} productos de tu plan ${plan.name}.`,
    }
  }

  return { canAddProduct: true, reason: null, upgradeRequired: null }
}
