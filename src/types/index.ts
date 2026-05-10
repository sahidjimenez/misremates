export type UserRole = 'buyer' | 'seller' | 'admin'
export type ProductStatus = 'draft' | 'active' | 'sold' | 'paused'
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'
export type StoreStatus = 'active' | 'paused' | 'suspended'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
export type PlanName = 'free' | 'basico' | 'intermedio' | 'pro' | 'corporativo'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export interface SellerProfile {
  id: string
  user_id: string
  display_name: string
  phone: string | null
  city: string | null
  state: string | null
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
  created_at: string
}

export interface Store {
  id: string
  user_id: string
  seller_profile_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  whatsapp: string | null
  status: StoreStatus
  created_at: string
  seller_profile?: SellerProfile
}

export interface Product {
  id: string
  store_id: string
  user_id: string
  title: string
  slug: string
  description: string | null
  price: number
  stock: number | null
  category: string
  condition: 'nuevo' | 'como_nuevo' | 'buen_estado' | 'usado'
  images: string[]
  status: ProductStatus
  is_featured: boolean
  created_at: string
  store?: Store
}

export interface Plan {
  id: string
  name: PlanName
  monthly_price: number
  product_limit: number | null
  max_total_inventory_value: number | null
  commission_percentage: number
  stripe_price_id: string | null
  features: string[]
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: SubscriptionStatus
  current_period_end: string | null
  plan?: Plan
}

export interface Order {
  id: string
  buyer_email: string
  buyer_name: string
  product_id: string
  seller_user_id: string
  store_id: string
  amount: number
  platform_fee: number
  seller_amount: number
  stripe_payment_intent_id: string | null
  status: OrderStatus
  created_at: string
  product?: Product
}

export interface Payment {
  id: string
  order_id: string
  amount: number
  platform_fee: number
  seller_amount: number
  stripe_charge_id: string | null
  stripe_payment_intent_id: string | null
  status: PaymentStatus
  created_at: string
}

export interface PlanLimits {
  canAddProduct: boolean
  reason: string | null
  upgradeRequired: 'basico' | 'intermedio' | 'pro' | 'corporativo' | null
  currentProductCount: number
  productLimit: number | null
}
