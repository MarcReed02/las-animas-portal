'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatRutCapped } from '@/lib/rut'
import { FiEye, FiEyeOff } from 'react-icons/fi'

export function LoginForm() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Resolver email si el usuario ingresó un RUT
      let email = identifier.trim()
      if (!/.+@.+\..+/.test(email)) {
        const res = await fetch(`/api/resolve-user?identifier=${encodeURIComponent(email)}`)
        if (!res.ok) {
          throw new Error('No se encontró un usuario para ese RUT')
        }
        const json = await res.json()
        email = json.email
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        // Obtener usuario y su rol/estado desde tabla usuarios
        const { data: userData } = await supabase.auth.getUser()
        const uid = userData?.user?.id
        if (!uid) {
          router.push('/')
          return
        }
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('rol, estado')
          .eq('id', uid)
          .single()

        if (perfil?.rol === 'admin') {
          router.push('/admin')
          return
        }

        if (perfil?.estado && perfil.estado !== 'activo') {
          setError('Tu solicitud aún está en revisión o tu cuenta no está activa.')
          return
        }

        router.push('/protected')
      }
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-[#151515]/90 ring-1 ring-white/10 p-6 md:p-8 text-white shadow-xl">
      <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6">INICIAR SESIÓN</h1>

      <div className="space-y-4">
        <input
          id="identifier"
          type="text"
          placeholder="Correo electrónico o RUT"
          value={identifier}
          onChange={(e) => {
            const v = e.target.value
            setIdentifier(v.includes('@') ? v : formatRutCapped(v))
          }}
          maxLength={50}
          required
          className="block w-full px-3 py-2 rounded-md bg-black/20 border border-white/10 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
        />

        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full pr-10 px-3 py-2 rounded-md bg-black/20 border border-white/10 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-2 flex items-center text-white/80 hover:text-white"
            tabIndex={-1}
          >
            {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
          </button>
        </div>

        <label className="flex items-center gap-3 text-white/90 select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-black/30"
          />
          Recordar sesión
        </label>
      </div>

      {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-md bg-[#AC2734] hover:bg-[#C92F3F] py-3 font-semibold uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Ingresando…' : 'Iniciar sesión'}
      </button>

      <div className="mt-4 text-center text-white/80 text-sm">
        <Link href="/auth/forgot-password" className="underline hover:text-white">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </form>
  )
}

