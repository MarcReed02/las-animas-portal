
"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function UpdatePasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const supabase = createClient()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setMessage("Error updating password: " + error.message)
      setLoading(false)
    } else {
      setMessage("Password updated successfully!")
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold">Actualizar Contraseña</h1>
        <p className="text-balance text-muted-foreground">
          Ingresa tu nueva contraseña a continuación.
        </p>
      </div>
      <form onSubmit={handleUpdate}>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <label htmlFor="password">Nueva Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="********"
              required
              className="border p-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </div>
          <button type="submit" disabled={loading} className="bg-black text-white p-2 rounded disabled:opacity-50">
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
          {message && <p className="text-sm text-center mt-2">{message}</p>}
        </div>
      </form>
    </div>
  )
}
