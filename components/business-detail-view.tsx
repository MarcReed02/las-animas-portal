"use client";

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Globe,
  Share2,
  MessageCircle,
  Menu,
  Instagram,
  Facebook,
  Image as ImageIcon,
  Store,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Plus,
  Sun,
  Moon,
  Bell,
  User as UserIcon,
  Navigation,
  ArrowUpRight,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  MapPinOff,
  LogOut,
  Settings,
  LayoutDashboard,
  LogIn,
  Pencil
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Session } from '@supabase/supabase-js';
import ProfileMenu from './profile-menu';

// Icono TikTok
const TikTokIcon = ({ size = 18, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// Icono X (Twitter)
const XIcon = ({ size = 18, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function BusinessDetailView({ businessData }: { businessData: any }) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme: currentTheme, setTheme, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Estados para la Galería Overlay
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Estados de Sesión y Menú
  const [session, setSession] = useState<Session | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [businessStatus, setBusinessStatus] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifications = () => setIsNotificationsOpen(!isNotificationsOpen);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Fetch Session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user?.id) {
        const { data } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', session.user.id)
          .single();
        if (data) {
          setUserRole(data.rol);
        }

        // Fetch Business Status via API to bypass RLS issues
        try {
          const res = await fetch('/api/user/business-status');

          if (res.status === 401) {
            // Session is invalid/expired on server. Force refresh/logout.
            console.warn("Session expired. Refreshing...");
            await supabase.auth.signOut();
            window.location.reload();
            return;
          }

          if (res.ok) {
            const businessData = await res.json();
            if (businessData && businessData.estado) {
              setBusinessStatus(businessData.estado);
              setBusinessName(businessData.titulo);
            }
          }
        } catch (error) {
          console.error("Error fetching business status:", error);
        }
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        supabase
          .from('usuarios')
          .select('rol')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setUserRole(data.rol);
          });
      } else {
        setUserRole(null);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Controlar scroll del body cuando la galería está abierta
  useEffect(() => {
    if (showGallery) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showGallery]);

  // Reset zoom when image changes
  useEffect(() => {
    setZoom(1);
  }, [currentImageIndex]);

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const getDisplayName = () => {
    if (!session?.user) return "Usuario";
    const metadata = session.user.user_metadata;
    if (metadata?.nombres && metadata?.apellidos) {
      const firstName = metadata.nombres.split(' ')[0];
      const lastName = metadata.apellidos.split(' ')[0];
      return `${firstName} ${lastName}`;
    }
    if (metadata?.full_name) {
      return metadata.full_name;
    }
    return "Usuario";
  };

  const userData = {
    name: getDisplayName(),
    email: session?.user?.email,
    role: userRole || "neighbor",
    notifications: (businessStatus === 'pending' || businessStatus === 'approved') ? 1 : 0
  };

  // Transformar datos de la DB al formato de la vista
  const photos = businessData.anuncio_solicitud_imagenes?.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0)).map((img: any) => img.url) || [];

  // Parsear horario
  let scheduleData: { days: number[]; time: { start: string; end: string } } = { days: [], time: { start: '', end: '' } };
  try {
    if (businessData.horario) {
      scheduleData = JSON.parse(businessData.horario);
    }
  } catch (e) {
    console.error("Error parsing schedule:", e);
  }
  const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const schedule = daysMap.map((dayName, index) => {
    const isActive = scheduleData.days.includes(index);
    return {
      day: dayName,
      hours: isActive ? `${scheduleData.time.start} - ${scheduleData.time.end}` : 'Cerrado',
      active: isActive
    };
  });

  // Calcular si está abierto ahora
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  let isOpen = false;
  if (scheduleData.days.includes(currentDay)) {
    const [startHour, startMin] = scheduleData.time.start.split(':').map(Number);
    const [endHour, endMin] = scheduleData.time.end.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (currentTime >= startTime && currentTime <= endTime) {
      isOpen = true;
    }
  }

  const business = {
    name: businessData.titulo,
    category: businessData.categoria_principal,
    subcategory: businessData.subcategoria,
    isOpen: isOpen,
    fullDescription: businessData.descripcion,
    address: businessData.direccion,
    phone: businessData.telefono_snapshot || businessData.contacto_telefono || businessData.telefono || "",
    whatsapp: businessData.whatsapp || businessData.contacto_whatsapp,
    website: businessData.contacto_web,
    instagram: businessData.instagram || businessData.contacto_instagram,
    facebook: businessData.facebook || businessData.contacto_facebook,
    tiktok: businessData.tiktok || businessData.contacto_tiktok,
    twitter: businessData.contacto_twitter,
    photos: photos.length > 0 ? photos : ["https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1600"], // Fallback image
    schedule: schedule
  };

  const openGallery = (index: number) => {
    if (business.photos.length === 0) return;
    setCurrentImageIndex(index);
    setShowGallery(true);
  };

  const nextImage = (e: any) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % business.photos.length);
  };

  const prevImage = (e: any) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + business.photos.length) % business.photos.length);
  };

  const handleZoomIn = (e: any) => {
    e.stopPropagation();
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e: any) => {
    e.stopPropagation();
    setZoom(prev => Math.max(prev - 0.5, 1));
  };

  // --- COLORES DINÁMICOS ---
  const theme = {
    bg: isDarkMode ? 'bg-[#171717]' : 'bg-[#EDEDED]',
    text: isDarkMode ? 'text-[#e4e4e7]' : 'text-[#171717]',
    textMuted: isDarkMode ? 'text-[#a1a1aa]' : 'text-[#666666]',
    navBgScrolled: isDarkMode ? 'bg-[#171717]/90' : 'bg-[#EDEDED]/90',
    navBorder: isDarkMode ? 'border-[#27272a]' : 'border-[#d4d4d4]',
    navText: isDarkMode ? 'text-[#ccc]' : 'text-[#333]',
    cardBg: isDarkMode ? 'bg-[#444444]' : 'bg-white', // Tarjetas: #444 en dark, Blanco en light
    cardBorder: isDarkMode ? 'border-[#555]' : 'border-[#e5e5e5]',
    cardHoverBorder: isDarkMode ? 'hover:border-[#777]' : 'hover:border-[#ccc]',
    iconBg: isDarkMode ? 'bg-[#333]' : 'bg-[#f4f4f5]', // Fondo de iconos circulares
    gradientBottom: isDarkMode ? 'from-[#171717]' : 'from-[#EDEDED]', // Para el fade del hero
    heroOverlay: isDarkMode ? 'via-[#171717]/20' : 'via-[#EDEDED]/20',
    inputBg: isDarkMode ? 'bg-[#262626]' : 'bg-[#f4f4f5]',
    divider: isDarkMode ? 'border-[#333]' : 'border-[#e5e5e5]',
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${theme.bg} ${theme.text} selection:bg-[#DA0037] selection:text-white overflow-x-hidden`}>

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-500 ${scrolled ? `${theme.navBgScrolled} backdrop-blur-xl border-b ${theme.navBorder} h-16 shadow-sm` : 'bg-black/20 h-20'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex flex-col leading-none select-none cursor-pointer group">
            <span className={`font-black text-xl tracking-tighter group-hover:text-[#DA0037] transition-colors ${scrolled ? (isDarkMode ? 'text-white' : 'text-[#171717]') : 'text-white'}`}>PORTAL</span>
            <span className={`font-bold text-[10px] tracking-[0.2em] uppercase transition-colors ${scrolled ? (isDarkMode ? 'text-[#DA0037]' : 'text-[#DA0037]') : 'text-[#DA0037] group-hover:text-white'}`}>ANIMAS</span>
          </Link>

          <div className={`hidden md:flex items-center gap-8 text-sm font-medium transition-colors ${scrolled ? theme.navText : 'text-white/90'}`}>
            <Link href="/" className={`hover:${isDarkMode ? 'text-white' : 'text-black'} transition-colors`}>Inicio</Link>
            <Link href="/comercios" className={`hover:${isDarkMode ? 'text-white' : 'text-black'} transition-colors`}>Directorio</Link>
            <Link href="#" className={`hover:${isDarkMode ? 'text-white' : 'text-black'} transition-colors`}>Agenda</Link>
          </div>

          <div className="flex items-center gap-4">
            {/* BOTÓN DE TEMA */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all ${scrolled ? (isDarkMode ? 'hover:bg-[#333] text-[#ccc]' : 'hover:bg-[#e5e5e5] text-[#333]') : 'hover:bg-black/20 text-white'}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {session ? (
              <>
                {/* User Logged In Options */}
                {userData.role !== 'admin' && businessStatus !== 'pending' && (
                  <Link href="/protected" className="group bg-[#DA0037] hover:bg-[#b0002d] text-white pl-2 pr-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#DA0037]/20 hover:scale-105 mr-2">
                    <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors">
                      {businessStatus === 'approved' ? <Pencil size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                    </div>
                    <span>{businessStatus === 'approved' ? 'Editar Anuncio' : 'Publicar'}</span>
                  </Link>
                )}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={toggleNotifications}
                    className={`p-2 rounded-full transition-all relative ${scrolled ? (isDarkMode ? 'hover:bg-[#333] text-[#ccc]' : 'hover:bg-[#e5e5e5] text-[#333]') : 'hover:bg-black/20 text-white'}`}
                  >
                    <Bell size={20} />
                    {userData.notifications > 0 && (
                      <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#DA0037] rounded-full border border-transparent animate-pulse"></span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 transform origin-top-right z-50 p-4">
                      {businessStatus === 'pending' && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                            <Bell size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white mb-1">Solicitud Pendiente</h4>
                            <p className="text-xs text-[#a1a1aa] leading-relaxed">
                              Tu comercio <span className="text-white font-medium">{businessName}</span> fue registrado exitosamente. Un administrador debe aceptar la solicitud para que puedas editarlo.
                            </p>
                          </div>
                        </div>
                      )}
                      {businessStatus === 'approved' && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                            <Bell size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white mb-1">Solicitud Aceptada</h4>
                            <p className="text-xs text-[#a1a1aa] leading-relaxed">
                              ¡Felicidades! Tu comercio <span className="text-white font-medium">{businessName}</span> ha sido aceptado. Ya puedes administrarlo y el botón de publicar está disponible nuevamente.
                            </p>
                          </div>
                        </div>
                      )}
                      {!businessStatus && (
                        <div className="text-center py-4">
                          <p className="text-xs text-[#a1a1aa]">No tienes notificaciones nuevas.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Avatar Trigger */}
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="relative pl-1 pr-1 group focus:outline-none flex items-center"
                  >
                    <div className={`relative rounded-full p-1 border-2 ${isProfileOpen ? 'border-[#DA0037]' : 'border-transparent group-hover:border-[#DA0037]/50'} transition-all ${scrolled ? (isDarkMode ? 'bg-[#2A2A2A]' : 'bg-gray-200') : 'bg-white/10 backdrop-blur-md'}`}>
                      <UserIcon className={`w-5 h-5 ${scrolled ? (isDarkMode ? 'text-gray-300' : 'text-gray-600') : 'text-white'}`} />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1E1E1E] rounded-full"></span>
                    </div>
                  </button>

                  {/* --- DROPDOWN MENU (Profile) --- */}
                  {isProfileOpen && (
                    <ProfileMenu
                      user={{ name: userData.name, email: userData.email || undefined }}
                      role={userData.role}
                      onClose={() => setIsProfileOpen(false)}
                      onSignOut={handleSignOut}
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Guest Options */}
                <Link href="/auth/login/ingresar" className={`hidden md:flex items-center gap-2 text-sm font-medium hover:text-[#DA0037] transition-colors ${scrolled ? (isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]') : 'text-white'}`}>
                  <LogIn size={16} />
                  <span className="hidden lg:inline">Ingresar</span>
                </Link>

                <Link href="/auth/login" className={`hidden md:flex items-center gap-2 bg-[#DA0037] hover:bg-[#b0002c] text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#DA0037]/30`}>
                  <Plus size={16} /> Publicar
                </Link>
              </>
            )}

            <button className="md:hidden text-current" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu /></button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className={`md:hidden absolute top-20 left-0 w-full px-4 pt-2 pb-6 border-b shadow-xl ${isDarkMode ? 'bg-[#171717] border-[#444444]' : 'bg-white border-[#EDEDED]'}`}>
            <div className="space-y-3">
              {['Inicio', 'Directorio', 'Agenda'].map((item) => (
                <Link
                  key={item}
                  href={item === 'Directorio' ? '/comercios' : item === 'Inicio' ? '/' : '#'}
                  className={`block px-3 py-3 rounded-lg text-base font-medium ${isDarkMode ? 'text-[#EDEDED]/80 hover:bg-[#444444]/30' : 'text-[#444444] hover:bg-[#EDEDED]'}`}
                >
                  {item}
                </Link>
              ))}
              <div className={`h-px w-full my-2 ${isDarkMode ? 'bg-[#444444]' : 'bg-[#EDEDED]'}`}></div>

              {session ? (
                <>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#2A2A2A]' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-full ${isDarkMode ? 'bg-[#333]' : 'bg-white'}`}>
                        <UserIcon size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.name}</p>
                        <p className="text-xs text-gray-500">{userData.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${isDarkMode ? 'bg-[#333] text-red-400' : 'bg-white text-red-600'}`}
                    >
                      <LogOut size={14} />
                      Cerrar sesión
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login/ingresar" className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-medium border ${isDarkMode ? 'border-[#444444] text-[#EDEDED]' : 'border-[#EDEDED] text-[#171717]'}`}>
                    <LogIn size={18} /> Iniciar sesión
                  </Link>
                  <Link href="/auth/login" className={`block w-full text-center px-3 py-3 rounded-lg font-bold bg-[#DA0037] text-white`}>
                    Registro de Comercio
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO --- */}
      <header className="relative h-[60vh] w-full overflow-hidden group cursor-pointer" onClick={() => openGallery(0)}>
        <div className="absolute inset-0 bg-black">
          <img
            src={business.photos[0]}
            alt="Hero"
            className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
          />
          {/* Degradado Adaptativo */}
          <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradientBottom} ${theme.heroOverlay} to-transparent`}></div>
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full pb-16 md:pb-20">
            <div className={`max-w-4xl space-y-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded bg-[#DA0037] text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                  {business.subcategory}
                </span>
                {business.isOpen ? (
                  <span className="flex items-center gap-2 px-3 py-1 rounded bg-[#1E1E1E] border border-white/10 text-green-400 text-xs font-bold uppercase tracking-wider shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                    Abierto
                  </span>
                ) : (
                  <span className="flex items-center gap-2 px-3 py-1 rounded bg-[#1E1E1E] border border-white/10 text-red-500 text-xs font-bold uppercase tracking-wider shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                    Cerrado
                  </span>
                )}
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight drop-shadow-lg">
                {business.name}
              </h1>

              <div className="flex items-center gap-2 text-sm text-gray-200 font-medium pt-2 opacity-90">
                <MapPin size={18} className="text-[#DA0037]" />
                <span className="hover:text-white transition-colors cursor-pointer">{business.address || "Ubicación no disponible"}</span>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 -mt-8 max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* LEFT: Content (8/12) */}
          <div className="lg:col-span-8 space-y-16 pt-8">

            {/* Gallery Grid */}
            {business.photos.length > 1 && (
              <div className={`space-y-4 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ImageIcon size={20} className="text-[#DA0037]" /> Galería Visual
                  </h2>
                  <button onClick={() => openGallery(0)} className={`text-xs font-bold ${theme.textMuted} hover:text-[#DA0037] transition-colors flex items-center gap-1 group`}>
                    Ver todas las fotos <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[450px]">
                  <div onClick={() => openGallery(1)} className={`col-span-2 row-span-2 relative rounded-2xl overflow-hidden group cursor-zoom-in border ${isDarkMode ? 'border-white/5 hover:border-white/20' : 'border-black/5 hover:border-black/20'} transition-all`}>
                    <img src={business.photos[1]} alt="Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                      <Maximize2 size={16} className="text-white" />
                    </div>
                  </div>
                  {/* Secondary Images Loop */}
                  {[2, 3].map(idx => (
                    business.photos[idx] && (
                      <div key={idx} onClick={() => openGallery(idx)} className={`col-span-1 row-span-1 relative rounded-2xl overflow-hidden group cursor-zoom-in border ${isDarkMode ? 'border-white/5 hover:border-white/20' : 'border-black/5 hover:border-black/20'} transition-all`}>
                        <img src={business.photos[idx]} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                    )
                  ))}
                  {business.photos[4] && (
                    <div onClick={() => openGallery(4)} className={`col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer border ${isDarkMode ? 'border-white/5 hover:border-white/20' : 'border-black/5 hover:border-black/20'} transition-all`}>
                      <img src={business.photos[4]} alt="4" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                        <span className="text-white font-bold text-sm flex items-center gap-2 border border-white/30 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20 transition-all">
                          <ImageIcon size={16} /> Ver más
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* About */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Store className="text-[#DA0037]" /> Nuestra Historia
              </h2>
              <div className={`prose prose-invert max-w-none ${theme.textMuted} leading-relaxed text-lg whitespace-pre-wrap break-words`}>
                <p>{business.fullDescription}</p>
              </div>
            </section>

            {/* Location */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <MapPin className="text-[#DA0037]" /> Ubicación
              </h2>
              {business.address ? (
                <div className={`text-lg font-medium ${theme.text}`}>
                  {business.address}
                </div>
              ) : (
                <p className={`${theme.textMuted} italic`}>Ubicación no disponible</p>
              )}
            </section>

          </div>

          {/* RIGHT: Floating Sidebar (4/12) */}
          <div className="lg:col-span-4 relative">
            <div className={`sticky top-24 space-y-12 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>

              {/* CONTACT SECTION */}
              <div>
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2 pl-2 border-l-4 border-[#DA0037]">
                  Contacto Directo
                </h3>

                <div className="space-y-4">
                  {/* Phone Item */}
                  {business.phone && (
                    <div className={`flex items-center gap-4 group cursor-pointer hover:translate-x-2 transition-transform duration-300 ${theme.cardBg} p-4 rounded-xl border ${isDarkMode ? 'border-transparent' : 'border-[#e5e5e5]'} shadow-sm hover:shadow-md`}>
                      <div className={`w-12 h-12 rounded-full ${theme.iconBg} flex items-center justify-center text-[#DA0037] shadow-sm group-hover:bg-[#DA0037] group-hover:text-white transition-colors`}>
                        <Phone size={20} />
                      </div>
                      <div>
                        <span className={`block text-[10px] ${theme.textMuted} font-bold uppercase tracking-wider mb-0.5`}>Teléfono</span>
                        <span className="block text-base font-bold font-mono tracking-tight">{business.phone}</span>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Item */}
                  {business.whatsapp && (
                    <div className={`flex items-center gap-4 group cursor-pointer hover:translate-x-2 transition-transform duration-300 ${theme.cardBg} p-4 rounded-xl border ${isDarkMode ? 'border-transparent' : 'border-[#e5e5e5]'} shadow-sm hover:shadow-md`}>
                      <div className={`w-12 h-12 rounded-full ${theme.iconBg} flex items-center justify-center text-green-500 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-colors`}>
                        <MessageCircle size={20} />
                      </div>
                      <div>
                        <span className={`block text-[10px] ${theme.textMuted} font-bold uppercase tracking-wider mb-0.5`}>WhatsApp</span>
                        <span className="block text-base font-bold font-mono tracking-tight">{business.whatsapp}</span>
                      </div>
                    </div>
                  )}

                  {/* Website Item */}
                  {business.website && (
                    <div className={`flex items-center gap-4 group cursor-pointer hover:translate-x-2 transition-transform duration-300 ${theme.cardBg} p-4 rounded-xl border ${isDarkMode ? 'border-transparent' : 'border-[#e5e5e5]'} shadow-sm hover:shadow-md`}>
                      <div className={`w-12 h-12 rounded-full ${theme.iconBg} flex items-center justify-center text-blue-400 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors`}>
                        <Globe size={20} />
                      </div>
                      <div className="flex-1">
                        <span className={`block text-[10px] ${theme.textMuted} font-bold uppercase tracking-wider mb-0.5`}>Sitio Web</span>
                        <span className="block text-sm font-medium">Visitar página</span>
                      </div>
                      <ExternalLink size={16} className={`${theme.textMuted} group-hover:text-current transition-colors mr-2`} />
                    </div>
                  )}
                </div>

                {/* Social Icons (Circles) */}
                <div className="flex gap-4 mt-8">
                  {business.instagram && <a href={business.instagram} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 flex items-center justify-center rounded-full ${theme.cardBg} ${theme.textMuted} hover:text-white hover:bg-[#E1306C] hover:-translate-y-1 transition-all shadow-md ${isDarkMode ? 'border-[#333]' : 'border-[#e5e5e5]'} border hover:border-transparent`}><Instagram size={20} /></a>}
                  {business.facebook && <a href={business.facebook} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 flex items-center justify-center rounded-full ${theme.cardBg} ${theme.textMuted} hover:text-white hover:bg-[#1877F2] hover:-translate-y-1 transition-all shadow-md ${isDarkMode ? 'border-[#333]' : 'border-[#e5e5e5]'} border hover:border-transparent`}><Facebook size={20} /></a>}
                  {business.twitter && <a href={business.twitter} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 flex items-center justify-center rounded-full ${theme.cardBg} ${theme.textMuted} hover:text-white hover:bg-black hover:-translate-y-1 transition-all shadow-md ${isDarkMode ? 'border-[#333]' : 'border-[#e5e5e5]'} border hover:border-transparent`}><XIcon size={20} /></a>}
                  {business.tiktok && <a href={business.tiktok} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 flex items-center justify-center rounded-full ${theme.cardBg} ${theme.textMuted} hover:text-white hover:bg-[#00f2ea] hover:-translate-y-1 transition-all shadow-md ${isDarkMode ? 'border-[#333]' : 'border-[#e5e5e5]'} border hover:border-transparent`}><TikTokIcon size={20} /></a>}
                </div>
              </div>

              {/* HOURS SECTION */}
              <div>
                <div className="flex items-center gap-2 mb-6 font-bold text-xl pl-2 border-l-4 border-[#DA0037]">
                  Horarios de Atención
                </div>

                <div className="space-y-2 pl-2">
                  {business.schedule.map((item, idx) => (
                    <div key={idx} className={`flex justify-between items-center text-sm py-2 border-b ${theme.divider} last:border-0 hover:${isDarkMode ? 'bg-[#262626]/30' : 'bg-black/5'} px-2 rounded transition-colors`}>
                      <span className={`${theme.textMuted} font-medium`}>{item.day}</span>
                      <span className={`font-mono text-xs ${item.active ? theme.text : 'text-[#DA0037] font-bold'}`}>
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>

                {business.isOpen && (
                  <div className="mt-6 text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme.cardBg} border ${theme.divider} text-xs text-green-500 font-bold uppercase tracking-wider shadow-sm`}>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                      Abierto en este momento
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* --- LIGHTBOX --- */}
      {showGallery && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in">
          <button onClick={() => setShowGallery(false)} className="absolute top-6 right-6 p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-all z-50 border border-white/10">
            <X size={24} />
          </button>

          {/* Zoom Controls */}
          <div className="absolute top-6 left-6 flex gap-2 z-50">
            <button onClick={handleZoomIn} className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-all border border-white/10">
              <ZoomIn size={24} />
            </button>
            <button onClick={handleZoomOut} className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-all border border-white/10">
              <ZoomOut size={24} />
            </button>
          </div>

          <button onClick={prevImage} className="absolute left-4 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white z-50 transition-all hover:scale-110 border border-white/5"><ChevronLeft size={32} /></button>
          <button onClick={nextImage} className="absolute right-4 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white z-50 transition-all hover:scale-110 border border-white/5"><ChevronRight size={32} /></button>

          <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden" onClick={() => setShowGallery(false)}>
            <img
              src={business.photos[currentImageIndex]}
              className="max-h-[90vh] max-w-full object-contain rounded shadow-2xl transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoom})`, cursor: zoom > 1 ? 'grab' : 'default' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}
