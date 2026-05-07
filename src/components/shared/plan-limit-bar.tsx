import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { getPlanDisplayName } from '@/lib/utils'
import type { PlanLimits } from '@/types'

interface PlanLimitBarProps {
  limits: PlanLimits
  planName: string
}

export function PlanLimitBar({ limits, planName }: PlanLimitBarProps) {
  const productPercent = limits.productLimit
    ? Math.min(100, (limits.currentProductCount / limits.productLimit) * 100)
    : 0

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Uso del plan</h3>
        <Badge variant="secondary">{getPlanDisplayName(planName)}</Badge>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Productos publicados</span>
          <span>
            {limits.currentProductCount}
            {limits.productLimit ? ` / ${limits.productLimit}` : ' / ∞'}
          </span>
        </div>
        {limits.productLimit && (
          <Progress value={productPercent} className={productPercent >= 80 ? '[&>div]:bg-orange-500' : ''} />
        )}
      </div>
    </div>
  )
}
