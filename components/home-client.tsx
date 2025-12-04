"use client";

import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  Activity,
  Truck,
  Map,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  ArrowRight,
  Clock,
  Calendar,
  MapPin,
  Search,
  CheckCircle2,
  LogIn,
  HardHat,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';
import Link from 'next/link';

// --- COMPONENTE LOGO VECTORIZADO (SVG) ---
const AnimasLogo = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <svg viewBox="0 0 400 180" className="h-14 w-auto transition-all duration-300" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Puente */}
    <path
      d="M20 60 C 100 20, 300 20, 380 60 L 380 85 C 300 45, 100 45, 20 85 Z"
      className={`transition-colors duration-300 ${isDarkMode ? 'fill-[#EDEDED]' : 'fill-[#444444]'}`}
    />
    {/* Pilares (Recorte) */}
    <path
      d="M80 85 C 110 55, 160 55, 190 85 L 80 85 Z"
      className={`transition-colors duration-300 ${isDarkMode ? 'fill-[#171717]' : 'fill-white'}`}
    />
    <path
      d="M210 85 C 240 55, 290 55, 320 85 L 210 85 Z"
      className={`transition-colors duration-300 ${isDarkMode ? 'fill-[#171717]' : 'fill-white'}`}
    />

    {/* Olas */}
    <path
      d="M60 110 C 120 90, 200 140, 340 100 L 340 115 C 200 155, 120 105, 60 125 Z"
      className="fill-[#DA0037] transition-colors duration-300"
    />
    <path
      d="M100 135 C 160 115, 220 155, 300 125 L 300 140 C 220 170, 160 130, 100 150 Z"
      className="fill-[#B0002C] transition-colors duration-300"
    />
  </svg>
);

type NewsItem = {
  id?: string | number
  title: string
  excerpt?: string
  href?: string
  image_url?: string
  slug?: string
  published_at?: string
}

import { useTheme } from 'next-themes';
import NavbarNew from './navbar-new';
import Footer from './footer';

// ... (imports)

export default function HomeClient({ newsItems }: { newsItems: NewsItem[] }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- DATOS ---
  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
      alt: "Vista nocturna del barrio"
    },
    {
      url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80",
      alt: "Gastronomía local"
    },
    {
      url: "https://images.unsplash.com/photo-1569388330292-79cc1ec67270?auto=format&fit=crop&q=80",
      alt: "Eventos comunitarios"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const isDarkMode = resolvedTheme === 'dark';

  // Map news items to agenda format
  const agendaItems = newsItems.slice(0, 3).map((item, index) => {
    const dateObj = item.published_at ? new Date(item.published_at) : new Date();
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('es-ES', { month: 'short' });

    return {
      id: item.id || index,
      image: item.image_url || `https://lipsum.app/random/480x320?i=${index}`,
      title: item.title,
      date: `${day} ${month}`,
      time: "12:00 PM", // Placeholder
      location: "Las Ánimas", // Placeholder
      price: "Gratis", // Placeholder
      category: "Noticia" // Placeholder
    };
  });



  const urbanProjects = [
    {
      id: 1,
      title: "Rehabilitación Puente Las Ánimas",
      status: "En Ejecución",
      progress: 75,
      milestone: "Instalación de luminarias finalizada",
      image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      title: "Mejoramiento Plaza Central",
      status: "Planificación",
      progress: 20,
      milestone: "Aprobación de diseño arquitectónico",
      image: "https://images.unsplash.com/photo-1496564203457-11bb12075d90?auto=format&fit=crop&q=80"
    }
  ];

  // --- VARIABLES DE ESTILO ---
  const bgClass = isDarkMode
    ? 'bg-[#171717] text-[#EDEDED]'
    : 'bg-white text-[#171717]';

  const surfaceClass = isDarkMode
    ? 'bg-[#171717] border border-[#444444] shadow-none hover:border-[#DA0037]/50'
    : 'bg-white border border-[#EDEDED] shadow-sm hover:border-[#DA0037]/30 hover:shadow-md';

  // navClass removed as it is in NavbarNew

  const btnPrimaryClass = `bg-[#DA0037] hover:bg-[#b3002d] text-white shadow-lg shadow-[#DA0037]/20 hover:shadow-[#DA0037]/40 transition-all duration-300`;

  const textSecondary = isDarkMode ? 'text-[#EDEDED]/70' : 'text-[#444444]';
  const textTertiary = isDarkMode ? 'text-[#444444]' : 'text-[#9ca3af]';
  const accentText = 'text-[#DA0037]';

  return (
    <div className={`min-h-screen transition-colors duration-500 ease-in-out ${bgClass}`} style={{ fontFamily: "'Inter', sans-serif" }}>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
      `}</style>

      <NavbarNew />

      {/* --- HERO SECTION --- */}
      <header className="relative pt-20 flex flex-col justify-center min-h-[85vh] overflow-hidden">
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${index === currentHeroImage ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <img
              src={img.url}
              alt={img.alt}
              className="w-full h-full object-cover transition-transform scale-110"
              style={{ transitionDuration: '20s' }}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${isDarkMode ? 'from-[#171717] via-[#171717]/80 to-transparent' : 'from-white via-white/80 to-transparent'}`}></div>
            <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-[#171717] via-transparent to-transparent' : 'from-white via-transparent to-transparent'}`}></div>
          </div>
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col h-full justify-center items-center text-center pb-32 pt-10">
          <div className="max-w-4xl animate-fade-in-up flex flex-col items-center">
            <h1 className={`text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight drop-shadow-lg ${isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]'}`}>
              EL CORAZÓN DE <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-[#DA0037] to-[#DA0037]/70' : 'from-[#DA0037] to-[#B0002C]'}`}>
                LAS ÁNIMAS
              </span>
            </h1>

            <p className={`text-lg md:text-xl mb-10 max-w-2xl leading-relaxed ${textSecondary}`}>
              Encuentra comercios, eventos y servicios en un solo lugar.
              Información oficial y confiable del barrio.
            </p>

            <div className={`w-full max-w-2xl p-2 rounded-xl flex items-center gap-2 shadow-2xl transition-all hover:scale-[1.01] ${isDarkMode ? 'bg-[#171717]/90 backdrop-blur-xl border border-[#444444]' : 'bg-white shadow-xl border border-[#EDEDED]'}`}>
              <Search className={`ml-4 ${isDarkMode ? 'text-[#444444]' : 'text-[#9ca3af]'}`} size={24} />
              <input
                type="text"
                placeholder="¿Qué estás buscando hoy? (ej. Restaurantes, Eventos...)"
                className={`flex-1 bg-transparent border-none outline-none py-4 px-2 text-lg ${isDarkMode ? 'text-[#EDEDED] placeholder:text-[#444444]' : 'text-[#171717] placeholder:text-[#9ca3af]'}`}
              />
              <button className={`px-8 py-4 rounded-lg font-bold tracking-wide ${btnPrimaryClass}`}>
                BUSCAR
              </button>
            </div>

            <div className="flex gap-2 mt-8">
              {heroImages.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-500 ${index === currentHeroImage
                    ? 'w-8 bg-[#DA0037]'
                    : `w-2 ${isDarkMode ? 'bg-[#EDEDED]/20' : 'bg-[#171717]/20'}`
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* --- AGENDA DEL MES --- */}
      <section className={`pt-20 pb-20 px-4 sm:px-6 lg:px-8 relative`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className={`text-sm font-bold tracking-widest uppercase mb-2 ${accentText}`}>
                Actividades y Eventos
              </h2>
              <h3 className={`text-3xl md:text-4xl font-black tracking-tight ${isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]'}`}>
                Agenda del Mes
              </h3>
            </div>
            <button className={`flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all ${isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]'}`}>
              VER CALENDARIO COMPLETO <ArrowRight size={16} className="text-[#DA0037]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {agendaItems.length > 0 ? (
              agendaItems.map((item) => (
                <article
                  key={item.id}
                  className={`group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer ${surfaceClass}`}
                >
                  <div className="relative h-48 overflow-hidden">
                    {/* Imagen con Zoom al Hover */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute top-4 right-4 backdrop-blur-md border px-3 py-1 rounded-full text-xs font-bold uppercase ${isDarkMode ? 'bg-[#171717]/80 border-[#444444] text-[#EDEDED]' : 'bg-white/80 border-[#EDEDED] text-[#171717]'}`}>
                      {item.category}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`flex flex-col items-center justify-center p-2 rounded-lg border w-14 h-14 ${isDarkMode ? 'bg-[#171717] border-[#444444] text-[#EDEDED]' : 'bg-white border-[#EDEDED] text-[#171717]'}`}>
                        <span className="text-xs font-bold uppercase">{item.date.split(' ')[1]}</span>
                        <span className="text-xl font-black">{item.date.split(' ')[0]}</span>
                      </div>
                      <div className="text-right">
                        <span className={`block text-xs font-medium mb-1 ${textTertiary}`}>{item.price}</span>
                      </div>
                    </div>
                    <h4 className={`text-lg font-bold mb-3 leading-tight group-hover:text-[#DA0037] transition-colors ${isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]'}`}>
                      {item.title}
                    </h4>
                    <div className="space-y-2 mt-auto">
                      <div className={`flex items-center gap-2 text-xs ${textSecondary}`}>
                        <Clock size={14} className={accentText} /> {item.time}
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${textSecondary}`}>
                        <MapPin size={14} className={accentText} /> {item.location}
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className={`col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-2xl ${isDarkMode ? 'border-[#444444] bg-[#171717]/50' : 'border-[#EDEDED] bg-gray-50'}`}>
                <Calendar size={48} className={`mb-4 ${isDarkMode ? 'text-[#444444]' : 'text-gray-300'}`} />
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]'}`}>
                  No hay actividades programadas
                </h3>
                <p className={`max-w-md ${textSecondary}`}>
                  Por el momento no tenemos eventos o noticias para mostrar. ¡Vuelve pronto para enterarte de las novedades del barrio!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>



      {/* --- CTA: ANIMACIONES PROFESIONALES --- */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover opacity-20 filter grayscale" alt="Comercio" />
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-[#DA0037]/90' : 'bg-[#DA0037]/95'}`}></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            ¿Eres comerciante en Las Ánimas?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Oficializa tu comercio en el portal, aumenta tu visibilidad y conecta con miles de vecinos y turistas.
            El proceso es gratuito y gestionado por la Cámara de Comercio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Botón 1: Animación de escala y elevación */}
            <Link href="/anuncios/crear" className={`px-8 py-4 bg-white text-[#DA0037] font-black rounded-lg shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 flex items-center justify-center gap-2`}>
              <CheckCircle2 size={20} />
              OFICIALIZA TU COMERCIO
            </Link>
            {/* Botón 2: Animación de borde y fondo sutil */}
            <button className={`px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg transition-all duration-300 hover:bg-white/10 hover:border-white/80`}>
              MÁS INFORMACIÓN
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-white/60 text-sm">
            <span className="flex items-center gap-2"><Shield size={16} /> Datos verificados</span>
            <span className="flex items-center gap-2"><User size={16} /> Gestión simple</span>
          </div>
        </div>
      </section>

      {/* --- MAPA DE UBICACIÓN --- */}
      <section className="w-full h-[500px] relative z-0">
        <iframe
          src="https://maps.google.com/maps?q=Las%20Animas,%20Valdivia&t=&z=15&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa de Las Ánimas"
          className="w-full h-full"
        ></iframe>
      </section>

      {/* --- FOOTER --- */}
      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
}
