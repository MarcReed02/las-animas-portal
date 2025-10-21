'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FiSearch, FiRefreshCw, FiDownload, FiList, FiCalendar } from 'react-icons/fi'

type Solicitud = {
  id: string
  nombre: string
  rut: string
  correo: string
  documento_url: string
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  admin_responsable: string | null
  created_at: string
}

const ESTADOS: Array<{ key: Solicitud['estado'] | 'todas'; label: string }>
  = [
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'aprobado', label: 'Aprobadas' },
    { key: 'rechazado', label: 'Rechazadas' },
    { key: 'todas', label: 'Todas' },
  ]

export default function AdminSolicitudesPage() {
  const supabase = createClient()
  const [items, setItems] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState<Solicitud['estado'] | 'todas'>('pendiente')
  const [selected, setSelected] = useState<Solicitud | null>(null)
  const [rechazo, setRechazo] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('solicitudes_registro')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setItems((data as any) || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const byEstado = estado === 'todas' ? items : items.filter(i => i.estado === estado)
    const term = q.trim().toLowerCase()
    if (!term) return byEstado
    return byEstado.filter(i =>
      i.nombre?.toLowerCase().includes(term) ||
      i.rut?.toLowerCase().includes(term) ||
      i.correo?.toLowerCase().includes(term)
    )
  }, [items, estado, q])

  async function aprobar(s: Solicitud) {
    try {
      setLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      const adminId = userData.user?.id ?? null
      const { error } = await supabase
        .from('solicitudes_registro')
        .update({ estado: 'aprobado', admin_responsable: adminId })
        .eq('id', s.id)
      if (error) throw error
      // Nota: creación del usuario en auth/users requiere service role.
      await fetchData()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function rechazar(s: Solicitud) {
    try {
      setLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      const adminId = userData.user?.id ?? null
      const { error } = await supabase
        .from('solicitudes_registro')
        .update({ estado: 'rechazado', admin_responsable: adminId })
        .eq('id', s.id)
      if (error) throw error
      await fetchData()
      setRechazo('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function fmtDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold">Solicitudes de registro</h1>
        <div className="hidden md:flex items-center gap-2 text-white/80">
          <button onClick={fetchData} className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-white/10 hover:bg-white/10">
            <FiRefreshCw className="h-4 w-4" />
          </button>
          <button className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-white/10 hover:bg-white/10">
            <FiList className="h-4 w-4" />
          </button>
          <button className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-white/10 hover:bg-white/10">
            <FiDownload className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Tabs estado con contadores */}
      <div className="flex flex-wrap gap-3 rounded-full">
        {ESTADOS.map((t) => {
          const count = t.key === 'todas' ? items.length : items.filter(i=>i.estado===t.key).length
          const active = estado === t.key
          return (
            <button
              key={t.key}
              onClick={() => setEstado(t.key)}
              className={`px-4 py-2 rounded-xl border transition-colors text-sm ${
                active ? 'bg-white/10 border-white/20' : 'border-white/10 hover:bg-white/5'
              }`}
            >
              <span className={t.key==='pendiente' ? 'text-red-600 font-semibold' : ''}>{count}</span> {t.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tabla */}
        <div className="xl:col-span-2 bg-[#111111] border border-white/10 rounded-xl overflow-hidden shadow-lg">
          {/* Filtros superiores */}
          <div className="p-3 flex flex-wrap gap-3 items-center border-b border-white/10 bg-black/20">
            <div className="relative flex-1 min-w-[220px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
              <input
                placeholder="Buscar..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-black/30 border border-white/10 pl-9 pr-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-xl"
              />
            </div>
            <div className="relative w-[220px]">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
              <input type="date" className="w-full rounded-xl bg-black/30 border border-white/10 pl-9 pr-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20" />
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-black/40 text-white/70">
                <tr>
                  <th className="text-left font-normal px-4 py-4 w-[110px]">Fecha</th>
                  <th className="text-left font-normal px-4 py-4">RUT</th>
                  <th className="text-left font-normal px-4 py-4">Nombre</th>
                  <th className="text-left font-normal px-4 py-4">Correo</th>
                  <th className="text-left font-normal px-4 py-4 w-[140px]">Documento</th>
                  <th className="text-left font-normal px-4 py-4">Tipo</th>
                  <th className="text-left font-normal px-4 py-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td className="px-4 py-6" colSpan={6}>Cargando...</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td className="px-4 py-6" colSpan={6}>Sin resultados</td></tr>
                )}
                {filtered.map((s) => (
                  <tr key={s.id} className={`border-t border-white/10 hover:bg-white/5 cursor-pointer ${selected?.id===s.id?'bg-white/5':''}`} onClick={() => setSelected(s)}>
                    <td className="px-4 py-2 whitespace-nowrap">{fmtDate(s.created_at)}</td>
                    <td className="px-4 py-2">{s.rut}</td>
                    <td className="px-4 py-2 font-medium">{s.nombre}</td>
                    <td className="px-4 py-2">{s.correo}</td>
                    <td className="px-4 py-2">
                      {s.documento_url ? (
                        <div className="flex items-center gap-3">
                          <a href={s.documento_url} target="_blank" className="text-blue-300 hover:underline" onClick={(e)=>e.stopPropagation()}>Ver</a>
                          <a href={s.documento_url} target="_blank" className="text-white/70 hover:text-white" onClick={(e)=>e.stopPropagation()}>Descargar</a>
                        </div>
                      ) : (
                        <span className="text-white/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className={
                        s.estado === 'pendiente' ? 'text-yellow-400' : s.estado === 'aprobado' ? 'text-green-400' : 'text-red-400'
                      }>
                        {s.estado.charAt(0).toUpperCase()+s.estado.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación placeholder */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 text-white/70 text-sm">
            <div>Mostrando {filtered.length > 0 ? 1 : 0}–{Math.min(filtered.length, 10)} de {filtered.length}</div>
            <div className="flex items-center gap-2">
              <button className="h-8 w-8 rounded-md bg-white/5 hover:bg-white/10">1</button>
              <button className="h-8 w-8 rounded-md bg-white/5 hover:bg-white/10">2</button>
              <button className="h-8 w-8 rounded-md bg-white/5 hover:bg-white/10">3</button>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4 shadow-lg">
          {selected ? (
            <div className="space-y-3">
              <h3 className="text-xl font-bold">{selected.nombre}</h3>
              <div className="text-white/80">{selected.rut}</div>
              <div className="text-white/80">{selected.correo}</div>

              <div className="mt-4">
                <div className="text-white/80 text-sm mb-2">Documento</div>
                {selected.documento_url ? (
                  <a href={selected.documento_url} target="_blank" className="block rounded-md bg-black/30 border border-white/10 p-4 text-white/80 hover:bg-black/40">PDF</a>
                ) : (
                  <div className="rounded-md bg-black/30 border border-white/10 p-4 text-white/50">Sin documento</div>
                )}
              </div>

              {selected.estado === 'pendiente' && (
                <div className="space-y-3">
                  <button onClick={() => aprobar(selected)} className="w-full bg-[#AC2734] hover:bg-[#C92F3F] text-white py-2 rounded-md font-semibold">Aprobar</button>
                  <div>
                    <textarea value={rechazo} onChange={(e)=>setRechazo(e.target.value)} placeholder="Motivo del rechazo" className="w-full rounded-md bg-black/20 border border-white/10 px-3 py-2 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20" rows={3} />
                    <button onClick={() => rechazar(selected)} className="mt-2 w-full bg-white/10 hover:bg-white/15 text-white py-2 rounded-md">Rechazar</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-white/70">Selecciona una solicitud para ver detalles</div>
          )}

          {error && <div className="mt-4 text-red-400 text-sm">{error}</div>}
        </div>
      </div>
    </div>
  )
}
