import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Guard admin
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
    const useAdmin = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = useAdmin
      ? createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      : serverClient
    const body = await request.json()
    const { id } = params

    const { data, error } = await supabase
      .from('news')
      .update(body)
      .eq('id', id)
      .select()

    if (error) {
      console.error('NEWS_PATCH_ERROR', error)
      return NextResponse.json({ error: error.message, details: (error as any).details, code: (error as any).code }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error('NEWS_PATCH_ERROR_UNCAUGHT', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Guard admin
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
    const useAdmin = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = useAdmin
      ? createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      : serverClient
    const { id } = params

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('NEWS_DELETE_ERROR', error)
      return NextResponse.json({ error: error.message, details: (error as any).details, code: (error as any).code }, { status: 500 })
    }

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error: any) {
    console.error('NEWS_DELETE_ERROR_UNCAUGHT', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
