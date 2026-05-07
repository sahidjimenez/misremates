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
    commissionPercentage: 0,
    stripePriceId: null,
    onlinePayments: false,
  },
  basico: {
    name: 'Básico',
    price: 39.99,
    productLimit: 10,
    commissionPercentage: 0,
    stripePriceId: process.env.STRIPE_PRICE_BASICO,
    onlinePayments: true,
  },
  intermedio: {
    name: 'Intermedio',
    price: 59.99,
    productLimit: 20,
    commissionPercentage: 0,
    stripePriceId: process.env.STRIPE_PRICE_INTERMEDIO,
    onlinePayments: true,
  },
  pro: {
    name: 'Pro',
    price: 99.99,
    productLimit: 50,
    commissionPercentage: 0,
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    onlinePayments: true,
  },
  corporativo: {
    name: 'Corporativo',
    price: 299,
    productLimit: null,
    commissionPercentage: 0,
    stripePriceId: process.env.STRIPE_PRICE_CORPORATIVO,
    onlinePayments: true,
  },
} as const

export type PlanKey = keyof typeof PLANS

export function calculatePlatformFee(amount: number, commissionPercentage: number): number {
  return Math.round(amount * (commissionPercentage / 100))
}
