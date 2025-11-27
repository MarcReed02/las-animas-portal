"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import { Facebook, Twitter, Instagram, Youtube, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-[#EDEDED] border-[#EDEDED] dark:bg-[#171717] dark:border-[#444444]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-6 opacity-80">
              {/* LOGO FOOTER: TEXTO */}
              <div className="flex flex-col justify-start cursor-pointer">
                <span className="text-xl font-black tracking-tighter leading-none text-[#171717] dark:text-[#EDEDED]">
                  PORTAL
                </span>
                <span className="text-xs font-bold tracking-[0.2em] uppercase leading-none text-[#DA0037]">
                  ANIMAS
                </span>
              </div>
            </div>
            <p className="text-sm mb-6 text-[#444444] dark:text-[#EDEDED]/70">
              Plataforma oficial para el fortalecimiento del comercio y turismo.
              Apoyado por INACAP y la Cámara de Comercio.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="transition-colors hover:text-[#DA0037] text-[#9ca3af] dark:text-[#444444]">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-bold mb-4 text-[#171717] dark:text-[#EDEDED]">Portal</h5>
            <ul className="space-y-2 text-sm">
              {['Directorio Comercial', 'Agenda Cultural', 'Proyectos Urbanos', 'Mapa del Barrio'].map(link => (
                <li key={link}>
                  <a href="#" className="hover:text-[#DA0037] transition-colors text-[#444444] dark:text-[#EDEDED]/70">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-4 text-[#171717] dark:text-[#EDEDED]">Institucional</h5>
            <ul className="space-y-2 text-sm">
              {['Cámara de Comercio', 'Transparencia', 'Contacto', 'Acceso Editores'].map(link => (
                <li key={link}>
                  <a href="#" className="hover:text-[#DA0037] transition-colors text-[#444444] dark:text-[#EDEDED]/70">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-4 text-[#171717] dark:text-[#EDEDED]">Comunidad</h5>
            <p className="text-xs mb-4 text-[#444444] dark:text-[#EDEDED]/70">Recibe actualizaciones sobre eventos y nuevos comercios.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Tu correo"
                className="w-full px-4 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#DA0037] bg-white text-[#171717] border border-[#444444] dark:bg-[#171717] dark:text-[#EDEDED] dark:border-[#444444]"
              />
              <button className="bg-[#DA0037] hover:bg-[#b3002d] text-white p-2 rounded transition-colors">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs border-[#d4d4d4] text-[#444444] dark:border-[#444444] dark:text-[#EDEDED]/40">
          <p>&copy; 2025 Portal Las Ánimas. Proyecto de Título INACAP.</p>
          <p>Desarrollado con Next.js + Tailwind.</p>
        </div>
      </div>
    </footer>
  );
}
