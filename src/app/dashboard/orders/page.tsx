import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrdersList } from './orders-list'

export const metadata = { title: 'Mis ventas' }

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      products (
        title,
        images,
        slug,
        stores ( slug, name )
      )
    `)
    .eq('seller_user_id', user.id)
    .order('created_at', { ascending: false })

  const paid = (orders ?? []).filter((o) => o.status === 'paid')
  const totalRevenue = paid.reduce((s, o) => s + Number(o.seller_amount), 0)
  const totalFees = paid.reduce((s, o) => s + Number(o.platform_fee), 0)
  const totalGross = paid.reduce((s, o) => s + Number(o.amount), 0)
  const pendingCount = (orders ?? []).filter((o) => o.status === 'pending').length

  return (
    <OrdersList
      orders={(orders ?? []) as any}
      stats={{ totalRevenue, totalFees, totalGross, paidCount: paid.length, pendingCount }}
    />
  )
}
