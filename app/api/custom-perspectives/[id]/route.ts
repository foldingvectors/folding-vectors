import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get a single custom perspective
export async function GET(request: NextRequest, { params }: RouteParams) {
  const supabase = await createServerClient()
  const { id } = await params

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: perspective, error } = await supabase
    .from('custom_perspectives')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !perspective) {
    return NextResponse.json({ error: 'Perspective not found' }, { status: 404 })
  }

  return NextResponse.json({ perspective })
}

// PATCH - Update a custom perspective
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const supabase = await createServerClient()
  const { id } = await params

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, prompt } = body

  const updates: { name?: string; prompt?: string; updated_at: string } = {
    updated_at: new Date().toISOString(),
  }

  if (name !== undefined) {
    if (name.length > 100) {
      return NextResponse.json({ error: 'Name must be 100 characters or less' }, { status: 400 })
    }
    updates.name = name.trim()
  }

  if (prompt !== undefined) {
    updates.prompt = prompt.trim()
  }

  const { data: perspective, error } = await supabase
    .from('custom_perspectives')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !perspective) {
    return NextResponse.json({ error: 'Perspective not found or update failed' }, { status: 404 })
  }

  return NextResponse.json({ perspective })
}

// DELETE - Delete a custom perspective
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const supabase = await createServerClient()
  const { id } = await params

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('custom_perspectives')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
