import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkPlanLimits } from '@/lib/plans'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const price = Number(body.price) || 0

  const limits = await checkPlanLimits(user.id, price)

  return NextResponse.json(limits)
}
