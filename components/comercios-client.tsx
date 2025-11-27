"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Search, MapPin, ArrowUpRight, Clock, Phone,
  Instagram, Facebook, Globe, Music, MessageCircle, Twitter,
  ChevronDown, Filter, X, RefreshCcw, Home, Sun, Moon
} from 'lucide-react';

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

  // Map Supabase data to the structure used in the design (for easier rendering)
  const businesses = useMemo(() => listings.map(l => ({
    id: l.id,
    name: l.titulo,
    category: l.categoria_principal || "Sin categoría",
    subcategory: l.subcategoria || "General",
    description: l.descripcion || "",
    image: firstImage(l) || "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80",
    address: l.direccion || "Dirección no disponible",
    phone: l.telefono_snapshot || "",
    hours: l.horario || "Horario no disponible",
    status: 'open', // Placeholder
    socials: {
      instagram: l.instagram,
      facebook: l.facebook,
      whatsapp: l.whatsapp,
      tiktok: l.tiktok,
      web: null
    }
  })), [listings]);

  const filteredBusinesses = businesses.filter(biz => {
    const matchCategory = activeCategory === 'Todos' || biz.category === activeCategory;
    const matchSubCategory = !activeSubCategory || biz.subcategory === activeSubCategory;
    const matchSearch = biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSubCategory && matchSearch;
  });

  const isDarkMode = resolvedTheme === 'dark';

  // Theme Variables
  const bgPage = isDarkMode ? 'bg-[#171717]' : 'bg-[#f5f5f5]';
  const textPrimary = isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]';
  const textSecondary = isDarkMode ? 'text-[#888]' : 'text-[#666]';
  const bgCard = isDarkMode ? 'bg-[#202020]' : 'bg-white';
  const borderColor = isDarkMode ? 'border-[#262626]' : 'border-[#e5e5e5]';
  const bgHeader = isDarkMode ? 'bg-[#171717]/95' : 'bg-white/95';
  const bgInput = isDarkMode ? 'bg-[#262626]' : 'bg-[#f0f0f0]';
  const hoverBg = isDarkMode ? 'hover:bg-[#262626]' : 'hover:bg-[#e5e5e5]';

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
            scrollbar-color: ${isDarkMode ? '#404040 transparent' : '#ccc transparent'};
          }
          /* Webkit */
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#404040' : '#ccc'}; border-radius: 4px; }
          .custom-scroll::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? '#555' : '#bbb'}; }
          
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
        `}
      </style>

      {/* --- HEADER --- */}
      <header className={`sticky top-0 z-30 ${bgHeader} backdrop-blur-xl border-b ${borderColor} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
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

      <div className="max-w-7xl mx-auto w-full flex flex-1 items-start">

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
                      ? `text-white ${isDarkMode ? 'bg-[#262626] border-[#333]' : 'bg-[#e5e5e5] border-[#d4d4d4]'}`
                      : `${textSecondary} ${hoverBg}`
                      }`}
                  >
                    {cat.name === 'Restaurantes y Gastronomía' ? 'Restaurantes' : cat.name}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${activeCategory === cat.name ? 'rotate-180 text-[#DA0037]' : ''}`} />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeCategory === cat.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className={`pl-4 pr-2 py-1 space-y-1 border-l ${isDarkMode ? 'border-[#333]' : 'border-[#ddd]'} ml-4`}>
                      {cat.subs.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => { setActiveSubCategory(sub); setMobileMenuOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2 ${activeSubCategory === sub
                            ? 'text-[#DA0037] bg-[#DA0037]/10 font-medium translate-x-1'
                            : `${textSecondary} hover:${textPrimary} hover:translate-x-1`
                            }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeSubCategory === sub ? 'bg-[#DA0037]' : (isDarkMode ? 'bg-[#444]' : 'bg-[#ccc]')}`}></div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

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
                <div className={`relative h-52 overflow-hidden ${isDarkMode ? 'bg-[#111]' : 'bg-[#eee]'}`}>
                  {biz.image ? (
                    <img
                      src={biz.image}
                      alt={biz.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${textSecondary} opacity-30`}>Sin imagen</div>
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-[#202020] via-[#202020]/20' : 'from-white via-white/20'} to-transparent opacity-90`}></div>
                </div>

                {/* Contenido Principal */}
                <div className="p-7 flex-1 flex flex-col -mt-12 relative z-10">
                  <div className="mb-5">
                    <span className="text-[#DA0037] text-[10px] font-bold uppercase tracking-wider mb-2 block opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">
                      {biz.category} • {biz.subcategory}
                    </span>
                    <h3 className={`text-2xl font-bold ${textPrimary} group-hover:text-[#DA0037] transition-colors mb-3 leading-tight break-words`}>
                      {biz.name}
                    </h3>
                    <p className={`${textSecondary} text-sm font-light leading-relaxed line-clamp-3 group-hover:${textPrimary} transition-colors break-words`}>
                      {biz.description}
                    </p>
                  </div>

                  {/* Bloque de Información */}
                  <div className={`space-y-3 mt-auto pt-5 border-t ${isDarkMode ? 'border-[#333]/50' : 'border-[#eee]'}`}>
                    <div className={`flex items-start gap-3 text-sm ${textSecondary} group/item`}>
                      <MapPin size={16} className={`${isDarkMode ? 'text-[#555]' : 'text-[#999]'} group-hover/item:text-[#DA0037] transition-colors mt-0.5 flex-shrink-0`} />
                      <span className="font-light break-words">{biz.address}</span>
                    </div>
                    {biz.phone && (
                      <div className={`flex items-center gap-3 text-sm ${textSecondary} group/item`}>
                        <Phone size={16} className={`${isDarkMode ? 'text-[#555]' : 'text-[#999]'} group-hover/item:text-[#DA0037] transition-colors flex-shrink-0`} />
                        <span className={`font-light hover:${textPrimary} cursor-pointer transition-colors break-words`}>{biz.phone}</span>
                      </div>
                    )}
                    <div className={`flex items-center gap-3 text-sm ${textSecondary} group/item`}>
                      <Clock size={16} className={`${isDarkMode ? 'text-[#555]' : 'text-[#999]'} group-hover/item:text-[#DA0037] transition-colors flex-shrink-0`} />
                      <span className="font-light break-words">{biz.hours}</span>
                    </div>
                  </div>

                  {/* Redes Sociales (Barra Inferior) */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex gap-2">
                      {biz.socials.instagram && (
                        <a href={biz.socials.instagram} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full ${isDarkMode ? 'bg-[#2a2a2a] text-[#888]' : 'bg-[#f0f0f0] text-[#666]'} hover:text-white hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-pink-500 hover:to-purple-500 transition-all duration-300 hover:scale-110`} title="Instagram">
                          <Instagram size={16} />
                        </a>
                      )}
                      {biz.socials.facebook && (
                        <a href={biz.socials.facebook} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full ${isDarkMode ? 'bg-[#2a2a2a] text-[#888]' : 'bg-[#f0f0f0] text-[#666]'} hover:text-white hover:bg-[#1877F2] transition-all duration-300 hover:scale-110`} title="Facebook">
                          <Facebook size={16} />
                        </a>
                      )}
                      {biz.socials.whatsapp && (
                        <a href={biz.socials.whatsapp} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full ${isDarkMode ? 'bg-[#2a2a2a] text-[#888]' : 'bg-[#f0f0f0] text-[#666]'} hover:text-white hover:bg-[#25D366] transition-all duration-300 hover:scale-110`} title="WhatsApp">
                          <MessageCircle size={16} />
                        </a>
                      )}
                      {biz.socials.tiktok && (
                        <a href={biz.socials.tiktok} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full ${isDarkMode ? 'bg-[#2a2a2a] text-[#888]' : 'bg-[#f0f0f0] text-[#666]'} hover:text-white hover:bg-black hover:shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-110`} title="TikTok">
                          <Music size={16} />
                        </a>
                      )}
                      {biz.socials.web && (
                        <a href={biz.socials.web} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full ${isDarkMode ? 'bg-[#2a2a2a] text-[#888]' : 'bg-[#f0f0f0] text-[#666]'} hover:text-white hover:bg-[#333] border border-transparent hover:border-[#555] transition-all duration-300 hover:scale-110`} title="Sitio Web">
                          <Globe size={16} />
                        </a>
                      )}
                    </div>

                    <button className={`hover:text-[#DA0037] text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all group/btn ${textPrimary}`}>
                      Ver Perfil <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* --- FOOTER --- */}
      <footer className={`border-t ${isDarkMode ? 'bg-[#171717] border-[#444444]' : 'bg-[#EDEDED] border-[#EDEDED]'} mt-auto relative z-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="mb-6 opacity-80">
                {/* LOGO FOOTER: TEXTO */}
                <div className="flex flex-col justify-start cursor-pointer">
                  <span className={`text-xl font-black tracking-tighter leading-none ${isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]'}`}>
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
                  <a key={i} href="#" className={`transition-colors hover:text-[#DA0037] ${isDarkMode ? 'text-[#444]' : 'text-[#9ca3af]'}`}>
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h5 className={`font-bold mb-4 ${isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]'}`}>Portal</h5>
              <ul className="space-y-2 text-sm">
                {['Directorio Comercial', 'Agenda Cultural', 'Proyectos Urbanos', 'Mapa del Barrio'].map(link => (
                  <li key={link}>
                    <a href="#" className={`hover:text-[#DA0037] transition-colors ${textSecondary}`}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className={`font-bold mb-4 ${isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]'}`}>Institucional</h5>
              <ul className="space-y-2 text-sm">
                {['Cámara de Comercio', 'Transparencia', 'Contacto', 'Acceso Editores'].map(link => (
                  <li key={link}>
                    <a href="#" className={`hover:text-[#DA0037] transition-colors ${textSecondary}`}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className={`font-bold mb-4 ${isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]'}`}>Comunidad</h5>
              <p className={`text-xs mb-4 ${textSecondary}`}>Recibe actualizaciones sobre eventos y nuevos comercios.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Tu correo"
                  className={`w-full px-4 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#DA0037] ${isDarkMode ? 'bg-[#171717] text-[#EDEDED] border border-[#444444]' : 'bg-white text-[#171717] border border-[#444444]'}`}
                />
                <button className="bg-[#DA0037] hover:bg-[#b3002d] text-white p-2 rounded transition-colors">
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className={`pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs ${isDarkMode ? 'border-[#444444] text-[#EDEDED]/40' : 'border-[#d4d4d4] text-[#444444]'}`}>
            <p>&copy; 2025 Portal Las Ánimas. Proyecto de Título INACAP.</p>
            <p>Desarrollado con Next.js + Tailwind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CommerceViewModern;
