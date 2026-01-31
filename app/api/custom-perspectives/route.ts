import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

// GET - List all custom perspectives for the user
export async function GET() {
  const supabase = await createServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: perspectives, error } = await supabase
    .from('custom_perspectives')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ perspectives })
}

// POST - Create a new custom perspective
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, prompt } = body

  if (!name || !prompt) {
    return NextResponse.json({ error: 'Name and prompt are required' }, { status: 400 })
  }

  if (name.length > 100) {
    return NextResponse.json({ error: 'Name must be 100 characters or less' }, { status: 400 })
  }

  // Check if user already has 10 custom perspectives (limit)
  const { count } = await supabase
    .from('custom_perspectives')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (count && count >= 10) {
    return NextResponse.json({ error: 'Maximum of 10 custom perspectives allowed' }, { status: 400 })
  }

  const { data: perspective, error } = await supabase
    .from('custom_perspectives')
    .insert({
      user_id: user.id,
      name: name.trim(),
      prompt: prompt.trim(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ perspective }, { status: 201 })
}
