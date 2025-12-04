import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Guard: require authenticated admin
    const srv = await createServerClient()
    const { data: userData } = await srv.auth.getUser()
    const uid = userData?.user?.id
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: perfil, error: perfilErr } = await srv
      .from('usuarios')
      .select('rol')
      .eq('id', uid)
      .single()
    if (perfilErr || perfil?.rol !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Server not configured (NEXT_PUBLIC_SUPABASE_URL missing)' }, { status: 500 })
    }

    // Prefer service role (no need for user session). Fallback to SSR client using user cookies.
    const supabase = serviceKey
      ? createAdminClient(supabaseUrl, serviceKey)
      : srv
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_NEWS_BUCKET || 'noticias_portadas'

    const arrayBuffer = await file.arrayBuffer()
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}.${ext}`
    const path = `news-images/${fileName}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, Buffer.from(arrayBuffer), {
        contentType: file.type || undefined,
        upsert: false,
      })
    if (error) {
      console.error('UPLOAD_ERROR', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Generate public URL (assuming bucket is public for news)
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path)

    return NextResponse.json({
      path,
      url: publicData.publicUrl
    })
  } catch (e: any) {
    console.error('UPLOAD_UNCAUGHT', e)
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}
