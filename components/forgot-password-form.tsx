'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setStatus('idle')
    try {
      const redirectTo = `${window.location.origin}/auth/update-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })
      if (error) throw error
      setStatus('ok')
    } catch (e: any) {
      setError(e?.message || 'No se pudo enviar el correo')
      setStatus('err')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-[32px] border border-white/10 bg-[#0B0B0B] p-8 text-white backdrop-blur"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Recuperar contrasena</h1>
        <p className="text-sm text-white/70">
          Ingresa tu correo para enviarte un enlace de restablecimiento.
        </p>
      </div>

      <label className="mt-8 block space-y-2 text-sm font-semibold text-white/80">
        Correo electronico
        <input
          type="email"
          required
          placeholder="nombre@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
        />
      </label>

      {status === 'ok' && (
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#48d2a0]" role="status">
          Te enviamos un correo con instrucciones.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-2xl border border-[#ff3b30]/40 bg-[#1a0d0d] px-4 py-3 text-sm text-[#ff6b5c]" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full rounded-full bg-[#ef2b2d] py-3 text-lg font-semibold text-white transition hover:bg-[#ff3b30] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Enviando...' : 'Enviar enlace'}
      </button>

      <div className="mt-6 text-center text-sm text-white/70">
        <Link href="/auth/login/ingresar" className="font-semibold text-[#ff3b30] transition hover:text-white">
          Volver al inicio de sesion
        </Link>
      </div>
    </form>
  )
}
