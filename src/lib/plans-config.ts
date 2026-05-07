// Client-safe: no Stripe SDK, no server-only env vars
export const PLANS = {
  free: {
    name: 'Gratis',
    price: 0,
    productLimit: 3,
    commissionPercentage: 0,
    onlinePayments: false,
  },
  basico: {
    name: 'Básico',
    price: 39.99,
    productLimit: 10,
    commissionPercentage: 0,
    onlinePayments: true,
  },
  intermedio: {
    name: 'Intermedio',
    price: 59.99,
    productLimit: 20,
    commissionPercentage: 0,
    onlinePayments: true,
  },
  pro: {
    name: 'Pro',
    price: 99.99,
    productLimit: 50,
    commissionPercentage: 0,
    onlinePayments: true,
  },
  corporativo: {
    name: 'Corporativo',
    price: 299,
    productLimit: null as number | null,
    commissionPercentage: 0,
    onlinePayments: true,
  },
}

export type PlanKey = keyof typeof PLANS

export function calculatePlatformFee(amount: number, commissionPercentage: number): number {
  return Math.round(amount * (commissionPercentage / 100))
}
