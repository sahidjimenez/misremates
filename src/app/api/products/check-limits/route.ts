import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkPlanLimits } from '@/lib/plans'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limits = await checkPlanLimits(user.id)

  return NextResponse.json(limits)
}
