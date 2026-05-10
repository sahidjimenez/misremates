import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(1000).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(1).nullable().optional(),
  category: z.string().min(1).optional(),
  condition: z.enum(['nuevo', 'como_nuevo', 'buen_estado', 'usado']).optional(),
  images: z.array(z.string()).max(4).optional(),
  status: z.enum(['draft', 'active', 'sold', 'paused']).optional(),
})

export async function PATCH(request: Request) {
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

  const { id, ...updates } = parsed.data

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
