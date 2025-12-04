"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Search, MapPin, ArrowUpRight, Clock, Phone,
  Instagram, Facebook, Globe, Music, MessageCircle, Twitter,
  ChevronDown, Filter, X, RefreshCcw, Home, Sun, Moon
} from 'lucide-react';
import { slugify } from '@/lib/utils';

// Icono X (Twitter)
const XIcon = ({ size = 18, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

type Listing = {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria_principal: string | null;
  subcategoria: string | null;
  direccion: string | null;
  horario: string | null;
  mostrar_telefono: boolean | null;
  telefono_snapshot: string | null;
  instagram?: string | null;
  facebook?: string | null;
  whatsapp?: string | null;
  tiktok?: string | null;
  contacto_twitter?: string | null;
  contacto_web?: string | null;
  anuncio_solicitud_imagenes?: { url: string; orden: number | null }[];
};

type CategoryGroup = {
  name: string;
  subs: string[];
};

function firstImage(listing: Listing) {
  if (listing.anuncio_solicitud_imagenes?.length) {
    const sorted = [...listing.anuncio_solicitud_imagenes].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    return sorted[0]?.url || null;
  }
  return null;
}

const CommerceViewModern = ({ listings, categoryGroups }: { listings: Listing[], categoryGroups: CategoryGroup[] }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);

  // Efecto para activar animaciones al montar
  useEffect(() => {
    setIsLoaded(true);
    setMounted(true);
  }, []);

  const clearFilters = () => {
    setActiveCategory('Todos');
    setActiveSubCategory(null);
    setSearchTerm('');
    setMobileMenuOpen(false);
  };

  // Helper to format schedule
  const formatSchedule = (scheduleJson: string | null) => {
    if (!scheduleJson) return "Horario no disponible";
    try {
      const schedule = JSON.parse(scheduleJson);
      if (!schedule.days || schedule.days.length === 0) return "Cerrado temporalmente";

      const daysMap: { [key: number]: string } = { 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 0: 'Dom' };
      const sortedDays = schedule.days.sort((a: number, b: number) => {
        // Adjust sort so Monday (1) comes first, Sunday (0) comes last if needed, or just standard sort
        // If 0 is Sunday, usually we want it at the end or beginning. Let's stick to standard 0-6 but display order might matter.
        // Let's treat 0 as 7 for sorting purposes to have Mon-Sun order
        const aVal = a === 0 ? 7 : a;
        const bVal = b === 0 ? 7 : b;
        return aVal - bVal;
      });

      // Check for ranges (e.g. Mon-Fri)
      let dayString = "";
      const isSequential = sortedDays.every((day: number, i: number) => {
        if (i === 0) return true;
        const prev = sortedDays[i - 1] === 0 ? 7 : sortedDays[i - 1];
        const curr = day === 0 ? 7 : day;
        return curr === prev + 1;
      });

      if (isSequential && sortedDays.length > 2) {
        dayString = `${daysMap[sortedDays[0]]} - ${daysMap[sortedDays[sortedDays.length - 1]]}`;
      } else {
        dayString = sortedDays.map((d: number) => daysMap[d]).join(", ");
      }

      return `${dayString} ${schedule.time.start} - ${schedule.time.end}`;
    } catch (e) {
      return "Horario no disponible";
    }
  };

  // Map Supabase data to the structure used in the design (for easier rendering)
  const businesses = useMemo(() => listings.map(l => ({
    id: l.id,
    name: l.titulo,
    category: l.categoria_principal || "Sin categoría",
    subcategory: l.subcategoria || "General",
    description: l.descripcion || "",
    image: firstImage(l) || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    address: l.direccion || "Dirección no disponible",
    phone: l.telefono_snapshot || "",
    hours: formatSchedule(l.horario),
    status: 'open', // Placeholder
    socials: {
      instagram: l.instagram,
      facebook: l.facebook,
      whatsapp: l.whatsapp,
      tiktok: l.tiktok,
      twitter: l.contacto_twitter,
      web: l.contacto_web
    }
  })), [listings]);

  const filteredBusinesses = businesses.filter(biz => {
    const matchCategory = activeCategory === 'Todos' || biz.category === activeCategory;
    const matchSubCategory = !activeSubCategory || biz.subcategory === activeSubCategory;
    const matchSearch = biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSubCategory && matchSearch;
  });

  // Theme Variables (using Tailwind dark mode modifiers)
  const bgPage = 'bg-[#f5f5f5] dark:bg-[#171717]';
  const textPrimary = 'text-[#171717] dark:text-[#EDEDED]';
  const textSecondary = 'text-[#666] dark:text-[#888]';
  const bgCard = 'bg-white dark:bg-[#202020]';
  const borderColor = 'border-[#e5e5e5] dark:border-[#262626]';
  const bgHeader = 'bg-white/95 dark:bg-[#171717]/95';
  const bgInput = 'bg-[#f0f0f0] dark:bg-[#262626]';
  const hoverBg = 'hover:bg-[#e5e5e5] dark:hover:bg-[#262626]';

  return (
    <div className={`min-h-screen ${bgPage} ${textPrimary} font-sans selection:bg-[#DA0037] selection:text-white overflow-x-hidden flex flex-col transition-colors duration-500`}>
      {/* Importación de fuente y estilos auxiliares que Tailwind no cubre por defecto sin plugins */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          body { font-family: 'Inter', sans-serif; }
          /* Firefox */
          .custom-scroll {
            scrollbar-width: thin;
            scrollbar-color: #ccc transparent;
          }
          .dark .custom-scroll {
            scrollbar-color: #404040 transparent;
          }
          /* Webkit */
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
          .dark .custom-scroll::-webkit-scrollbar-thumb { background: #404040; }
          .custom-scroll::-webkit-scrollbar-thumb:hover { background: #bbb; }
          .dark .custom-scroll::-webkit-scrollbar-thumb:hover { background: #555; }
          
          .category-btn {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .category-btn:hover {
            transform: translateX(2px);
          }
          /* Layout Variables */
          :root {
            --navbar-height: 5rem;
            --header-height: 5rem;
            --sidebar-top: calc(var(--navbar-height) + var(--header-height));
          }
          
          /* Native CSS Grid for wider cards */
          .listings-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          @media (min-width: 768px) {
            .listings-grid {
              grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
            }
          }
        `}
      </style>

      {/* --- HEADER --- */}
      <header className={`sticky top-0 z-30 ${bgHeader} backdrop-blur-xl border-b ${borderColor} transition-all duration-300`}>
        <div className="max-w-[1600px] mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            {/* Botón Menú Móvil */}
            <button
              className={`md:hidden ${textPrimary} hover:text-[#DA0037] transition-colors p-1`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Filter size={24} />}
            </button>

            {/* TÍTULO REDISEÑADO (Estilo Arquitectónico/Moderno) */}
            <div className="flex flex-col justify-center group cursor-default select-none">
              <span className="text-[#DA0037] text-[10px] font-bold uppercase tracking-[0.3em] leading-none mb-1.5 transition-all duration-500 group-hover:tracking-[0.5em] group-hover:text-white">
                Directorio
              </span>
              <h1 className={`text-2xl md:text-3xl font-black ${textPrimary} tracking-widest uppercase leading-none group-hover:text-[#DA0037] transition-colors duration-300`}>
                Comercios
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Barra de Búsqueda Desktop */}
            <div className="relative group w-full max-w-sm hidden md:block">
              <input
                type="text"
                placeholder="Buscar comercio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${bgInput} border border-transparent focus:border-[#DA0037] ${textPrimary} py-2.5 pl-5 pr-10 text-sm rounded-full focus:outline-none transition-all duration-300 placeholder-[#999] group-hover:brightness-95 shadow-inner`}
              />
              <Search className="absolute right-4 top-3 text-[#999] group-focus-within:text-[#DA0037] transition-colors" size={18} />
            </div>

            {/* Botón Home */}
            <Link
              href="/"
              className={`p-2 rounded-full ${bgInput} ${textSecondary} hover:text-[#DA0037] hover:brightness-95 transition-all`}
              title="Volver al inicio"
            >
              <Home size={18} />
            </Link>

            {/* Botón Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-full ${bgInput} ${textSecondary} hover:text-[#DA0037] hover:brightness-95 transition-all`}
                title="Cambiar tema"
              >
                {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto w-full flex flex-1 items-start">

        {/* --- SIDEBAR FILTROS --- */}
        <aside className={`
          fixed inset-y-0 left-0 z-20 w-72 ${bgPage} border-r ${borderColor} transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-[calc(100vh-85px)] md:sticky md:top-[85px] overflow-y-auto custom-scroll
          ${mobileMenuOpen ? 'translate-x-0 pt-24 shadow-2xl' : '-translate-x-full pt-0 md:pt-8'}
        `}>
          <div className="px-6 pb-8 md:pt-0">
            {/* Buscador Móvil */}
            <div className="mb-8 block md:hidden">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${bgInput} ${textPrimary} py-3 px-4 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#DA0037]`}
              />
            </div>

            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className={`text-xs font-bold ${textSecondary} uppercase tracking-widest`}>Categorías</h3>

              {(activeCategory !== 'Todos' || activeSubCategory || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] text-[#DA0037] hover:text-[#b3002d] flex items-center gap-1 transition-colors font-bold uppercase tracking-wider"
                >
                  <RefreshCcw size={10} /> Limpiar
                </button>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => { setActiveCategory('Todos'); setActiveSubCategory(null); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 border border-transparent ${activeCategory === 'Todos'
                  ? 'bg-[#DA0037] text-white shadow-lg shadow-red-900/20 translate-x-1'
                  : `${textSecondary} ${hoverBg} hover:translate-x-1`
                  }`}
              >
                Todos los comercios
              </button>

              {categoryGroups.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <button
                    onClick={() => setActiveCategory(activeCategory === cat.name ? 'Todos' : cat.name)}
                    className={`category-btn w-full flex justify-between items-center px-4 py-3 rounded-lg text-sm font-medium border border-transparent ${activeCategory === cat.name
                      ? `text-white bg-[#e5e5e5] border-[#d4d4d4] dark:bg-[#262626] dark:border-[#333]`
                      : `${textSecondary} ${hoverBg}`
                      }`}
                  >
                    {cat.name === 'Restaurantes y Gastronomía' ? 'Restaurantes' : cat.name}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${activeCategory === cat.name ? 'rotate-180 text-[#DA0037]' : ''}`} />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeCategory === cat.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className={`pl-4 pr-2 py-1 space-y-1 border-l border-[#ddd] dark:border-[#333] ml-4`}>
                      {cat.subs.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => { setActiveSubCategory(sub); setMobileMenuOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2 ${activeSubCategory === sub
                            ? 'text-[#DA0037] bg-[#DA0037]/10 font-medium translate-x-1'
                            : `${textSecondary} hover:${textPrimary} hover:translate-x-1`
                            }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeSubCategory === sub ? 'bg-[#DA0037]' : 'bg-[#ccc] dark:bg-[#444]'}`}></div>
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 px-4 md:px-8 py-8 md:py-12 w-full">

          <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className={`text-3xl font-bold ${textPrimary} tracking-tight animate-in slide-in-from-left-4 duration-500`}>
                  {activeSubCategory || activeCategory}
                </h2>
                {(activeSubCategory || activeCategory !== 'Todos') && (
                  <span className="bg-[#DA0037] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide animate-in zoom-in duration-300">
                    Filtrado
                  </span>
                )}
              </div>
              <p className={`${textSecondary} text-sm`}>Explora las mejores opciones del barrio</p>
            </div>
          </div>

          <div className="listings-grid">

            {filteredBusinesses.map((biz, index) => (
              <div
                key={biz.id}
                className={`
                  ${bgCard} rounded-xl overflow-hidden 
                  hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] 
                  transition-all duration-500 group border ${borderColor} hover:border-[#DA0037]/30
                  flex flex-col hover:-translate-y-2
                  ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                `}
                style={{ transitionDelay: `${index * 100}ms` }}
              >

                {/* Imagen Cover */}
                <Link href={`/comercios/${slugify(biz.name)}`} className={`relative h-72 overflow-hidden bg-[#eee] dark:bg-[#111] block`}>
                  {biz.image ? (
                    <img
                      src={biz.image}
                      alt={biz.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${textSecondary} opacity-30`}>Sin imagen</div>
                  )}
                </Link>

                {/* Contenido Principal */}
                <div className="p-7 flex-1 flex flex-col relative z-10">
                  <div className="mb-5">
                    <span className="text-[#DA0037] text-[10px] font-bold uppercase tracking-wider mb-2 block transition-all duration-300">
                      {biz.category} • {biz.subcategory}
                    </span>
                    <Link href={`/comercios/${slugify(biz.name)}`} className="block">
                      <h3 className={`text-2xl font-bold ${textPrimary} group-hover:text-[#DA0037] transition-colors mb-3 leading-tight break-words`}>
                        {biz.name}
                      </h3>
                    </Link>
                    <p className={`${textSecondary} text-sm font-light leading-relaxed line-clamp-3 group-hover:text-[#171717] dark:group-hover:text-[#EDEDED] transition-colors break-words`}>
                      {biz.description}
                    </p>
                  </div>

                  {/* Bloque de Información */}
                  <div className={`space-y-3 mt-auto pt-5 border-t border-[#eee] dark:border-[#333]/50`}>
                    <div className={`flex items-start gap-3 text-sm ${textSecondary} group/item`}>
                      <MapPin size={16} className={`text-[#999] dark:text-[#555] group-hover/item:text-[#DA0037] transition-colors mt-0.5 flex-shrink-0`} />
                      <span className="font-light break-words">{biz.address}</span>
                    </div>
                    {biz.phone && (
                      <div className={`flex items-center gap-3 text-sm ${textSecondary} group/item`}>
                        <Phone size={16} className={`text-[#999] dark:text-[#555] group-hover/item:text-[#DA0037] transition-colors flex-shrink-0`} />
                        <span className={`font-light hover:text-[#171717] dark:hover:text-[#EDEDED] cursor-pointer transition-colors break-words`}>{biz.phone}</span>
                      </div>
                    )}
                    <div className={`flex items-center gap-3 text-sm ${textSecondary} group/item`}>
                      <Clock size={16} className={`text-[#999] dark:text-[#555] group-hover/item:text-[#DA0037] transition-colors flex-shrink-0`} />
                      <span className="font-light break-words">{biz.hours}</span>
                    </div>
                  </div>

                  {/* Redes Sociales (Barra Inferior) */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex gap-2">
                      {biz.socials.instagram && (
                        <a href={biz.socials.instagram} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full bg-[#f0f0f0] text-[#666] dark:bg-[#2a2a2a] dark:text-[#888] hover:text-white hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-500 transition-all duration-300 hover:scale-125 hover:-translate-y-1 shadow-sm hover:shadow-md`} title="Instagram">
                          <Instagram size={18} />
                        </a>
                      )}
                      {biz.socials.facebook && (
                        <a href={biz.socials.facebook} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full bg-[#f0f0f0] text-[#666] dark:bg-[#2a2a2a] dark:text-[#888] hover:text-white hover:bg-[#1877F2] transition-all duration-300 hover:scale-125 hover:-translate-y-1 shadow-sm hover:shadow-md`} title="Facebook">
                          <Facebook size={18} />
                        </a>
                      )}
                      {biz.socials.whatsapp && (
                        <a href={biz.socials.whatsapp} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full bg-[#f0f0f0] text-[#666] dark:bg-[#2a2a2a] dark:text-[#888] hover:text-white hover:bg-[#25D366] transition-all duration-300 hover:scale-125 hover:-translate-y-1 shadow-sm hover:shadow-md`} title="WhatsApp">
                          <MessageCircle size={18} />
                        </a>
                      )}
                      {biz.socials.tiktok && (
                        <a href={biz.socials.tiktok} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full bg-[#f0f0f0] text-[#666] dark:bg-[#2a2a2a] dark:text-[#888] hover:text-white hover:bg-black hover:shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-125 hover:-translate-y-1 shadow-sm hover:shadow-md`} title="TikTok">
                          <Music size={18} />
                        </a>
                      )}
                      {biz.socials.twitter && (
                        <a href={biz.socials.twitter} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full bg-[#f0f0f0] text-[#666] dark:bg-[#2a2a2a] dark:text-[#888] hover:text-white hover:bg-black transition-all duration-300 hover:scale-125 hover:-translate-y-1 shadow-sm hover:shadow-md`} title="X (Twitter)">
                          <XIcon size={16} />
                        </a>
                      )}
                      {biz.socials.web && (
                        <a href={biz.socials.web} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full bg-[#f0f0f0] text-[#666] dark:bg-[#2a2a2a] dark:text-[#888] hover:text-white hover:bg-[#333] border border-transparent hover:border-[#555] transition-all duration-300 hover:scale-125 hover:-translate-y-1 shadow-sm hover:shadow-md`} title="Sitio Web">
                          <Globe size={18} />
                        </a>
                      )}
                    </div>


                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* --- FOOTER --- */}
      <footer className={`border-t bg-[#EDEDED] border-[#EDEDED] dark:bg-[#171717] dark:border-[#444444] mt-auto relative z-20`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="mb-6 opacity-80">
                {/* LOGO FOOTER: TEXTO */}
                <div className="flex flex-col justify-start cursor-pointer">
                  <span className={`text-xl font-black tracking-tighter leading-none text-[#171717] dark:text-[#EDEDED]`}>
                    PORTAL
                  </span>
                  <span className={`text-xs font-bold tracking-[0.2em] uppercase leading-none text-[#DA0037]`}>
                    ANIMAS
                  </span>
                </div>
              </div>
              <p className={`text-sm mb-6 ${textSecondary}`}>
                Plataforma oficial para el fortalecimiento del comercio y turismo.
                Apoyado por INACAP y la Cámara de Comercio.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, MessageCircle].map((Icon, i) => (
                  <a key={i} href="#" className={`transition-colors hover:text-[#DA0037] text-[#9ca3af] dark:text-[#444]`}>
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h5 className={`font-bold mb-4 text-[#171717] dark:text-[#EDEDED]`}>Portal</h5>
              <ul className="space-y-2 text-sm">
                {['Directorio Comercial', 'Agenda Cultural', 'Proyectos Urbanos', 'Mapa del Barrio'].map(link => (
                  <li key={link}>
                    <a href="#" className={`hover:text-[#DA0037] transition-colors ${textSecondary}`}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className={`font-bold mb-4 text-[#171717] dark:text-[#EDEDED]`}>Institucional</h5>
              <ul className="space-y-2 text-sm">
                {['Cámara de Comercio', 'Transparencia', 'Contacto', 'Acceso Editores'].map(link => (
                  <li key={link}>
                    <a href="#" className={`hover:text-[#DA0037] transition-colors ${textSecondary}`}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className={`font-bold mb-4 text-[#171717] dark:text-[#EDEDED]`}>Comunidad</h5>
              <p className={`text-xs mb-4 ${textSecondary}`}>Recibe actualizaciones sobre eventos y nuevos comercios.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Tu correo"
                  className={`w-full px-4 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#DA0037] bg-white text-[#171717] border border-[#444444] dark:bg-[#171717] dark:text-[#EDEDED] dark:border-[#444444]`}
                />
                <button className="bg-[#DA0037] hover:bg-[#b3002d] text-white p-2 rounded transition-colors">
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className={`pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs border-[#d4d4d4] text-[#444444] dark:border-[#444444] dark:text-[#EDEDED]/40`}>
            <p>&copy; 2025 Portal Las Ánimas. Proyecto de Título INACAP.</p>
            <p>Desarrollado con Next.js + Tailwind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CommerceViewModern;
