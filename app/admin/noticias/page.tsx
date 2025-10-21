"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { FiSearch, FiUploadCloud, FiX } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'

type NewsItem = {
  id?: string | number
  title: string
  excerpt?: string
  image_url?: string
  slug?: string
  published_at?: string
  updated_at?: string
  created_at?: string
}

export default function AdminNoticias() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [alt, setAlt] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchNews()
  }, [])

  async function fetchNews() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/news')
      if (!res.ok) throw new Error('Error cargando noticias')
      const data = await res.json()
      setNews(data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function fmtDate(iso?: string) {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return news
    return news.filter(n => n.title?.toLowerCase().includes(term))
  }, [news, q])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title) return
    try {
      setSubmitting(true)
      let imagePath: string | undefined = undefined
      if (file) {
        const uploaded = await uploadToSupabase(supabase, file)
        imagePath = uploaded.path
      }
      const slug = slugify(title)
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, excerpt, image_url: imagePath, slug }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        const msg = (payload && (payload.error || payload.message || payload.details)) || `HTTP ${res.status}`
        console.error('NEWS_CREATE_FAILED', res.status, payload)
        throw new Error(msg)
      }
      setOpen(false)
      setTitle('')
      setExcerpt('')
      setAlt('')
      setFile(null)
      await fetchNews()
    } catch (err: any) {
      setError(err?.message || 'Error al subir')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold">Noticias</h1>
        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-[#AC2734] hover:bg-[#C92F3F] px-4 py-2 font-semibold"
        >
          Nueva noticia
        </button>
      </div>

      {error && <div className="rounded-md bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-2">{error}</div>}

      {/* Buscador */}
      <div className="relative max-w-xl">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
        <input
          placeholder="Buscar por título"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          className="w-full rounded-xl bg-black/30 border border-white/10 pl-9 pr-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>

      {/* Lista */}
      <div className="rounded-xl border border-white/10 bg-[#111111] overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 text-white/60 text-xs uppercase tracking-wider bg-black/30">
          <div className="col-span-9 sm:col-span-9">Portada</div>
          <div className="col-span-3 sm:col-span-3 sm:text-left text-right">Última edición</div>
        </div>
        <ul>
          {loading && (
            <li className="px-4 py-6 text-white/70">Cargando…</li>
          )}
          {!loading && filtered.length === 0 && (
            <li className="px-4 py-6 text-white/70">No hay noticias</li>
          )}
          {filtered
            .slice()
            .sort((a,b)=>{
              const ad = new Date(a.published_at || a.updated_at || a.created_at || 0).getTime()
              const bd = new Date(b.published_at || b.updated_at || b.created_at || 0).getTime()
              return bd - ad
            })
            .map((n) => (
            <li key={n.id as any} className="grid grid-cols-12 items-center gap-3 px-4 py-3 border-t border-white/10 hover:bg-white/5">
              {/* Portada + título */}
              <div className="col-span-9 sm:col-span-9 flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-md overflow-hidden ring-1 ring-white/10 flex-shrink-0 bg-black/30">
                  {n.image_url ? (
                    <img src={n.image_url} alt="portada" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{n.title}</div>
                </div>
              </div>
              {/* Última edición */}
              <div className="col-span-3 sm:col-span-3 text-right sm:text-left text-white/80 whitespace-nowrap">{fmtDate(n.published_at || n.updated_at || n.created_at)}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal crear noticia */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !submitting && setOpen(false)} />
          <div className="relative w-full max-w-2xl mx-4 rounded-2xl bg-[#121212] border border-white/10 p-6 md:p-8 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-extrabold">Subir noticia</h2>
              <button onClick={()=>!submitting && setOpen(false)} className="p-2 rounded-md hover:bg-white/10"><FiX className="h-5 w-5"/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">Título</label>
                <input
                  value={title}
                  onChange={(e)=>setTitle(e.target.value)}
                  required
                  placeholder="Escribe el título de la noticia"
                  className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">Información</label>
                <textarea
                  value={excerpt}
                  onChange={(e)=>setExcerpt(e.target.value)}
                  placeholder="Contenido corto o bajada"
                  rows={3}
                  className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">Imagen</label>
                <div
                  onDragOver={(e)=>{e.preventDefault()}}
                  onDrop={(e)=>{e.preventDefault(); if(e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0])}}
                  className="rounded-xl border border-dashed border-white/20 bg-black/20 px-3 py-8 flex flex-col items-center justify-center text-white/70"
                >
                  <FiUploadCloud className="h-7 w-7 mb-2" />
                  <div className="text-center">
                    Arrastra una imagen o haz clic en Subir
                  </div>
                  <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} className="mt-3" />
                  {file && <div className="mt-2 text-sm text-white/80">{file.name}</div>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">Texto ALT de la imagen</label>
                <input
                  value={alt}
                  onChange={(e)=>setAlt(e.target.value)}
                  placeholder="Texto alternativo"
                  className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" disabled={submitting} onClick={()=>setOpen(false)} className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 disabled:opacity-60">Cancelar</button>
                <button type="submit" disabled={submitting || !title} className="px-4 py-2 rounded-md bg-[#AC2734] hover:bg-[#C92F3F] disabled:opacity-60">
                  {submitting ? 'Subiendo…' : 'Subir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Helpers
function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

async function uploadToSupabase(_supabase: ReturnType<typeof createClient>, file: File) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form, credentials: 'include' })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || 'Upload failed')
  return json as { path: string, signedUrl?: string }
}

/* no-op */
