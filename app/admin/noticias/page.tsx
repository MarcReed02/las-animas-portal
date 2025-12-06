"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'
import {
  ShieldCheck,
  LayoutGrid,
  FileText,
  Users,
  Settings,
  LogOut,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Bell,
  Sun,
  Moon,
  User,
  Globe,
  UploadCloud,
  X,
  Image as ImageIcon,
  Clock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'

type NewsItem = {
  id?: string | number
  title: string
  excerpt?: string
  image_url?: string
  images?: string[] // Array of image URLs
  slug?: string
  published_at?: string
  updated_at?: string
  created_at?: string
  status?: string
}

export default function AdminNoticias() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | number | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [status, setStatus] = useState('Publicado') // Default status
  const [scheduledDate, setScheduledDate] = useState('')

  // Image states
  const [files, setFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  const [submitting, setSubmitting] = useState(false)

  // Custom dropdown state
  const [statusOpen, setStatusOpen] = useState(false)

  const supabase = createClient()
  const { theme: currentTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  function fmtTime(iso?: string) {
    if (!iso) return '--:--'
    const d = new Date(iso)
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return news
    return news.filter(n => n.title?.toLowerCase().includes(term))
  }, [news, q])

  function handleEdit(item: NewsItem) {
    console.log('DEBUG: handleEdit item:', item)
    setEditingId(item.id || null)
    setTitle(item.title)
    setExcerpt(item.excerpt || '')
    setStatus(item.status || 'Publicado')

    // Handle images
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      console.log('DEBUG: Setting existingImages from item.images:', item.images)
      setExistingImages(item.images)
    } else if (item.image_url) {
      console.log('DEBUG: Setting existingImages from item.image_url:', item.image_url)
      setExistingImages([item.image_url])
    } else {
      setExistingImages([])
    }

    // Set scheduled date if exists, formatted for datetime-local input
    if (item.published_at) {
      const d = new Date(item.published_at)
      // Format: YYYY-MM-DDThh:mm
      const formatted = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      setScheduledDate(formatted)
    } else {
      setScheduledDate('')
    }

    setFiles([])
    setOpen(true)
  }

  function handleDelete(id: string | number) {
    setDeleteId(id)
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/news/${deleteId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Error al eliminar')
      }
      setDeleteId(null)
      await fetchNews()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    if (submitting) return
    setOpen(false)
    setEditingId(null)
    setTitle('')
    setExcerpt('')
    setStatus('Publicado')
    setScheduledDate('')
    setFiles([])
    setExistingImages([])
    setStatusOpen(false)
  }

  // Handle file selection
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      // Validate total count
      const totalImages = files.length + existingImages.length + newFiles.length
      if (totalImages > 5) {
        alert('Máximo 5 imágenes permitidas.')
        return
      }
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  // Remove file from selection
  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Remove existing image
  function removeExistingImage(index: number) {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title) return

    // Validate image count
    const totalImages = files.length + existingImages.length
    if (totalImages < 1) {
      alert('Debes subir al menos 1 imagen.')
      return
    }
    if (totalImages > 5) {
      alert('Máximo 5 imágenes permitidas.')
      return
    }

    try {
      setSubmitting(true)

      // Upload new files
      const uploadedUrls: string[] = []
      if (files.length > 0) {
        // Upload in parallel
        const uploadPromises = files.map(file => uploadToSupabase(supabase, file))
        const results = await Promise.all(uploadPromises)
        results.forEach(res => uploadedUrls.push(res.url))
      }

      // Combine existing and new images
      const finalImages = [...existingImages, ...uploadedUrls]

      const slug = slugify(title)
      const payload: any = {
        title,
        excerpt,
        slug,
        status,
        images: finalImages,
        image_url: finalImages[0] // Keep main image for backward compatibility
      }

      // Handle published_at logic
      if (status === 'Borrador') {
        payload.published_at = null
      } else if (scheduledDate) {
        // Use manual date for both Programado and Publicado if set
        payload.published_at = new Date(scheduledDate).toISOString()
      } else if (status === 'Publicado' && !editingId) {
        // Fallback: if Publicado but no date set (and new item), use now
        payload.published_at = new Date().toISOString()
      }

      console.log('DEBUG: handleSubmit payload:', payload)

      let res
      if (editingId) {
        // Update existing
        res = await fetch(`/api/news/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      } else {
        // Create new
        res = await fetch('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      }

      const responseData = await res.json().catch(() => null)
      if (!res.ok) {
        const msg = (responseData && (responseData.error || responseData.message || responseData.details)) || `HTTP ${res.status}`
        throw new Error(msg)
      }

      handleClose()
      await fetchNews()
    } catch (err: any) {
      console.error('DEBUG: Error in handleSubmit:', err)
      setError(err?.message || 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  // --- THEME CONFIGURATION ---
  const isDarkMode = mounted && resolvedTheme === 'dark';

  const theme = {
    bg: isDarkMode ? 'bg-[#171717]' : 'bg-[#EDEDED]',
    text: isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]',
    textSecondary: isDarkMode ? 'text-[#EDEDED]/60' : 'text-[#444444]',
    border: isDarkMode ? 'border-[#444444]' : 'border-[#d4d4d4]',
    surface: isDarkMode ? 'bg-[#171717]' : 'bg-[#EDEDED]',
    surfaceHover: isDarkMode ? 'hover:bg-[#444444]/20' : 'hover:bg-[#d4d4d4]/50',
    inputBg: isDarkMode ? 'bg-[#171717]' : 'bg-white',
    inputBorder: isDarkMode ? 'border-[#444444]' : 'border-[#d4d4d4]',
  };

  if (!mounted) return null;

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 ${theme.bg} ${theme.text} font-sans`}>

      <main className={`flex-1 overflow-y-auto p-8 transition-colors duration-300`}>

        {/* INFO BANNER */}
        <div className={`mb-8 border ${theme.border} rounded-xl p-6 relative overflow-hidden ${theme.surface} shadow-lg transition-colors duration-300`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#DA0037] rounded-full blur-[120px] opacity-10 pointer-events-none -mr-10 -mt-10"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h3 className={`text-lg font-bold mb-1 ${theme.text}`}>Panel de Publicaciones</h3>
              <p className={`${theme.textSecondary} text-sm`}>
                Gestiona las novedades visibles para los usuarios de la plataforma.
              </p>
            </div>
            <div className="hidden md:block opacity-80">
              <Globe className="text-[#DA0037]" size={32} />
            </div>
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textSecondary}`} size={18} />
            <input
              type="text"
              placeholder="Buscar noticias..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 ${theme.inputBg} border ${theme.inputBorder} rounded-lg ${theme.text} focus:outline-none focus:border-[#DA0037] focus:ring-1 focus:ring-[#DA0037] transition-all placeholder:text-gray-400`}
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button className={`flex items-center gap-2 px-4 py-2.5 border ${theme.border} ${theme.surface} ${theme.text} rounded-lg ${theme.surfaceHover} transition-colors`}>
              <Filter size={18} />
              <span>Filtros</span>
            </button>
            <button
              onClick={() => { setEditingId(null); setOpen(true); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#DA0037] text-white rounded-lg hover:bg-[#b0002c] transition-colors shadow-lg shadow-[#DA0037]/20 font-medium border border-transparent"
            >
              <Plus size={18} />
              <span>Nueva Noticia</span>
            </button>
          </div>
        </div>

        {/* NEWS CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading && (
            <div className="col-span-full p-8 text-center text-sm opacity-60">Cargando noticias...</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="col-span-full p-8 text-center text-sm opacity-60">No se encontraron noticias.</div>
          )}
          {filtered
            .slice()
            .sort((a, b) => {
              const ad = new Date(a.published_at || a.updated_at || a.created_at || 0).getTime()
              const bd = new Date(b.published_at || b.updated_at || b.created_at || 0).getTime()
              return bd - ad
            })
            .map((item) => (
              <div key={item.id} className={`rounded-xl border ${theme.border} ${theme.surface} overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative`}>

                {/* IMAGEN DE PORTADA */}
                <div className="h-40 w-full relative overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-[#262626]' : 'bg-gray-200'} text-xs opacity-50`}>Sin imagen</div>
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-[#171717]' : 'from-[#EDEDED]'} to-transparent opacity-60`}></div>
                  {/* Badge de Estado sobre la imagen */}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={item.status || 'Publicado'} isDarkMode={isDarkMode} />
                  </div>
                </div>

                {/* CONTENIDO DE LA TARJETA */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Fecha y Hora */}
                  <div className={`flex items-center gap-3 text-xs font-medium ${theme.textSecondary} mb-3`}>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#DA0037]" />
                      {fmtDate(item.published_at || item.updated_at || item.created_at)}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-[#DA0037]"></div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[#DA0037]" />
                      {fmtTime(item.published_at || item.updated_at || item.created_at)}
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className={`text-base font-bold ${theme.text} mb-2 group-hover:text-[#DA0037] transition-colors line-clamp-2 break-all`}>
                    {item.title}
                  </h3>

                  {/* Descripción */}
                  <p className={`text-sm ${theme.textSecondary} leading-relaxed line-clamp-2 flex-1 mb-4 break-all`}>
                    {item.excerpt || "Sin descripción"}
                  </p>

                  {/* ACCIONES */}
                  <div className={`pt-4 border-t ${theme.border} flex items-center justify-end gap-2`}>
                    <button
                      onClick={() => handleEdit(item)}
                      className={`p-1.5 ${theme.textSecondary} hover:${theme.text} hover:bg-[#DA0037]/10 rounded-lg transition-colors border border-transparent hover:border-[#DA0037]/30`}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => item.id && handleDelete(item.id)}
                      className={`p-1.5 ${theme.textSecondary} hover:text-[#DA0037] hover:bg-[#DA0037]/10 rounded-lg transition-colors border border-transparent hover:border-[#DA0037]/30`}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="md:hidden p-1.5 text-[#DA0037] hover:bg-[#DA0037]/10 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* PAGINATION SECTION - Placeholder for now */}
        <div className={`mt-8 pt-6 border-t ${theme.border} flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <p className={`text-sm ${theme.textSecondary}`}>
            Mostrando <span className={`font-bold ${theme.text}`}>1-{filtered.length}</span> de <span className={`font-bold ${theme.text}`}>{filtered.length}</span> noticias
          </p>

          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-lg border ${theme.border} ${theme.textSecondary} opacity-50 cursor-not-allowed`}
              disabled
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1">
              <button className={`w-8 h-8 rounded-lg bg-[#DA0037] text-white text-sm font-medium flex items-center justify-center shadow-lg shadow-[#DA0037]/20`}>
                1
              </button>
            </div>

            <button
              className={`p-2 rounded-lg border ${theme.border} ${theme.textSecondary} opacity-50 cursor-not-allowed`}
              disabled
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </main>

      {/* MODAL CREAR/EDITAR NOTICIA */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          <div className={`relative w-full max-w-2xl rounded-2xl border ${theme.border} ${theme.surface} p-6 md:p-8 shadow-2xl transform transition-all scale-100 max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl md:text-2xl font-bold ${theme.text}`}>
                {editingId ? 'Editar Noticia' : 'Nueva Noticia'}
              </h2>
              <button onClick={handleClose} className={`p-2 rounded-full hover:bg-black/5 ${isDarkMode ? 'hover:bg-white/10' : ''} transition-colors`}>
                <X className={`h-5 w-5 ${theme.text}`} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${theme.textSecondary} mb-2`}>Título</label>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Escribe el título de la noticia"
                  rows={2}
                  className={`w-full rounded-xl ${theme.inputBg} border ${theme.inputBorder} px-4 py-3 ${theme.text} placeholder:text-gray-500 focus:outline-none focus:border-[#DA0037] focus:ring-1 focus:ring-[#DA0037] transition-all resize-none`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${theme.textSecondary} mb-2`}>Contenido Corto</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Resumen o bajada de la noticia..."
                  rows={3}
                  className={`w-full rounded-xl ${theme.inputBg} border ${theme.inputBorder} px-4 py-3 ${theme.text} placeholder:text-gray-500 focus:outline-none focus:border-[#DA0037] focus:ring-1 focus:ring-[#DA0037] transition-all resize-none`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider ${theme.textSecondary} mb-2`}>
                  Imágenes (Mín 1, Máx 5)
                </label>

                {/* Image Previews */}
                {(existingImages.length > 0 || files.length > 0) && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4">
                    {/* Existing Images */}
                    {existingImages.map((url, idx) => (
                      <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                        <img src={url} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 text-center truncate">
                          Guardada
                        </div>
                      </div>
                    ))}

                    {/* New Files */}
                    {files.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                        <img src={URL.createObjectURL(file)} alt={`Nueva ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-500/80 text-white text-[10px] px-1 py-0.5 text-center truncate">
                          Nueva
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area */}
                {(existingImages.length + files.length) < 5 && (
                  <div
                    onDragOver={(e) => { e.preventDefault() }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files) {
                        const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                        if (files.length + existingImages.length + newFiles.length > 5) {
                          alert('Máximo 5 imágenes permitidas.');
                        } else {
                          setFiles(prev => [...prev, ...newFiles]);
                        }
                      }
                    }}
                    className={`rounded-xl border-2 border-dashed ${isDarkMode ? 'border-[#444444] bg-[#262626]/50' : 'border-[#d4d4d4] bg-gray-50'} px-6 py-8 flex flex-col items-center justify-center text-center transition-colors hover:border-[#DA0037]/50 cursor-pointer group`}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <div className={`p-3 rounded-full ${isDarkMode ? 'bg-[#333]' : 'bg-white'} mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                      <UploadCloud className="h-5 w-5 text-[#DA0037]" />
                    </div>
                    <div className={`text-sm font-medium ${theme.text}`}>
                      Haz clic o arrastra imágenes
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {5 - (existingImages.length + files.length)} restantes (Máx 5)
                    </p>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider ${theme.textSecondary} mb-2`}>Estado</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setStatusOpen(!statusOpen)}
                      className={`w-full text-left rounded-xl ${theme.inputBg} border ${theme.inputBorder} px-4 py-3 ${theme.text} focus:outline-none focus:border-[#DA0037] focus:ring-1 focus:ring-[#DA0037] transition-all flex items-center justify-between`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${status === 'Publicado' ? 'bg-green-500' : status === 'Borrador' ? 'bg-gray-400' : 'bg-blue-500'}`}></span>
                        {status}
                      </span>
                      <svg className={`w-4 h-4 transition-transform ${statusOpen ? 'rotate-180' : ''} opacity-50`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {statusOpen && (
                      <div className={`absolute z-10 w-full mt-2 rounded-xl border ${theme.border} ${theme.surface} shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100`}>
                        {['Publicado', 'Borrador', 'Programado'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { setStatus(opt); setStatusOpen(false); }}
                            className={`w-full text-left px-4 py-3 text-sm hover:${theme.surfaceHover} transition-colors flex items-center gap-2 ${status === opt ? 'bg-[#DA0037]/5 text-[#DA0037] font-medium' : theme.text}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${opt === 'Publicado' ? 'bg-green-500' : opt === 'Borrador' ? 'bg-gray-400' : 'bg-blue-500'}`}></span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {status === 'Programado' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className={`block text-xs font-bold uppercase tracking-wider ${theme.textSecondary} mb-2`}>Fecha de Publicación</label>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => {
                        console.log('DEBUG: Date changed to:', e.target.value)
                        setScheduledDate(e.target.value)
                      }}
                      step="any"
                      required={status === 'Programado'}
                      className={`w-full rounded-xl ${theme.inputBg} border ${theme.inputBorder} px-4 py-3 ${theme.text} focus:outline-none focus:border-[#DA0037] focus:ring-1 focus:ring-[#DA0037] transition-all`}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleClose}
                  className={`px-5 py-2.5 rounded-lg font-medium ${theme.textSecondary} hover:${theme.text} hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title || ((files.length + existingImages.length) === 0) || (status === 'Programado' && !scheduledDate)}
                  className="px-6 py-2.5 rounded-lg bg-[#DA0037] hover:bg-[#b0002c] text-white font-bold shadow-lg shadow-[#DA0037]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                >
                  {submitting ? (editingId ? 'Guardando...' : 'Publicando...') : (editingId ? 'Guardar Cambios' : 'Publicar Noticia')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !loading && setDeleteId(null)}
          />
          <div className={`relative w-full max-w-sm rounded-2xl border ${theme.border} ${theme.surface} p-6 shadow-2xl transform transition-all scale-100`}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                {loading ? <Loader2 className="animate-spin" size={32} /> : <Trash2 size={32} />}
              </div>
              <div>
                <h3 className={`text-lg font-bold ${theme.text} mb-2`}>
                  {loading ? 'Eliminando...' : '¿Eliminar noticia?'}
                </h3>
                <p className={`text-sm ${theme.textSecondary}`}>
                  {loading
                    ? 'Por favor espera mientras se elimina la noticia...'
                    : '¿Estás seguro de que quieres eliminar esta noticia? Esta acción no se puede deshacer.'}
                </p>
              </div>
              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={loading}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium ${theme.textSecondary} hover:${theme.text} hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Eliminando</span>
                    </>
                  ) : (
                    'Eliminar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Badge de estado adaptado
const StatusBadge = ({ status, isDarkMode }: { status: string, isDarkMode: boolean }) => {
  const styles: Record<string, string> = {
    'Publicado': isDarkMode
      ? 'text-green-400 bg-green-900/60 border-green-900/50 backdrop-blur-md'
      : 'text-green-800 bg-green-100 border-green-200',
    'Borrador': isDarkMode
      ? 'text-[#EDEDED]/80 bg-[#444444]/60 border-[#444444]/50 backdrop-blur-md'
      : 'text-[#444444] bg-[#d4d4d4]/50 border-[#d4d4d4]',
    'Programado': isDarkMode
      ? 'text-blue-400 bg-blue-900/60 border-blue-900/50 backdrop-blur-md'
      : 'text-blue-700 bg-blue-100 border-blue-200',
  };

  const activeStyle = styles[status] || styles['Borrador'];
  const dotColor = status === 'Publicado'
    ? 'bg-green-500'
    : status === 'Borrador'
      ? (isDarkMode ? 'bg-[#EDEDED]/50' : 'bg-[#444444]/50')
      : 'bg-blue-500';

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${activeStyle} flex items-center w-fit gap-1.5 shadow-sm`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
};

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
  console.log('DEBUG: uploadToSupabase called for file:', file.name, 'Size:', file.size)
  const form = new FormData()
  form.append('file', file)
  console.log('DEBUG: Fetching /api/admin/upload...')
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form, credentials: 'include' })
  console.log('DEBUG: Upload response status:', res.status)

  const text = await res.text()
  console.log('DEBUG: Raw response body:', text.substring(0, 200)) // Log first 200 chars

  let json
  try {
    json = JSON.parse(text)
  } catch (e) {
    throw new Error(`Server returned non-JSON response (Status ${res.status}): ${text.substring(0, 100)}...`)
  }

  console.log('DEBUG: Upload response json:', json)
  if (!res.ok) throw new Error(json?.error || 'Upload failed')
  return json as { path: string, url: string }
}
