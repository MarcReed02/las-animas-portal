import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeRut } from '@/lib/rut'

function isEmail(v: string) {
  return /.+@.+\..+/.test(v)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const identifier = (searchParams.get('identifier') || '').trim()
  if (!identifier) {
    return NextResponse.json({ error: 'Missing identifier' }, { status: 400 })
  }

  if (isEmail(identifier)) {
    return NextResponse.json({ email: identifier })
  }

  const rut = normalizeRut(identifier)
  try {
    const supabase = await createClient()
    // 1) Try RPC if exists (security definer recommended)
    try {
      const rpc = await supabase.rpc('find_email_by_rut', { p_rut: rut })
      // If RPC exists and returns data
      if (!rpc.error && rpc.data) {
        return NextResponse.json({ email: rpc.data as string })
      }
    } catch {}

    // 2) Fallback to direct table read with multiple candidates
    const candidates = Array.from(new Set([
      identifier,
      rut,
      rut.replace('-', ''),
    ]))
    const { data, error } = await supabase
      .from('usuarios')
      .select('correo')
      .in('rut', candidates)
      .limit(1)

    if (error || !data || data.length === 0 || !data[0]?.correo) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ email: data[0].correo as string })
  } catch (e) {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
