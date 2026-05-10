import { NextResponse } from 'next/server'
import { createServiceClient, createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ ok: false, error: 'Only images are allowed' }, { status: 415 })
    }

    // Check size limit (e.g., 20MB)
    const MAX_SIZE = 20 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ ok: false, error: 'File size exceeds 20MB limit' }, { status: 413 })
    }

    // Try to get user if signed in
    const supabaseClient = await createClient()
    const { data: { user } } = await supabaseClient.auth.getUser()

    // Forward to CF Worker
    const cfWorkerUrl = process.env.CF_WORKER_URL
    const cfWorkerKey = process.env.CF_WORKER_KEY

    if (!cfWorkerUrl || !cfWorkerKey) {
      console.error('CF Worker configuration missing')
      return NextResponse.json({ ok: false, error: 'Server configuration error' }, { status: 500 })
    }

    const workerFormData = new FormData()
    workerFormData.append('file', file)
    workerFormData.append('mime_type', file.type)

    const cfResponse = await fetch(`${cfWorkerUrl}/upload`, {
      method: 'POST',
      headers: {
        'X-Worker-Key': cfWorkerKey
      },
      body: workerFormData
    })

    if (!cfResponse.ok) {
      const errorText = await cfResponse.text()
      console.error('CF Worker Error:', cfResponse.status, errorText)
      return NextResponse.json({ ok: false, error: 'Failed to upload to storage backend' }, { status: 502 })
    }

    const cfData = await cfResponse.json()
    if (!cfData.ok || !cfData.encrypted_code) {
      return NextResponse.json({ ok: false, error: 'Invalid response from storage backend' }, { status: 502 })
    }

    // Save metadata to Supabase using Service Role (bypasses RLS)
    const supabaseAdmin = await createServiceClient()
    
    // Attempt to get client IP
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : null

    const { error: dbError } = await supabaseAdmin
      .from('images')
      .insert({
        encrypted_code: cfData.encrypted_code,
        mime_type: file.type,
        file_size: file.size,
        file_name: file.name,
        uploader_ip: ip,
        user_id: user?.id || null // Link to user if logged in
      })

    if (dbError) {
      console.error('Supabase DB Error:', dbError)
      // We still return success because the file was uploaded, even if metadata failed
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const imageUrl = `${baseUrl}/img/${cfData.encrypted_code}`

    return NextResponse.json({
      ok: true,
      url: imageUrl,
      encrypted_code: cfData.encrypted_code,
      file_name: file.name,
      mime_type: file.type,
      file_size: file.size
    })

  } catch (error: any) {
    console.error('Upload handler error:', error)
    return NextResponse.json({ ok: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
