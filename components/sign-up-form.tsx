'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { hashPassword } from '@/lib/password'

export function SignUpForm() {
  const router = useRouter()
  const supabase = createClient()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [rut, setRut] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      console.log('[sign-up] iniciando envío de solicitud')
      let documento_url: string | null = null
      if (file) {
        console.log('[sign-up] subiendo documento', { name: file.name, size: file.size })
        const { data, error } = await supabase.storage
          .from('documentos')
          .upload(`solicitudes/${Date.now()}-${file.name}`, file)
        if (error) throw error
        documento_url = data.path
      }

      const password_hash = await hashPassword(password)
      console.log('[sign-up] hash generado correctamente')

      const trimmedFirstName = firstName.trim()
      const trimmedLastName = lastName.trim()
      const { error } = await supabase.from('solicitudes_registro').insert({
        nombres: trimmedFirstName,
        apellidos: trimmedLastName,
        rut,
        correo: email,
        documento_url,
        password_hash,
        estado: 'pendiente',
      })
      if (error) throw error
      setSuccess(true)
      setFirstName('')
      setLastName('')
      setRut('')
      setEmail('')
      setPassword('')
      setFile(null)
      setTimeout(() => router.push('/'), 1500)
    } catch (err: any) {
      console.error('[sign-up] error al enviar solicitud', err)
      setError(err.message || 'No se pudo enviar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-[#151515]/90 ring-1 ring-white/10 p-6 md:p-8 text-white space-y-4"
    >
      <h1 className="text-2xl font-extrabold">Subir noticia</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm mb-1">Nombres</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ej: Juan Antonio"
            className="w-full rounded-md bg-black/20 border border-white/10 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Apellidos</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Ej: Pérez Soto"
            className="w-full rounded-md bg-black/20 border border-white/10 px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">RUT</label>
        <input
          type="text"
          required
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          className="w-full rounded-md bg-black/20 border border-white/10 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Correo</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md bg-black/20 border border-white/10 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Contrasena</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md bg-black/20 border border-white/10 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Documento</label>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full rounded-md bg-black/20 border border-dashed border-white/20 px-3 py-2" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">Solicitud enviada</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[#AC2734] hover:bg-[#C92F3F] py-3 uppercase font-semibold disabled:opacity-60"
      >
        {loading ? 'Enviando...' : 'Subir'}
      </button>
    </form>
  )
}
