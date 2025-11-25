'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { hashPassword } from '@/lib/password'

export function LoginForm() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const email = identifier.trim().toLowerCase()
      console.log('[login] intentando iniciar sesi�n con', { email })
      let hashedPassword: string | null = null
      try {
        hashedPassword = await hashPassword(password)
        console.log('[login] hash calculado para intento principal', { hashLength: hashedPassword.length })
      } catch (hashError) {
        console.warn('[login] no se pudo calcular hash, usando password plano', hashError)
      }
      type SignInResponse = Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>
      let signInData: SignInResponse['data'] | null = null
      let authError: SignInResponse['error'] | null = null
      if (hashedPassword) {
        const hashedAttempt = await supabase.auth.signInWithPassword({
          email,
          password: hashedPassword,
        })
        if (hashedAttempt.error) {
          console.warn('[login] intento con hash fallo, probando password plano', {
            message: hashedAttempt.error.message,
            status: (hashedAttempt.error as any)?.status,
            code: (hashedAttempt.error as any)?.code,
          })
          const plainAttempt = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          signInData = plainAttempt.data
          authError = plainAttempt.error
          if (plainAttempt.error) {
            console.warn('[login] intento con password plano fallo', {
              message: plainAttempt.error.message,
              status: (plainAttempt.error as any)?.status,
              code: (plainAttempt.error as any)?.code,
            })
          }
        } else {
          signInData = hashedAttempt.data
          authError = null
        }
      } else {
        const plainAttempt = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        signInData = plainAttempt.data
        authError = plainAttempt.error
        if (plainAttempt.error) {
          console.warn('[login] intento plano (sin hash) fallo', {
            message: plainAttempt.error.message,
            status: (plainAttempt.error as any)?.status,
            code: (plainAttempt.error as any)?.code,
          })
        }
      }
      if (authError) {
        console.warn('[login] intento de inicio fallido', authError)
        const pendingMessage = await checkPendingSolicitud(email)
        if (pendingMessage) {
          setError(pendingMessage)
          return
        }
        const usuarioExiste = await checkUsuarioExistente(email)
        if (!usuarioExiste) {
          setError('No encontramos una cuenta con ese correo. Revisa si lo escribiste bien o crea una solicitud nueva.')
        } else {
          setError('Contraseña incorrecta. Intenta nuevamente o restablece tu contraseña.')
        }
        return
      }
      if (!signInData) {
        throw new Error('No se recibi� informaci�n de la sesi�n')
      }
      console.log('[login] sesi�n creada correctamente', {
        sessionPresent: Boolean(signInData?.session),
        userId: signInData?.user?.id,
        expiresAt: signInData?.session?.expires_at,
      })
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData?.user?.id
      if (!uid) {
        console.warn('[login] no se pudo obtener uid del usuario autenticado')
        router.push('/')
        return
      }
      console.log('[login] usuario autenticado', { uid })
      const { data: perfil, error: perfilError } = await supabase
        .from('usuarios')
        .select('rol, estado, nombres, apellidos, correo')
        .eq('id', uid)
        .single()
      console.log('[login] perfil obtenido', perfil)
      console.log('[login] error al cargar perfil (si existe)', perfilError)
      console.log('[login] uid', uid)
      if (perfil) {
        console.log('[login] rol del perfil', perfil.rol)
        console.log('[login] tipo de rol', typeof perfil.rol)
        console.log("[login] �rol == 'admin'?", perfil.rol === 'admin')
      }
      if (perfil?.rol === 'admin') {
        console.log('[login] rol admin detectado, redirigiendo a /admin')
        router.push('/admin')
        return
      }
      if (perfil?.estado && perfil.estado !== 'activo') {
        console.warn('[login] usuario no activo', perfil.estado)
        setError('Tu solicitud a�n est� en revisi�n o tu cuenta no est� activa.')
        return
      }
        console.log('[login] no es admin, redirigiendo a home')
        router.push('/')
        router.refresh()
    } catch (err: any) {
      console.error('[login] error inesperado', err)
      setError(err?.message || 'Ocurri� un error inesperado')
    } finally {
      setLoading(false)
    }
  }
  const checkPendingSolicitud = async (email: string) => {
    try {
      const { data } = await supabase
        .from('solicitudes_registro')
        .select('estado')
        .eq('correo', email)
        .order('fecha_solicitud', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (data?.estado === 'pendiente') {
        return 'Tu solicitud aun esta en revision. Te avisaremos cuando sea aprobada.'
      }
    } catch (verifyError) {
      console.warn('[login] no se pudo verificar solicitud pendiente', verifyError)
    }
    return null
  }

  const checkUsuarioExistente = async (email: string) => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('id')
        .eq('correo', email)
        .limit(1)
      return Boolean(data && data.length > 0)
    } catch (verifyError) {
      console.warn('[login] no se pudo verificar usuario existente', verifyError)
    }
    return false
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#0B0B0B] p-8 text-white backdrop-blur"
    >
      <h1 className="mb-8 text-center text-3xl font-bold">Iniciar sesión</h1>

      <div className="space-y-6">
        <label htmlFor="identifier" className="space-y-2">
          <span className="text-sm font-semibold text-white/90">Correo electrónico</span>
          <input
            id="identifier"
            type="email"
            placeholder="correo@correo.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            maxLength={50}
            required
            className="block w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
          />
        </label>

        <label htmlFor="password" className="space-y-2">
          <span className="text-sm font-semibold text-white/90">Contraseña</span>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 pr-12 text-white placeholder-white/40 transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-white/70 transition hover:text-white"
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
        </label>

        <div>
          <Link href="/auth/forgot-password" className="text-sm font-medium text-[#ff3b30] transition hover:text-white">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-[#ff3b30]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full rounded-full bg-[#ef2b2d] py-3 text-lg font-semibold text-white transition hover:bg-[#ff3b30] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Ingresando...' : 'Iniciar sesión'}
      </button>

      <p className="mt-6 text-center text-sm text-white/70">
        ¿No tienes una cuenta?{' '}
        <Link href="/auth/login" className="font-semibold text-[#ff3b30] transition hover:text-white">
          Crear cuenta
        </Link>
      </p>
    </form>
  )
}
