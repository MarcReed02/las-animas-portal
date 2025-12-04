import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_NEWS_BUCKET || 'noticias_portadas'
    // Map image_url path -> signed URL if not an http(s) link
    const items = await Promise.all((data || []).map(async (row: any) => {
      const img = row.image_url as string | null
      if (img && !/^https?:\/\//i.test(img)) {
        try {
          const signed = await supabase.storage.from(bucket).createSignedUrl(img, 60 * 60)
          if (signed.data?.signedUrl) {
            return { ...row, image_url: signed.data.signedUrl }
          }
        } catch { }
      }
      return row
    }))

    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Guard: require authenticated admin
    const serverClient = await createClient()
    const { data: userData } = await serverClient.auth.getUser()
    const uid = userData?.user?.id
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: perfil, error: perfilErr } = await serverClient
      .from('usuarios')
      .select('rol')
      .eq('id', uid)
      .single()
    if (perfilErr || perfil?.rol !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service role if available to bypass RLS for trusted admin mutations
    const useAdmin = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = useAdmin
      ? createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      : serverClient
    const body = await request.json()
    const { title, excerpt, image_url, slug, images, status, published_at } = body

    const { data, error } = await supabase
      .from('news')
      .insert([{
        title,
        excerpt,
        image_url,
        slug,
        images,
        status,
        published_at: published_at || new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('NEWS_POST_INSERT_ERROR', error)
      return NextResponse.json({ error: error.message, details: (error as any).details, code: (error as any).code }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error: any) {
    console.error('NEWS_POST_ERROR', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
