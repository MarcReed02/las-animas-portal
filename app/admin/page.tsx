'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiDownload, FiList, FiRefreshCw, FiSearch } from 'react-icons/fi';

import { formatRut } from '@/lib/rut';
import { createClient } from '@/lib/supabase/client';

type Solicitud = {
  id: string;
  nombres: string | null;
  apellidos: string | null;
  rut: string;
  correo: string;
  telefono: string | null;
  direccion: string | null;
  documento_url: string | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  admin_responsable: string | null;
  fecha_solicitud: string | null;
  created_at: string | null;
};

const formatFullName = (nombres?: string | null, apellidos?: string | null) => {
  const first = (nombres ?? '').trim();
  const last = (apellidos ?? '').trim();
  const combined = [first, last].filter(Boolean).join(' ').trim();
  return combined || first || last || 'Sin nombre';
};

type SolicitudAnuncio = {
  id: string;
  user_id: string | null;
  usuario_nombre?: string | null;
  titulo: string;
  descripcion: string | null;
  categoria_principal: string | null;
  subcategoria: string | null;
  horario: string | null;
  direccion: string | null;
  mostrar_telefono: boolean | null;
  telefono_snapshot: string | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | null;
  created_at: string | null;
  updated_at: string | null;
};

const ESTADOS: Array<{ key: Solicitud['estado'] | 'todas'; label: string }> = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'aprobado', label: 'Aprobadas' },
  { key: 'rechazado', label: 'Rechazadas' },
  { key: 'todas', label: 'Todas' },
];

export default function AdminSolicitudesPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Solicitud[]>([]);
  const [anuncioItems, setAnuncioItems] = useState<SolicitudAnuncio[]>([]);
  const [loading, setLoading] = useState(false);
  const [anuncioLoading, setAnuncioLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anuncioError, setAnuncioError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [qAnuncio, setQAnuncio] = useState('');
  const [estado, setEstado] = useState<Solicitud['estado'] | 'todas'>('pendiente');
  const [estadoAnuncio, setEstadoAnuncio] = useState<SolicitudAnuncio['estado'] | 'todas'>('pendiente');
  const [docLoadingId, setDocLoadingId] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ id: string; top: number; left: number } | null>(null);
  const [menuAnuncioAnchor, setMenuAnuncioAnchor] = useState<{ id: string; top: number; left: number } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionAnuncioLoadingId, setActionAnuncioLoadingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{ solicitud: Solicitud; estado: Solicitud['estado'] } | null>(null);
  const [pendingAnuncioAction, setPendingAnuncioAction] = useState<{ solicitud: SolicitudAnuncio; estado: 'aprobado' | 'rechazado' } | null>(null);
  const DEFAULT_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_DOCUMENTS_BUCKET || 'documentos';

  useEffect(() => {
    fetchData();
    fetchAnuncios();
  }, []);

  async function fetchData() {
    console.log('[admin] 1. Iniciando fetchData...');
    setLoading(true);
    setError(null);
    try {
      console.log('[admin] 2. Ejecutando query Supabase...');
      const { data, error } = await supabase
        .from('solicitudes_registro')
        .select('id,nombres,apellidos,rut,correo,telefono,direccion,documento_url,estado,admin_responsable,fecha_solicitud,created_at')
        .order('fecha_solicitud', { ascending: false });

      console.log('[admin] 3. Query completada');
      console.log('[admin] 4. Error object:', error);
      console.log('[admin] 5. Error message:', error?.message);
      console.log('[admin] 6. Error code:', (error as any)?.code);
      console.log('[admin] 7. Data length:', data?.length);

      if (error) {
        console.error('[admin] 8. Error completo:', JSON.stringify(error, null, 2));
        console.error('[admin] detalles query', (error as any)?.details);
        throw error;
      }

      console.log('[admin] 9. Solicitudes cargadas exitosamente:', data);
      setItems((data as Solicitud[]) || []);
    } catch (e: any) {
      console.error('[admin] 10. Catch error:', e);
      console.error('[admin] 11. Stack trace:', e?.stack);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAnuncios() {
    setAnuncioLoading(true);
    setAnuncioError(null);
    try {
      const response = await fetch('/api/anuncios/list');
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || 'No se pudieron cargar las solicitudes de anuncios.');
      const normalizeEstado = (value: string | null) => {
        const v = (value || '').toLowerCase();
        if (v === 'pending' || v === 'pendiente') return 'pendiente';
        if (v === 'approved' || v === 'aprobado') return 'aprobado';
        if (v === 'rejected' || v === 'rechazado') return 'rechazado';
        return 'pendiente';
      };
      const normalized = ((payload?.data as SolicitudAnuncio[]) || []).map((item) => ({
        ...item,
        estado: normalizeEstado(item.estado as any),
      }));
      setAnuncioItems(normalized);
    } catch (e: any) {
      setAnuncioError(e?.message || 'No se pudieron cargar las solicitudes de anuncios.');
    } finally {
      setAnuncioLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const byEstado = estado === 'todas' ? items : items.filter((i) => i.estado === estado);
    const term = q.trim().toLowerCase();
    if (!term) return byEstado;
    return byEstado.filter((i) => {
      const fullName = formatFullName(i.nombres, i.apellidos).toLowerCase();
      return (
        fullName.includes(term) ||
        i.rut?.toLowerCase().includes(term) ||
        i.correo?.toLowerCase().includes(term)
      );
    });
  }, [items, estado, q]);

  const filteredAnuncios = useMemo(() => {
    const byEstado = estadoAnuncio === 'todas' ? anuncioItems : anuncioItems.filter((i) => i.estado === estadoAnuncio);
    const term = qAnuncio.trim().toLowerCase();
    if (!term) return byEstado;
    return byEstado.filter((i) => {
      return (
        i.titulo?.toLowerCase().includes(term) ||
        i.categoria_principal?.toLowerCase().includes(term) ||
        i.subcategoria?.toLowerCase().includes(term) ||
        i.descripcion?.toLowerCase().includes(term)
      );
    });
  }, [anuncioItems, estadoAnuncio, qAnuncio]);

  function fmtDate(iso?: string | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getFullYear(),
    ).slice(-2)}`;
    const time = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    return `${date} - ${time}`;
  }

  function fmtRut(value?: string | null) {
    if (!value) return '—';
    return formatRut(value);
  }

  function resolveDocumentLocation(url?: string | null) {
    if (!url) return null;
    if (!url.includes('/')) {
      return { bucket: DEFAULT_BUCKET, path: url };
    }

    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split('/').filter(Boolean);
      const objectIdx = segments.findIndex((seg) => seg === 'object');
      if (objectIdx !== -1 && segments.length >= objectIdx + 3) {
        const bucket = segments[objectIdx + 2];
        const path = segments.slice(objectIdx + 3).join('/');
        return { bucket, path };
      }
      return { bucket: DEFAULT_BUCKET, path: segments.join('/') };
    } catch {
      const clean = url.replace(/^\/+/, '');
      return { bucket: DEFAULT_BUCKET, path: clean };
    }
  }

  async function openDocument(documentUrl: string | null, id: string) {
    if (!documentUrl) {
      setDocError('Documento no disponible.');
      return;
    }
    try {
      setDocError(null);
      setDocLoadingId(id);
      const location = resolveDocumentLocation(documentUrl);
      if (!location?.path) {
        throw new Error('Ruta de documento inválida.');
      }
      const params = new URLSearchParams({
        bucket: location.bucket,
        path: location.path,
      });
      const res = await fetch(`/api/documents/sign?${params.toString()}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'No se pudo obtener el documento.');
      }
      const { signedUrl } = await res.json();
      if (!signedUrl) throw new Error('No se obtuvo un enlace firmado.');
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (e: any) {
      console.error('[admin] error al abrir documento', e);
      setDocError(e?.message || 'No se pudo abrir el documento.');
    } finally {
      setDocLoadingId(null);
    }
  }

  function closeMenu() {
    setMenuAnchor(null);
  }

  function toggleMenu(event: React.MouseEvent<HTMLButtonElement>, id: string) {
    const rect = event.currentTarget.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 8;
    const left = rect.right + window.scrollX - 220;
    setMenuAnchor((current) => (current?.id === id ? null : { id, top, left }));
  }

  function closeAnuncioMenu() {
    setMenuAnuncioAnchor(null);
  }

  function toggleAnuncioMenu(event: React.MouseEvent<HTMLButtonElement>, id: string) {
    const rect = event.currentTarget.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 8;
    const left = rect.right + window.scrollX - 220;
    setMenuAnuncioAnchor((current) => (current?.id === id ? null : { id, top, left }));
  }

  async function updateSolicitudEstado(s: Solicitud, nuevoEstado: Solicitud['estado']) {
    try {
      if (s.estado !== 'pendiente') {
        setDocError('La solicitud ya fue gestionada. No es posible cambiar su estado.');
        return;
      }
      setActionLoadingId(s.id);
      setDocError(null);
      if (nuevoEstado === 'aprobado') {
        console.log('[admin] llamando a /api/auth/create-user', { solicitudId: s.id });
        const emailIntentado = s.correo || null;
        const response = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ solicitudId: s.id }),
        });
        let payload: any = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }
        if (!response.ok) {
          console.error('[admin] ERROR COMPLETO AL CREAR USUARIO:', {
            status: response.status,
            statusText: response.statusText,
            payload_completo: payload,
            url: response.url,
            email_intentado: emailIntentado,
            timestamp: new Date().toISOString(),
          });
          throw new Error(payload?.error || 'No se pudo crear el usuario en Auth.');
        }
        console.log('[admin] usuario creado correctamente', payload);
      }
      const { data: userData } = await supabase.auth.getUser();
      const adminId = userData?.user?.id ?? null;
      const { error } = await supabase
        .from('solicitudes_registro')
        .update({ estado: nuevoEstado, admin_responsable: adminId || null })
        .eq('id', s.id);
      if (error) throw error;
      await fetchData();
    } catch (e: any) {
      console.error('[admin] error al actualizar solicitud', e);
      setDocError(e?.message || 'No se pudo actualizar la solicitud.');
    } finally {
      setActionLoadingId(null);
      closeMenu();
    }
  }

  async function updateAnuncioEstado(s: SolicitudAnuncio, nuevoEstado: 'aprobado' | 'rechazado') {
    try {
      if (s.estado && s.estado !== 'pendiente') {
        setAnuncioError('La solicitud ya fue gestionada.');
        return;
      }
      setActionAnuncioLoadingId(s.id);
      const res = await fetch('/api/anuncios/crear', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, estado: nuevoEstado === 'aprobado' ? 'approved' : 'rejected' }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error || 'No se pudo actualizar la solicitud.');
      await fetchAnuncios();
    } catch (e: any) {
      setAnuncioError(e?.message || 'No se pudo actualizar la solicitud de anuncio.');
    } finally {
      setActionAnuncioLoadingId(null);
      closeAnuncioMenu();
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold">Solicitudes de registro</h1>
        <div className="hidden md:flex items-center gap-2 text-white/80">
          <button
            onClick={fetchData}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-white/10 hover:bg-white/10"
          >
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

      <div className="flex flex-wrap gap-3 rounded-full">
        {ESTADOS.map((t) => {
          const count = t.key === 'todas' ? items.length : items.filter((i) => i.estado === t.key).length;
          const active = estado === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setEstado(t.key)}
              className={`px-4 py-2 rounded-xl border transition-colors text-sm ${
                active ? 'bg-white/10 border-white/20' : 'border-white/10 hover:bg-white/5'
              }`}
            >
              <span className={t.key === 'pendiente' ? 'text-red-600 font-semibold' : ''}>{count}</span> {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden shadow-lg">
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
              <input
                type="date"
                className="w-full rounded-xl bg-black/30 border border-white/10 pl-9 pr-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
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
                  <th className="text-left font-normal px-4 py-4">Teléfono</th>
                  <th className="text-left font-normal px-4 py-4">Dirección</th>
                  <th className="text-left font-normal px-4 py-4">Estado</th>
                  <th className="text-left font-normal px-4 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="px-4 py-6" colSpan={8}>
                      Cargando...
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td className="px-4 py-6" colSpan={8}>
                      Sin resultados
                    </td>
                  </tr>
                )}
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-2 whitespace-nowrap">{fmtDate(s.fecha_solicitud ?? s.created_at)}</td>
                    <td className="px-4 py-2">{fmtRut(s.rut)}</td>
                    <td className="px-4 py-2 font-medium">{formatFullName(s.nombres, s.apellidos)}</td>
                    <td className="px-4 py-2">{s.correo}</td>
                    <td className="px-4 py-2">
                      {s.documento_url ? (
                        <button
                          onClick={() => openDocument(s.documento_url, s.id)}
                          disabled={docLoadingId === s.id}
                          className="text-blue-300 hover:underline disabled:opacity-50"
                        >
                          {docLoadingId === s.id ? 'Abriendo...' : 'Ver'}
                        </button>
                      ) : (
                        <span className="text-white/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{s.telefono ?? '—'}</td>
                    <td className="px-4 py-2">{s.direccion ?? '—'}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          s.estado === 'pendiente'
                            ? 'inline-flex items-center gap-2 rounded-full border border-yellow-400/60 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300'
                            : s.estado === 'aprobado'
                            ? 'inline-flex items-center gap-2 rounded-full border border-green-400/60 bg-green-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-300'
                            : 'inline-flex items-center gap-2 rounded-full border border-red-400/60 bg-red-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-300'
                        }
                      >
                        <span
                          className={
                            s.estado === 'pendiente'
                              ? 'h-2 w-2 rounded-full bg-yellow-300'
                              : s.estado === 'aprobado'
                              ? 'h-2 w-2 rounded-full bg-green-300'
                              : 'h-2 w-2 rounded-full bg-red-300'
                          }
                        />
                        {s.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {s.estado === 'pendiente' ? (
                        <button
                          onClick={(e) => toggleMenu(e, s.id)}
                          className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/80 hover:border-white/40 transition"
                        >
                          Acciones
                        </button>
                      ) : (
                        <span className="text-white/40 text-sm">Sin acciones</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 text-white/70 text-sm">
            <div>
              Mostrando {filtered.length > 0 ? 1 : 0}–{Math.min(filtered.length, 10)} de {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <button className="h-8 w-8 rounded-md bg-white/5 hover:bg-white/10">1</button>
              <button className="h-8 w-8 rounded-md bg-white/5 hover:bg-white/10">2</button>
              <button className="h-8 w-8 rounded-md bg-white/5 hover:bg-white/10">3</button>
            </div>
          </div>
        </div>
      </div>

      
      {menuAnchor &&
        (() => {
          const current = items.find((item) => item.id === menuAnchor.id);
          if (!current) return null;
          const left = Math.max(menuAnchor.left, 16);
          return (
            <>
              <div className="fixed inset-0 z-30" onClick={closeMenu} />
              <div
                className="fixed z-40 min-w-[200px] rounded-2xl border border-white/10 bg-[#161616] p-2 text-sm shadow-2xl"
                style={{ top: menuAnchor.top, left }}
              >
                <button
                  onClick={() => {
                    setPendingAction({ solicitud: current, estado: 'aprobado' });
                    closeMenu();
                  }}
                  disabled={actionLoadingId === current.id}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-white/90 hover:bg-white/10 disabled:opacity-60"
                >
                  <span className="text-green-400">✓</span>
                  {actionLoadingId === current.id ? 'Aceptando...' : 'Aceptar solicitud'}
                </button>
                <button
                  onClick={() => {
                    setPendingAction({ solicitud: current, estado: 'rechazado' });
                    closeMenu();
                  }}
                  disabled={actionLoadingId === current.id}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-white/90 hover:bg-white/10 disabled:opacity-60"
                >
                  <span className="text-red-400">✗</span>
                  {actionLoadingId === current.id ? 'Rechazando...' : 'Rechazar solicitud'}
                </button>
              </div>
            </>
          );
        })()}


      {pendingAction && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-[#161616] p-6 text-white shadow-2xl">
            <h3 className="text-xl font-semibold mb-2">Confirmar accion</h3>
            <p className="text-sm text-white/80 mb-4">
              Estas seguro de {pendingAction.estado === 'aprobado' ? 'aprobar' : 'rechazar'} la solicitud de{' '}
              <span className="font-semibold">{formatFullName(pendingAction.solicitud.nombres, pendingAction.solicitud.apellidos)}</span>? Esta accion no se puede deshacer.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPendingAction(null)}
                className="flex-1 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const target = pendingAction;
                  if (!target) return;
                  updateSolicitudEstado(target.solicitud, target.estado);
                  setPendingAction(null);
                }}
                disabled={actionLoadingId === pendingAction.solicitud.id}
                className={pendingAction.estado === 'aprobado'
                  ? 'flex-1 rounded-xl bg-green-500/80 px-4 py-2 text-sm font-semibold text-black hover:bg-green-500 disabled:opacity-60'
                  : 'flex-1 rounded-xl bg-red-500/80 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60'}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {menuAnuncioAnchor &&
        (() => {
          const current = anuncioItems.find((item) => item.id === menuAnuncioAnchor.id);
          if (!current) return null;
          const left = Math.max(menuAnuncioAnchor.left, 16);
          return (
            <>
              <div className="fixed inset-0 z-30" onClick={closeAnuncioMenu} />
              <div
                className="fixed z-40 min-w-[200px] rounded-2xl border border-white/10 bg-[#161616] p-2 text-sm shadow-2xl"
                style={{ top: menuAnuncioAnchor.top, left }}
              >
                <button
                  onClick={() => {
                    setPendingAnuncioAction({ solicitud: current, estado: 'aprobado' });
                    closeAnuncioMenu();
                  }}
                  disabled={actionAnuncioLoadingId === current.id}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-white/90 hover:bg-white/10 disabled:opacity-60"
                >
                  <span className="text-green-400">✔</span>
                  {actionAnuncioLoadingId === current.id ? 'Aceptando...' : 'Aceptar anuncio'}
                </button>
                <button
                  onClick={() => {
                    setPendingAnuncioAction({ solicitud: current, estado: 'rechazado' });
                    closeAnuncioMenu();
                  }}
                  disabled={actionAnuncioLoadingId === current.id}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-white/90 hover:bg-white/10 disabled:opacity-60"
                >
                  <span className="text-red-400">✖</span>
                  {actionAnuncioLoadingId === current.id ? 'Rechazando...' : 'Rechazar anuncio'}
                </button>
              </div>
            </>
          );
        })()}

      {pendingAnuncioAction && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-[#161616] p-6 text-white shadow-2xl">
            <h3 className="text-xl font-semibold mb-2">Confirmar accion</h3>
            <p className="text-sm text-white/80 mb-4">
              Estas seguro de {pendingAnuncioAction.estado === 'aprobado' ? 'aprobar' : 'rechazar'} el anuncio{' '}
              <span className="font-semibold">{pendingAnuncioAction.solicitud.titulo}</span>? Esta accion no se puede deshacer.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPendingAnuncioAction(null)}
                className="flex-1 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const target = pendingAnuncioAction;
                  if (!target) return;
                  updateAnuncioEstado(target.solicitud, target.estado);
                  setPendingAnuncioAction(null);
                }}
                disabled={actionAnuncioLoadingId === pendingAnuncioAction.solicitud.id}
                className={pendingAnuncioAction.estado === 'aprobado'
                  ? 'flex-1 rounded-xl bg-green-500/80 px-4 py-2 text-sm font-semibold text-black hover:bg-green-500 disabled:opacity-60'
                  : 'flex-1 rounded-xl bg-red-500/80 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60'}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {docError && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">{docError}</div>
      )}
      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          Error: {error}
        </div>
      )}

      {/* Seccion de solicitudes de anuncios */}
      <div className="mt-10 space-y-4 rounded-xl border border-white/10 bg-[#111111] p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Solicitudes de anuncios</h2>
            <p className="text-sm text-white/60">Revisa y aprueba o rechaza las solicitudes de anuncios.</p>
          </div>
          <button
            onClick={fetchAnuncios}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-white/10 hover:bg-white/10"
          >
            <FiRefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 rounded-full">
          {ESTADOS.map((t) => {
            const count =
              t.key === 'todas'
                ? anuncioItems.length
                : anuncioItems.filter((i) => i.estado === t.key).length;
            const active = estadoAnuncio === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setEstadoAnuncio(t.key as any)}
                className={`px-4 py-2 rounded-xl border transition-colors text-sm ${
                  active ? 'bg-white/10 border-white/20' : 'border-white/10 hover:bg-white/5'
                }`}
              >
                <span className={t.key === 'pendiente' ? 'text-red-600 font-semibold' : ''}>{count}</span> {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
            <input
              placeholder="Buscar por titulo, categoria, descripcion..."
              value={qAnuncio}
              onChange={(e) => setQAnuncio(e.target.value)}
              className="w-full bg-black/30 border border-white/10 pl-9 pr-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 rounded-xl"
            />
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-black/40 text-white/70">
              <tr>
                <th className="text-left font-normal px-4 py-4 w-[110px]">Fecha</th>
                <th className="text-left font-normal px-4 py-4">Comercio / Usuario</th>
                <th className="text-left font-normal px-4 py-4">Titulo</th>
                <th className="text-left font-normal px-4 py-4">Categoria</th>
                <th className="text-left font-normal px-4 py-4">Subcategoria</th>
                <th className="text-left font-normal px-4 py-4">Direccion</th>
                <th className="text-left font-normal px-4 py-4">Telefono</th>
                <th className="text-left font-normal px-4 py-4">Estado</th>
                <th className="text-left font-normal px-4 py-4">Ultima actualizacion</th>
                <th className="text-left font-normal px-4 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {anuncioLoading && (
                <tr>
                  <td className="px-4 py-6" colSpan={7}>
                    Cargando...
                  </td>
                </tr>
              )}
              {!anuncioLoading && filteredAnuncios.length === 0 && (
                <tr>
                  <td className="px-4 py-6" colSpan={7}>
                    Sin resultados
                  </td>
                </tr>
              )}
              {filteredAnuncios.map((s) => (
                <tr key={s.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-4 py-2 whitespace-nowrap">{fmtDate(s.created_at)}</td>
                  <td className="px-4 py-2">{s.usuario_nombre || s.user_id || '—'}</td>
                  <td className="px-4 py-2 font-medium">{s.titulo}</td>
                  <td className="px-4 py-2">{s.categoria_principal || '—'}</td>
                  <td className="px-4 py-2">{s.subcategoria || '—'}</td>
                  <td className="px-4 py-2">{s.direccion || '—'}</td>
                  <td className="px-4 py-2">{s.mostrar_telefono ? s.telefono_snapshot || '—' : 'No mostrado'}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        s.estado === 'pendiente'
                          ? 'inline-flex items-center gap-2 rounded-full border border-yellow-400/60 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300'
                          : s.estado === 'aprobado'
                          ? 'inline-flex items-center gap-2 rounded-full border border-green-400/60 bg-green-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-300'
                          : 'inline-flex items-center gap-2 rounded-full border border-red-400/60 bg-red-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-300'
                      }
                    >
                      <span
                        className={
                          s.estado === 'pendiente'
                            ? 'h-2 w-2 rounded-full bg-yellow-300'
                            : s.estado === 'aprobado'
                            ? 'h-2 w-2 rounded-full bg-green-300'
                            : 'h-2 w-2 rounded-full bg-red-300'
                        }
                      />
                      {s.estado || 'pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{fmtDate(s.updated_at || s.created_at)}</td>
                  <td className="px-4 py-2">
                    {(!s.estado || s.estado === 'pendiente') ? (
                      <button
                        onClick={(e) => toggleAnuncioMenu(e, s.id)}
                        className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/80 hover:border-white/40 transition"
                      >
                        Acciones
                      </button>
                    ) : (
                      <span className="text-white/40 text-sm">Sin acciones</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {anuncioError && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            Error: {anuncioError}
          </div>
        )}
      </div>
    </div>
  );
}
