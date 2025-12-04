'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  CheckCircle,
  Lock,
  Store,
  UserCheck,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Tag,
  RefreshCw,
  Sun,
  Moon,
  Bell,
  User
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { formatRut } from '@/lib/rut';
import { createClient } from '@/lib/supabase/client';
import MinimalFooter from '@/components/minimal-footer';

// --- THEME CONFIGURATION ---
const themeConfig = {
  dark: {
    bg: '#171717',
    surface: '#171717',
    surfaceHighlight: '#262626',
    border: '#444444',
    text: '#EDEDED',
    textSecondary: 'rgba(237, 237, 237, 0.6)',
    inputBg: '#171717',
    hover: 'rgba(68, 68, 68, 0.4)',
    toggleBg: 'rgba(0, 0, 0, 0.2)',
    toggleBorder: '#333333'
  },
  light: {
    bg: '#F3F4F6',
    surface: '#FFFFFF',
    surfaceHighlight: '#F9FAFB',
    border: '#E5E7EB',
    text: '#111827',
    textSecondary: '#6B7280',
    inputBg: '#FFFFFF',
    hover: '#F3F4F6',
    toggleBg: '#E5E7EB',
    toggleBorder: '#D1D5DB'
  }
};

// --- TYPES ---
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

// --- HELPER FUNCTIONS ---
const formatFullName = (nombres?: string | null, apellidos?: string | null) => {
  const first = (nombres ?? '').trim();
  const last = (apellidos ?? '').trim();
  const combined = [first, last].filter(Boolean).join(' ').trim();
  return combined || first || last || 'Sin nombre';
};

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
  const time = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  return `${date} - ${time}`;
}

function fmtRut(value?: string | null) {
  if (!value) return '—';
  return formatRut(value);
}

function formatSchedule(jsonString?: string | null) {
  if (!jsonString) return '—';
  try {
    const data = JSON.parse(jsonString);
    const { days, time } = data;
    if (!days || !time || !Array.isArray(days)) return '—';

    const daysMap = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const sortedDays = days.sort((a: number, b: number) => a - b);

    // Check for "Lunes a Viernes" (1,2,3,4,5)
    const isMonFri = sortedDays.length === 5 && sortedDays.every((d, i) => d === i + 1);
    // Check for "Todos los días" (0,1,2,3,4,5,6)
    const isAllDays = sortedDays.length === 7;

    let dayStr = '';
    if (isAllDays) dayStr = 'Todos los días';
    else if (isMonFri) dayStr = 'Lun a Vie';
    else dayStr = sortedDays.map((d: number) => daysMap[d]).join(', ');

    return `${dayStr} • ${time.start} - ${time.end}`;
  } catch (e) {
    return '—';
  }
}

// Badge de estado
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    aprobado: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    rechazado: 'bg-[#DA0037]/10 text-[#DA0037] border-[#DA0037]/20',
    pendiente: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles[status] || styles.pendiente}`}>
      {status}
    </span>
  );
};

// --- MAIN COMPONENT ---
export default function AdminDashboard() {
  const supabase = createClient();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Data State
  const [items, setItems] = useState<Solicitud[]>([]);
  const [anuncioItems, setAnuncioItems] = useState<SolicitudAnuncio[]>([]);
  const [loading, setLoading] = useState(false);
  const [anuncioLoading, setAnuncioLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anuncioError, setAnuncioError] = useState<string | null>(null);
  const [docLoadingId, setDocLoadingId] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionAnuncioLoadingId, setActionAnuncioLoadingId] = useState<string | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState('pendiente');
  const [requestType, setRequestType] = useState<'users' | 'commerce'>('commerce');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | null;
    entity: 'user' | 'commerce' | null;
    data: Solicitud | SolicitudAnuncio | null;
  }>({
    isOpen: false,
    type: null,
    entity: null,
    data: null
  });

  const DEFAULT_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_DOCUMENTS_BUCKET || 'documentos';

  // --- EFFECTS ---
  useEffect(() => {
    setMounted(true);
    fetchData();
    fetchAnuncios();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, requestType, searchTerm]);

  // Determine current theme colors
  const currentThemeKey = (mounted && (theme === 'dark' || resolvedTheme === 'dark')) ? 'dark' : 'light';
  const currentTheme = themeConfig[currentThemeKey];

  // --- DATA FETCHING ---
  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('solicitudes_registro')
        .select('id,nombres,apellidos,rut,correo,telefono,direccion,documento_url,estado,admin_responsable,fecha_solicitud,created_at')
        .order('fecha_solicitud', { ascending: false });

      if (error) throw error;
      setItems((data as Solicitud[]) || []);
    } catch (e: any) {
      console.error('[admin] Error fetching requests:', e);
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
        estado: normalizeEstado(item.estado as any) as 'pendiente' | 'aprobado' | 'rechazado' | null,
      }));
      setAnuncioItems(normalized);
    } catch (e: any) {
      setAnuncioError(e?.message || 'No se pudieron cargar las solicitudes de anuncios.');
    } finally {
      setAnuncioLoading(false);
    }
  }

  // --- DOCUMENT HANDLING ---
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
      if (!location?.path) throw new Error('Ruta de documento inválida.');

      const params = new URLSearchParams({ bucket: location.bucket, path: location.path });
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

  // --- ACTIONS ---
  async function updateSolicitudEstado(s: Solicitud, nuevoEstado: Solicitud['estado']) {
    try {
      if (s.estado !== 'pendiente') {
        setDocError('La solicitud ya fue gestionada.');
        return;
      }
      setActionLoadingId(s.id);
      setDocError(null);
      if (nuevoEstado === 'aprobado') {
        const response = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ solicitudId: s.id }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error || 'No se pudo crear el usuario en Auth.');
        }
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
    }
  }

  // --- MODAL HANDLERS ---
  const requestConfirmation = (type: 'approve' | 'reject', entity: 'user' | 'commerce', data: Solicitud | SolicitudAnuncio) => {
    setModalConfig({ isOpen: true, type, entity, data });
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const executeAction = async () => {
    const { type, entity, data } = modalConfig;
    if (!data || !type || !entity) return;

    if (entity === 'user') {
      await updateSolicitudEstado(data as Solicitud, type === 'approve' ? 'aprobado' : 'rechazado');
    } else {
      await updateAnuncioEstado(data as SolicitudAnuncio, type === 'approve' ? 'aprobado' : 'rechazado');
    }
    closeModal();
  };

  // --- FILTERING & PAGINATION ---
  const filteredList = useMemo(() => {
    const list = requestType === 'users' ? items : anuncioItems;
    return list.filter((item: any) => {
      const matchesStatus = activeTab === 'todas' || item.estado === activeTab;
      const term = searchTerm.toLowerCase();

      if (requestType === 'users') {
        const s = item as Solicitud;
        const fullName = formatFullName(s.nombres, s.apellidos).toLowerCase();
        return matchesStatus && (
          fullName.includes(term) ||
          s.rut.toLowerCase().includes(term) ||
          s.correo.toLowerCase().includes(term)
        );
      } else {
        const s = item as SolicitudAnuncio;
        return matchesStatus && (
          s.titulo.toLowerCase().includes(term) ||
          s.categoria_principal?.toLowerCase().includes(term) ||
          s.subcategoria?.toLowerCase().includes(term) ||
          (s.descripcion || '').toLowerCase().includes(term)
        );
      }
    });
  }, [items, anuncioItems, requestType, activeTab, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col h-full relative transition-colors duration-300"
      style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}>



      {/* Contenido Scrollable */}
      <div className="flex-1 p-8 flex flex-col min-h-0">

        {/* Controles Superiores */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Toggle Tipo de Solicitud */}
          <div className="flex p-1 rounded-full border relative transition-colors duration-300"
            style={{ backgroundColor: currentTheme.toggleBg, borderColor: currentTheme.toggleBorder }}>
            <button
              onClick={() => setRequestType('commerce')}
              className={`relative z-10 flex items-center px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${requestType === 'commerce'
                ? 'shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)]'
                : 'hover:opacity-80'
                }`}
              style={{
                backgroundColor: requestType === 'commerce' ? currentTheme.surface : 'transparent',
                color: requestType === 'commerce' ? currentTheme.text : currentTheme.textSecondary
              }}
            >
              <Store size={16} className={`mr-2 transition-transform duration-300 ${requestType === 'commerce' ? 'scale-110' : ''}`} />
              Comercios
            </button>
            <button
              onClick={() => setRequestType('users')}
              className={`relative z-10 flex items-center px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${requestType === 'users'
                ? 'shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)]'
                : 'hover:opacity-80'
                }`}
              style={{
                backgroundColor: requestType === 'users' ? currentTheme.surface : 'transparent',
                color: requestType === 'users' ? currentTheme.text : currentTheme.textSecondary
              }}
            >
              <UserCheck size={16} className={`mr-2 transition-transform duration-300 ${requestType === 'users' ? 'scale-110' : ''}`} />
              Usuarios
            </button>
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} style={{ color: currentTheme.textSecondary }} className="group-focus-within:text-[#DA0037] transition-colors" />
            </div>
            <input
              type="text"
              placeholder={requestType === 'users' ? "Buscar usuario..." : "Buscar comercio..."}
              className="w-full border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#DA0037] focus:ring-1 focus:ring-[#DA0037] transition-all shadow-sm focus:shadow-[#DA0037]/10"
              style={{
                backgroundColor: currentTheme.inputBg,
                borderColor: currentTheme.border,
                color: currentTheme.text,
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Global Error Display */}
        {(error || anuncioError || docError) && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300 animate-in fade-in slide-in-from-top-2">
            {error || anuncioError || docError}
          </div>
        )}

        {/* Tabla Contenedor */}
        <div className="flex-1 rounded-xl border flex flex-col shadow-lg overflow-hidden animate-in fade-in duration-700 transition-colors duration-300"
          style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>

          {/* Tabs de la Tabla */}
          <div className="flex border-b flex-shrink-0 transition-colors duration-300" style={{ borderColor: currentTheme.border }}>
            {['pendiente', 'aprobado', 'rechazado', 'todas'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-medium capitalize transition-all relative hover:bg-opacity-50`}
                style={{
                  color: activeTab === tab ? '#DA0037' : currentTheme.textSecondary,
                  backgroundColor: activeTab === tab ? (resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)') : 'transparent'
                }}
              >
                {tab === 'todas' ? 'Todas' : tab + 's'}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#DA0037] animate-in zoom-in-0 duration-300" />
                )}
              </button>
            ))}
          </div>

          {/* Área de la Tabla */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="uppercase tracking-wider text-xs sticky top-0 z-10 border-b shadow-sm transition-colors duration-300"
                style={{ backgroundColor: currentTheme.surface, color: currentTheme.textSecondary, borderColor: currentTheme.border }}>
                <tr>
                  {requestType === 'users' ? (
                    <>
                      <th className="px-6 py-4 font-semibold">Usuario</th>
                      <th className="px-6 py-4 font-semibold">Contacto</th>
                      <th className="px-6 py-4 font-semibold">Fecha</th>
                      <th className="px-6 py-4 font-semibold">Documento</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-semibold">Comercio</th>
                      <th className="px-6 py-4 font-semibold">Detalles</th>
                      <th className="px-6 py-4 font-semibold">Ubicación</th>
                    </>
                  )}
                  <th className="px-6 py-4 font-semibold text-right">Estado / Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y transition-colors duration-300" key={`${requestType}-${activeTab}-${currentPage}`}
                style={{ borderColor: currentTheme.border }}>
                {loading || anuncioLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center" style={{ color: currentTheme.textSecondary }}>
                      Cargando datos...
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((req: any, index: number) => (
                    <tr
                      key={req.id}
                      className="transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards hover:bg-opacity-50"
                      style={{ animationDelay: `${index * 75}ms` }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = currentTheme.hover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {requestType === 'users' ? (
                        <>
                          <td className="px-6 py-5">
                            <div className="font-medium text-[15px]" style={{ color: currentTheme.text }}>{formatFullName(req.nombres, req.apellidos)}</div>
                            <div className="text-xs text-[#DA0037]/80 font-mono mt-0.5">{fmtRut(req.rut)}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div style={{ color: currentTheme.textSecondary }}>{req.correo}</div>
                            <div className="text-xs mt-0.5 opacity-70" style={{ color: currentTheme.textSecondary }}>{req.telefono || '—'}</div>
                          </td>
                          <td className="px-6 py-5 font-mono text-xs opacity-60" style={{ color: currentTheme.textSecondary }}>
                            {fmtDate(req.fecha_solicitud || req.created_at)}
                          </td>
                          <td className="px-6 py-5">
                            {req.documento_url ? (
                              <button
                                onClick={() => openDocument(req.documento_url, req.id)}
                                disabled={docLoadingId === req.id}
                                className="flex items-center text-xs font-medium px-3 py-1.5 rounded border transition-all disabled:opacity-50"
                                style={{
                                  backgroundColor: resolvedTheme === 'dark' ? 'rgba(68,68,68,0.3)' : 'white',
                                  color: currentTheme.textSecondary,
                                  borderColor: currentTheme.border
                                }}
                              >
                                <Lock size={12} className="mr-2" />
                                {docLoadingId === req.id ? 'Abriendo...' : 'Patente'}
                              </button>
                            ) : (
                              <span className="text-xs opacity-30" style={{ color: currentTheme.textSecondary }}>—</span>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-5">
                            <div className="font-medium text-[15px] mb-1" style={{ color: currentTheme.text }}>{req.titulo}</div>
                            <div className="flex items-center flex-wrap gap-2 text-[11px]">
                              <span className="px-2 py-0.5 rounded flex items-center"
                                style={{ backgroundColor: resolvedTheme === 'dark' ? '#333' : '#E5E7EB', color: currentTheme.textSecondary }}>
                                <Tag size={10} className="mr-1 opacity-60" />
                                {req.categoria_principal || 'Sin categoría'}
                              </span>
                              {req.subcategoria && (
                                <>
                                  <span style={{ color: currentTheme.textSecondary }}>•</span>
                                  <span className="italic" style={{ color: currentTheme.textSecondary }}>{req.subcategoria}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-medium text-sm" style={{ color: currentTheme.text }}>{req.usuario_nombre || 'Usuario desconocido'}</div>
                            <div className="text-xs mt-0.5 line-clamp-1" style={{ color: currentTheme.textSecondary }}>{req.descripcion || 'Sin descripción'}</div>
                            <div className="text-[10px] mt-1 font-mono opacity-80" style={{ color: currentTheme.textSecondary }}>
                              {formatSchedule(req.horario)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-xs" style={{ color: currentTheme.textSecondary }}>
                            {req.direccion || '—'}
                          </td>
                        </>
                      )}

                      <td className="px-6 py-5 text-right">
                        {req.estado === 'pendiente' ? (
                          <div className="flex justify-end gap-3 opacity-90 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={() => requestConfirmation('reject', requestType === 'users' ? 'user' : 'commerce', req)}
                              className="flex items-center px-3 py-1.5 rounded-lg border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all text-xs font-medium"
                              style={{ borderColor: currentTheme.border, color: currentTheme.textSecondary }}
                            >
                              Rechazar
                            </button>
                            <button
                              onClick={() => requestConfirmation('approve', requestType === 'users' ? 'user' : 'commerce', req)}
                              className="flex items-center px-3 py-1.5 rounded-lg bg-[#EDEDED] text-[#171717] hover:bg-[#DA0037] hover:text-white hover:shadow-[0_0_15px_-3px_rgba(218,0,55,0.4)] transition-all text-xs font-bold"
                            >
                              <CheckCircle size={14} className="mr-2" />
                              Aprobar
                            </button>
                          </div>
                        ) : (
                          <StatusBadge status={req.estado} />
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center animate-in fade-in duration-500">
                      <div className="flex flex-col items-center justify-center" style={{ color: currentTheme.textSecondary }}>
                        <Store size={48} strokeWidth={1} className="mb-4 opacity-30" />
                        <p className="text-lg font-medium">No hay solicitudes en esta vista</p>
                        <p className="text-sm opacity-70">Cambia los filtros para ver más resultados</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer de Paginación */}
          <div className="px-6 py-4 border-t flex items-center justify-between flex-shrink-0 transition-colors duration-300"
            style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
            <div className="text-xs" style={{ color: currentTheme.textSecondary }}>
              Mostrando <span className="font-medium" style={{ color: currentTheme.text }}>{filteredList.length > 0 ? indexOfFirstItem + 1 : 0}</span> - <span className="font-medium" style={{ color: currentTheme.text }}>{Math.min(indexOfLastItem, filteredList.length)}</span> de <span className="font-medium" style={{ color: currentTheme.text }}>{filteredList.length}</span> resultados
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all ${currentPage === 1
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-[#DA0037] hover:text-white'
                  }`}
                style={{ color: currentPage === 1 ? currentTheme.textSecondary : currentTheme.text }}
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm font-medium px-2" style={{ color: currentTheme.textSecondary }}>
                Página {currentPage} de {totalPages || 1}
              </span>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 rounded-lg transition-all ${currentPage === totalPages || totalPages === 0
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-[#DA0037] hover:text-white'
                  }`}
                style={{ color: currentPage === totalPages ? currentTheme.textSecondary : currentTheme.text }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <MinimalFooter />

      {/* --- MODAL OVERLAY --- */}
      {modalConfig.isOpen && modalConfig.data && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>

            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center"
              style={{ borderColor: currentTheme.border, backgroundColor: resolvedTheme === 'dark' ? '#333333' : '#F9FAFB' }}>
              <h3 className="text-lg font-bold flex items-center" style={{ color: currentTheme.text }}>
                <AlertTriangle className={`mr-2 ${modalConfig.type === 'approve' ? 'text-emerald-500' : 'text-[#DA0037]'}`} size={20} />
                Confirmar Acción
              </h3>
              <button onClick={closeModal} className="transition-colors hover:opacity-70" style={{ color: currentTheme.textSecondary }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="mb-4" style={{ color: currentTheme.text }}>
                ¿Estás seguro que deseas
                <span className={`font-bold mx-1 ${modalConfig.type === 'approve' ? 'text-emerald-500' : 'text-[#DA0037]'}`}>
                  {modalConfig.type === 'approve' ? 'APROBAR' : 'RECHAZAR'}
                </span>
                la solicitud de:
              </p>

              <div className="p-4 rounded-lg border mb-4"
                style={{ backgroundColor: resolvedTheme === 'dark' ? 'rgba(68,68,68,0.2)' : '#F3F4F6', borderColor: currentTheme.border }}>
                <div className="text-sm uppercase text-xs mb-1" style={{ color: currentTheme.textSecondary }}>
                  {modalConfig.entity === 'user' ? 'Solicitante' : 'Comercio'}
                </div>
                <div className="font-bold text-lg" style={{ color: currentTheme.text }}>
                  {modalConfig.entity === 'user'
                    ? formatFullName((modalConfig.data as Solicitud).nombres, (modalConfig.data as Solicitud).apellidos)
                    : (modalConfig.data as SolicitudAnuncio).titulo
                  }
                </div>
                {modalConfig.entity === 'user' && (
                  <>
                    <div className="text-sm font-mono text-[#DA0037] mt-1">{fmtRut((modalConfig.data as Solicitud).rut)}</div>
                    <div className="text-sm mt-1" style={{ color: currentTheme.textSecondary }}>{(modalConfig.data as Solicitud).correo}</div>
                  </>
                )}
                {modalConfig.entity === 'commerce' && (
                  <div className="text-sm mt-1" style={{ color: currentTheme.textSecondary }}>{(modalConfig.data as SolicitudAnuncio).categoria_principal}</div>
                )}
              </div>

              <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                {modalConfig.type === 'approve'
                  ? 'Esta acción habilitará inmediatamente el acceso o publicación en la plataforma.'
                  : 'La solicitud será marcada como rechazada.'}
              </p>
            </div>

            {/* Modal Footer (Botones) */}
            <div className="px-6 py-4 border-t flex justify-end space-x-3"
              style={{ borderColor: currentTheme.border, backgroundColor: resolvedTheme === 'dark' ? '#333333' : '#F9FAFB' }}>
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: currentTheme.textSecondary }}
              >
                Cancelar
              </button>
              <button
                onClick={executeAction}
                disabled={actionLoadingId === modalConfig.data.id || actionAnuncioLoadingId === modalConfig.data.id}
                className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${modalConfig.type === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
                  : 'bg-[#DA0037] hover:bg-red-600 shadow-red-900/20'
                  }`}
              >
                {actionLoadingId === modalConfig.data.id || actionAnuncioLoadingId === modalConfig.data.id
                  ? 'Procesando...'
                  : (modalConfig.type === 'approve' ? 'Confirmar Aprobación' : 'Confirmar Rechazo')
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
