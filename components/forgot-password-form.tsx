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
      className="rounded-2xl bg-[#151515]/90 ring-1 ring-white/10 p-6 md:p-8 text-white shadow-xl"
    >
      <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6">
        Recuperar contraseña
      </h1>
      <p className="text-white/80 text-sm mb-4">
        Ingresa tu correo electrónico para enviarte un enlace de recuperación.
      </p>

      <input
        type="email"
        required
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block w-full px-3 py-2 rounded-md bg-black/20 border border-white/10 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
      />

      {status === 'ok' && (
        <p className="mt-3 text-green-400 text-sm">
          Te enviamos un correo con instrucciones.
        </p>
      )}
      {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-md bg-[#AC2734] hover:bg-[#C92F3F] py-3 font-semibold uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Enviando…' : 'Enviar enlace'}
      </button>

      <div className="mt-4 text-center text-white/80 text-sm">
        <Link href="/auth/login/ingresar" className="underline hover:text-white">
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  )
}

