import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request, { params }: { params: { code: string } }) {
  try {
    const code = params.code
    if (!code) return NextResponse.json({ ok: false }, { status: 400 })

    const supabaseAdmin = await createServiceClient()

    // Call an RPC if we had one, but since we don't, we just do an increment via direct update
    // This is subject to race conditions but acceptable for a simple view counter
    
    // First get current views
    const { data } = await supabaseAdmin
      .from('images')
      .select('views')
      .eq('encrypted_code', code)
      .single()
      
    if (data) {
      await supabaseAdmin
        .from('images')
        .update({ views: data.views + 1 })
        .eq('encrypted_code', code)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
