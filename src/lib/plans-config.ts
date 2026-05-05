// Client-safe: no Stripe SDK, no server-only env vars
export const PLANS = {
  free: {
    name: 'Gratis',
    price: 0,
    productLimit: 3,
    maxInventoryValue: 1000,
    maxProductPrice: 100,
    commissionPercentage: 0,
    onlinePayments: false,
  },
  basico: {
    name: 'Básico',
    price: 99,
    productLimit: 10,
    maxInventoryValue: 10000,
    maxProductPrice: null as number | null,
    commissionPercentage: 8,
    onlinePayments: false,
  },
  pro: {
    name: 'Pro',
    price: 299,
    productLimit: 30,
    maxInventoryValue: 30000,
    maxProductPrice: null as number | null,
    commissionPercentage: 5,
    onlinePayments: true,
  },
  premium: {
    name: 'Premium',
    price: 699,
    productLimit: null as number | null,
    maxInventoryValue: null as number | null,
    maxProductPrice: null as number | null,
    commissionPercentage: 2.5,
    onlinePayments: true,
  },
}

export type PlanKey = keyof typeof PLANS

export function calculatePlatformFee(amount: number, commissionPercentage: number): number {
  return Math.round(amount * (commissionPercentage / 100))
}
