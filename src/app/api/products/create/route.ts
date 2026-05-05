import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkPlanLimits } from '@/lib/plans'
import { generateUniqueSlug } from '@/lib/utils'

const schema = z.object({
  store_id: z.string().uuid(),
  title: z.string().min(3).max(120),
  description: z.string().max(1000).optional(),
  price: z.number().positive(),
  category: z.string().min(1),
  condition: z.enum(['nuevo', 'como_nuevo', 'buen_estado', 'usado']),
  images: z.array(z.string().url()).max(4).default([]),
  status: z.enum(['draft', 'active']).default('active'),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const limits = await checkPlanLimits(user.id, parsed.data.price)
  if (!limits.canAddProduct) {
    return NextResponse.json({ error: limits.reason, limitReached: true }, { status: 403 })
  }

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('id', parsed.data.store_id)
    .eq('user_id', user.id)
    .single()

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  const slug = generateUniqueSlug(parsed.data.title)

  const { data, error } = await supabase
    .from('products')
    .insert({ ...parsed.data, user_id: user.id, slug, is_featured: false })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
