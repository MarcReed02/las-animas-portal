
"use client";

import React, { useState } from 'react';
import { Calendar, User, Share2, MapPin, Check } from 'lucide-react';
import NavbarNew from '@/components/navbar-new';
import Footer from '@/components/footer';

interface NewsDetailClientProps {
  newsItem: {
    title: string;
    published_at: string;
    author?: string;
    location?: string;
    image_url?: string;
    content?: string;
  };
}

const NewsDetailClient = ({ newsItem }: NewsDetailClientProps) => {
  const [copied, setCopied] = useState(false);

  // Format date if it's a timestamp string
  const formattedDate = new Date(newsItem.published_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const contentParagraphs = newsItem.content
    ? newsItem.content.split('\n').filter(p => p.trim() !== '')
    : ["Contenido no disponible."];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: newsItem.title,
          text: `Mira esta noticia de Las Ánimas Portal: ${newsItem.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error al compartir o cancelado', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('No se pudo copiar', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#171717] text-gray-900 dark:text-[#EDEDED] font-sans transition-colors duration-500">

      <NavbarNew />

      {/* Hero de la Noticia */}
      <div className="w-full h-[400px] relative mb-12 group overflow-hidden mt-16 md:mt-20">
        {/* Imagen de Fondo */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-900">
          {newsItem.image_url ? (
            <img
              src={newsItem.image_url}
              alt={newsItem.title}
              className="w-full h-full object-cover opacity-90 dark:opacity-60 transition-opacity duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-900 dark:to-gray-800"></div>
          )}

          {/* Patrón Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>

          {/* Gradiente Overlay - Theme Aware */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-[#171717] dark:via-[#171717]/60 dark:to-transparent"></div>
        </div>

        {/* Contenido sobre la imagen */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-4xl mx-auto">
          {/* Título Principal */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight drop-shadow-sm dark:drop-shadow-lg">
            {newsItem.title}
          </h1>

          {/* Metadatos Inferiores */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700 dark:text-gray-300 font-medium">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-200 dark:bg-[#333] rounded-full backdrop-blur-sm">
                <User className="w-4 h-4 text-[#DA0037]" />
              </div>
              {newsItem.author || "Cámara de Comercio"}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#DA0037] dark:drop-shadow-md" />
              {formattedDate}
            </div>
            {newsItem.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#DA0037] dark:drop-shadow-md" />
                {newsItem.location}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <article className="max-w-3xl mx-auto px-4 md:px-8 pb-20">

        {/* Cuerpo del texto */}
        <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert">

          {/* Renderizado de párrafos */}
          <div className="space-y-6 text-lg leading-relaxed text-gray-700 dark:text-gray-400 break-words">
            {contentParagraphs.map((parrafo, index) => (
              <p key={index}>{parrafo}</p>
            ))}
          </div>


        </div>

        {/* Footer del Artículo / Compartir */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-[#333] flex justify-end items-center">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 uppercase tracking-wider font-bold">
              {copied ? "¡Enlace copiado!" : "Compartir:"}
            </span>
            <button
              onClick={handleShare}
              className={`p - 2 rounded - full transition - all shadow - md ${copied ? "bg-green-600 text-white shadow-green-600/20" : "bg-gray-100 hover:bg-[#DA0037] text-gray-700 hover:text-white dark:bg-[#222] dark:text-white dark:hover:shadow-[#DA0037]/20"} `}
              title="Compartir noticia"
            >
              {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </article>

      <Footer />
    </div>
  );
};

export default NewsDetailClient;

