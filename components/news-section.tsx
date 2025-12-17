"use client";

import React from 'react';
import { Building2, Users, Target, Calendar, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

type NewsItem = {
  id?: string | number
  title: string
  excerpt?: string
  href?: string
  image_url?: string
  slug?: string
  published_at?: string
};

const NewsSection = ({ items = [] }: { items?: NewsItem[] }) => {
  // Use passed items or fallback to empty array if undefined
  const newsItems = items || [];

  // If no items, we can show the static placeholders from the design as specific example content
  // OR we can map the real items.
  // The user request implies adapting the design to the project logic.
  // So I will try to map real items first, but if empty, I'll fallback to the mock data 
  // to ensure the design is visible immediately (as requested "adapta el diseño").

  const displayItems = newsItems.length > 0 ? newsItems : [
    {
      id: 'mock-1',
      title: "Gran Feria de Emprendedores Animeños",
      excerpt: "Ven a la plaza del barrio a descubrir productos locales, artesanía y gastronomía de nuestros vecinos. Una oportunidad única para apoyar el comercio local.",
      date: "15 Oct, 2025",
      image: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Feria_Fluvial%2C_Valdivia%2C_20190216_-_04.jpg",
      icon: Building2,
      slug: "gran-feria-de-emprendedores"
    },
    {
      id: 'mock-2',
      title: "Reunión Abierta Cámara de Comercio",
      excerpt: "Invitamos a todos los comerciantes a participar en la planificación de las actividades de fin de año. Tu opinión es fundamental para el crecimiento del barrio.",
      date: "10 Oct, 2025",
      image: "https://upload.wikimedia.org/wikipedia/commons/2/23/R%C3%ADo_Calle_Calle%2C_Valdivia._Sur_de_Chile.jpg",
      icon: Users,
      slug: "reunion-abierta-camara-de-comercio"
    },
    {
      id: 'mock-3',
      title: 'Taller Gratuito: "Tu Negocio en Internet"',
      excerpt: "Capacitación para aprender a gestionar tu ficha en el portal y mejorar tus redes sociales. No te quedes fuera de la transformación digital.",
      date: "05 Oct, 2025",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Puente_de_Las_%C3%81nimas_03.jpg",
      icon: Target,
      slug: "taller-gratuito-tu-negocio-en-internet"
    }
  ];

  return (
    <div className="bg-white dark:bg-[#171717] transition-colors duration-500 text-gray-900 dark:text-[#EDEDED] font-sans p-4 md:p-8 flex items-center justify-center">

      {/* Sección de Noticias y Eventos */}
      <section className="w-full max-w-7xl mx-auto py-12 border-t border-gray-200 dark:border-[#444444]">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Novedades del Barrio</h2>
            <p className="text-gray-600 dark:text-gray-400">Mantente al día con las actividades, ferias y reuniones de Las Ánimas.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-[#DA0037] font-bold hover:text-[#b3002d] dark:hover:text-white transition-colors group">
            Ver todas las noticias <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {displayItems.map((item: any, idx) => {
            // Determine icon or image
            const Icon = item.icon || Building2; // Default icon if none
            const hasImage = !!item.image_url || !!item.image;
            const itemDate = item.published_at
              ? new Date(item.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
              : item.date;

            return (
              <div key={item.id || idx} className="bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#444444] rounded-xl overflow-hidden group hover:border-[#DA0037] dark:hover:border-[#DA0037] transition-all hover:-translate-y-1 shadow-lg hover:shadow-xl">
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-[#333] dark:to-[#1a1a1a] relative flex items-center justify-center overflow-hidden">
                  {hasImage ? (
                    <img src={item.image_url || item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-400 via-gray-200 to-white dark:from-gray-500 dark:via-gray-900 dark:to-black"></div>
                      <Icon className="w-16 h-16 text-gray-400 dark:text-[#444444] group-hover:text-[#DA0037] transition-colors relative z-10" />
                    </>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                    <Calendar className="w-3 h-3" />
                    <span>{itemDate}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-[#DA0037] transition-colors leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3">
                    {item.excerpt || item.description || "Sin descripción disponible."}
                  </p>
                  <Link href={item.slug ? `/noticias/${item.slug}` : (item.href || "#")} className="inline-flex items-center text-sm font-bold text-gray-900 dark:text-white hover:text-[#DA0037] dark:hover:text-[#DA0037] transition-colors">
                    Leer más <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}

        </div>

        <div className="mt-8 text-center md:hidden">
          <button className="text-[#DA0037] font-bold hover:text-[#b3002d] dark:hover:text-white transition-colors flex items-center justify-center w-full gap-2 py-3 border border-[#DA0037] rounded-lg">
            Ver todas las noticias <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </section>

    </div>
  );
};

export default NewsSection;
