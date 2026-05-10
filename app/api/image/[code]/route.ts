import { NextResponse } from 'next/server'
import { createServiceClient, createClient } from '@/lib/supabase/server'

export async function DELETE(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    if (!code) return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = await createServiceClient()

    // Soft delete: set is_deleted = true where encrypted_code = code AND user_id = user.id
    const { data, error } = await supabaseAdmin
      .from('images')
      .update({ is_deleted: true })
      .eq('encrypted_code', code)
      .eq('user_id', user.id)
      .select()

    if (error) {
      return NextResponse.json({ ok: false, error: 'Database error' }, { status: 500 })
    }

    if (!data || data.length === 0) {
       return NextResponse.json({ ok: false, error: 'Image not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
