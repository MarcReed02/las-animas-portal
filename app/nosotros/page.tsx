"use client";

import React, { useEffect, useState } from 'react';
import { MapPin, Users, Target, Building2, Mail, Eye, Handshake } from 'lucide-react';
import { useTheme } from 'next-themes';
import NavbarNew from '@/components/navbar-new';
import Footer from '@/components/footer';

const LasAnimasAbout = () => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDarkMode = resolvedTheme === 'dark';

  // --- VARIABLES DE ESTILO ---
  const bgClass = isDarkMode ? 'bg-[#171717] text-[#EDEDED]' : 'bg-gray-50 text-gray-900';
  const sectionBg = isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white';
  const cardBg = isDarkMode ? 'bg-[#222222] border-[#444444]' : 'bg-white border-gray-200 shadow-lg';
  const cardBorderHover = isDarkMode ? 'hover:border-[#DA0037]' : 'hover:border-[#DA0037]';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const textSubtle = isDarkMode ? 'text-gray-500' : 'text-gray-500';
  const formInputBg = isDarkMode ? 'bg-[#333333] border-[#444444] text-white' : 'bg-gray-50 border-gray-200 text-gray-900';
  const iconContainerBg = isDarkMode ? 'bg-[#171717] border-[#333]' : 'bg-gray-100 border-gray-200';

  return (
    <div className={`min-h-screen font-sans selection:bg-[#DA0037] selection:text-white transition-colors duration-500 ${bgClass}`}>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-40 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#DA0037] opacity-5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Impulsando la identidad digital<br />
            <span className="text-[#DA0037]">de nuestro barrio.</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed ${textMuted}`}>
            Las Ánimas Portal nace para conectar la tradición comercial con las nuevas oportunidades tecnológicas, creando un puente entre nuestros emprendedores y la comunidad.
          </p>

          <div className={`flex flex-wrap justify-center gap-8 mt-12 text-sm font-semibold tracking-wider uppercase ${textSubtle}`}>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#DA0037]" /> Comercio Local
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#DA0037]" /> Turismo Fluvial
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#DA0037]" /> Identidad
            </div>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className={`py-20 relative transition-colors duration-500 ${sectionBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Misión */}
            <div className={`p-8 md:p-12 rounded-2xl border transition-all group relative overflow-hidden ${cardBg} ${cardBorderHover}`}>
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target size={120} className={isDarkMode ? 'text-white' : 'text-black'} />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-lg text-[#DA0037] border ${iconContainerBg}`}>
                  <Target className="w-8 h-8" />
                </div>
                <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Nuestra Misión</h2>
              </div>
              <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Centralizar y visibilizar la oferta comercial y turística de Las Ánimas en una plataforma unificada, facilitando el acceso a la información y apoyando la transformación digital de nuestros emprendedores locales para fortalecer la economía del barrio.
              </p>
            </div>

            {/* Visión */}
            <div className={`p-8 md:p-12 rounded-2xl border transition-all group relative overflow-hidden ${cardBg} ${cardBorderHover}`}>
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Eye size={120} className={isDarkMode ? 'text-white' : 'text-black'} />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-lg text-[#DA0037] border ${iconContainerBg}`}>
                  <Eye className="w-8 h-8" />
                </div>
                <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Nuestra Visión</h2>
              </div>
              <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Convertirnos en el referente digital de la vida de barrio en Valdivia, posicionando a Las Ánimas como un destino turístico y comercial consolidado, donde la tecnología potencia nuestra historia, identidad y sentido de comunidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Contacto para Colaboradores */}
      <section className={`py-20 transition-colors duration-500 ${bgClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contenedor principal */}
          <div className={`rounded-2xl p-8 md:p-16 relative overflow-hidden border ${cardBg}`}>
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#DA0037] opacity-5 blur-[100px] rounded-full pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DA0037]/10 text-[#DA0037] text-sm font-bold mb-6 border border-[#DA0037]/20">
                  <Handshake className="w-4 h-4" /> Alianzas Estratégicas
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Quieres colaborar con nosotros?</h2>
                <p className={`mb-8 text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Este proyecto crece gracias a la red de apoyo de Las Ánimas. Buscamos conectar con <strong>instituciones, patrocinadores, juntas de vecinos y líderes locales</strong> que quieran aportar al desarrollo del portal.
                </p>

                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className={`mt-1 p-3 rounded-lg text-[#DA0037] h-fit border ${iconContainerBg}`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Instituciones y Empresas</h4>
                      <p className={textMuted}>¿Deseas patrocinar una sección o integrar servicios municipales? Hablemos de integración.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className={`mt-1 p-3 rounded-lg text-[#DA0037] h-fit border ${iconContainerBg}`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Organizaciones Sociales</h4>
                      <p className={textMuted}>Si representas a una junta de vecinos o agrupación cultural, ayúdanos a difundir eventos.</p>
                    </div>
                  </div>

                  <div className={`pt-4 border-t ${isDarkMode ? 'border-[#444444]' : 'border-gray-200'}`}>
                    <div className={`flex items-center gap-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Mail className="w-5 h-5 text-[#DA0037]" />
                      <span>contacto@lasanimasportal.cl</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de Colaboración */}
              <div className={`p-8 rounded-xl border shadow-lg ${isDarkMode ? 'bg-[#171717] border-[#444444]' : 'bg-white border-gray-100'}`}>
                <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Formulario de Contacto</h3>
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${textMuted}`}>Nombre</label>
                      <input type="text" className={`w-full rounded-lg p-3 focus:ring-2 focus:ring-[#DA0037] focus:border-transparent outline-none transition-all placeholder-gray-500 ${formInputBg}`} placeholder="Tu nombre" />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${textMuted}`}>Organización</label>
                      <input type="text" className={`w-full rounded-lg p-3 focus:ring-2 focus:ring-[#DA0037] focus:border-transparent outline-none transition-all placeholder-gray-500 ${formInputBg}`} placeholder="Empresa / JJVV" />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textMuted}`}>Correo Electrónico</label>
                    <input type="email" className={`w-full rounded-lg p-3 focus:ring-2 focus:ring-[#DA0037] focus:border-transparent outline-none transition-all placeholder-gray-500 ${formInputBg}`} placeholder="correo@ejemplo.com" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${textMuted}`}>Propuesta o Mensaje</label>
                    <textarea rows={4} className={`w-full rounded-lg p-3 focus:ring-2 focus:ring-[#DA0037] focus:border-transparent outline-none transition-all placeholder-gray-500 ${formInputBg}`} placeholder="Cuéntanos cómo te gustaría colaborar con el portal..."></textarea>
                  </div>
                  <button type="submit" className="w-full bg-[#DA0037] hover:bg-[#b0002c] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#DA0037]/20">
                    <Handshake className="w-5 h-5" />
                    Enviar Propuesta
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <NavbarNew />
      <LasAnimasAbout />
      <Footer />
    </div>
  );
}
