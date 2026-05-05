import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

export const PLANS = {
  free: {
    name: 'Gratis',
    price: 0,
    productLimit: 3,
    maxInventoryValue: 1000,   // total activo ≤ $1,000 MXN
    maxProductPrice: 100,       // precio por producto ≤ $100 MXN
    commissionPercentage: 0,
    stripePriceId: null,
    onlinePayments: false,
  },
  basico: {
    name: 'Básico',
    price: 99,
    productLimit: 10,
    maxInventoryValue: 10000,
    maxProductPrice: null,      // sin límite por producto
    commissionPercentage: 8,
    stripePriceId: process.env.STRIPE_PRICE_BASICO,
    onlinePayments: false,
  },
  pro: {
    name: 'Pro',
    price: 299,
    productLimit: 30,
    maxInventoryValue: 30000,
    maxProductPrice: null,
    commissionPercentage: 5,
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    onlinePayments: true,
  },
  premium: {
    name: 'Premium',
    price: 699,
    productLimit: null,
    maxInventoryValue: null,
    maxProductPrice: null,
    commissionPercentage: 2.5,
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM,
    onlinePayments: true,
  },
} as const

export type PlanKey = keyof typeof PLANS

export function calculatePlatformFee(amount: number, commissionPercentage: number): number {
  return Math.round(amount * (commissionPercentage / 100))
}
