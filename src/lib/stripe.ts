import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
  typescript: true,
})

export const PLANS = {
  free: {
    name: 'Gratis',
    price: 0,
    productLimit: 3,
    maxInventoryValue: null,
    commissionPercentage: 0,
    stripePriceId: null,
    onlinePayments: false,
  },
  basico: {
    name: 'Básico',
    price: 99,
    productLimit: 10,
    maxInventoryValue: 1000,
    commissionPercentage: 8,
    stripePriceId: process.env.STRIPE_PRICE_BASICO,
    onlinePayments: false,
  },
  pro: {
    name: 'Pro',
    price: 299,
    productLimit: 30,
    maxInventoryValue: 30000,
    commissionPercentage: 5,
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    onlinePayments: true,
  },
  premium: {
    name: 'Premium',
    price: 699,
    productLimit: null,
    maxInventoryValue: null,
    commissionPercentage: 2.5,
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM,
    onlinePayments: true,
  },
} as const

export type PlanKey = keyof typeof PLANS

export function calculatePlatformFee(amount: number, commissionPercentage: number): number {
  return Math.round(amount * (commissionPercentage / 100))
}
