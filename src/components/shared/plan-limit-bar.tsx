import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getPlanDisplayName } from '@/lib/utils'
import type { PlanLimits } from '@/types'

interface PlanLimitBarProps {
  limits: PlanLimits
  planName: string
}

export function PlanLimitBar({ limits, planName }: PlanLimitBarProps) {
  const productPercent = limits.productLimit
    ? Math.min(100, (limits.currentProductCount / limits.productLimit) * 100)
    : 0

  const inventoryPercent = limits.maxInventoryValue
    ? Math.min(100, (limits.currentInventoryValue / limits.maxInventoryValue) * 100)
    : 0

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Uso del plan</h3>
        <Badge variant="secondary">{getPlanDisplayName(planName)}</Badge>
      </div>

      <div className="space-y-3">
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

        {limits.maxInventoryValue && (
          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Valor en inventario</span>
              <span>
                {formatCurrency(limits.currentInventoryValue)} / {formatCurrency(limits.maxInventoryValue)}
              </span>
            </div>
            <Progress value={inventoryPercent} className={inventoryPercent >= 80 ? '[&>div]:bg-orange-500' : ''} />
          </div>
        )}
      </div>
    </div>
  )
}
