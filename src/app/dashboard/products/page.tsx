import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductsList } from './products-list'

export const metadata = { title: 'Mis productos' }

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: products } = await supabase
    .from('products')
    .select('*, stores(slug, name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <ProductsList initialProducts={(products ?? []) as any} />
    </div>
  )
}
