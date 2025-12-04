"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Sun, Moon, LogIn } from 'lucide-react';
import { useTheme } from 'next-themes';

import NavbarLogged from './navbar-logged';
import { createClient } from '@/lib/supabase/client';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';

export default function NavbarNew() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (!mounted) {
    return null;
  }

  if (session) {
    return <NavbarLogged session={session} />;
  }

  const isDarkMode = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const navClass = isDarkMode
    ? 'bg-[#171717]/90 border-b border-[#444444] backdrop-blur-md'
    : 'bg-white/90 border-b border-[#EDEDED] backdrop-blur-md';

  const textSecondary = isDarkMode ? 'text-[#EDEDED]/70' : 'text-[#444444]';

  return (
    <nav className={`fixed top-0 w-full z-50 ${navClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* LOGO TEXTO: PORTAL ANIMAS */}
          <Link href="/" className="flex flex-col justify-center cursor-pointer group hover:opacity-80 transition-opacity">
            <span className={`text-2xl font-black tracking-tighter leading-none ${isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]'}`}>
              PORTAL
            </span>
            <span className={`text-sm font-bold tracking-[0.2em] uppercase leading-none text-[#DA0037]`}>
              ANIMAS
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              {/* Enlaces con Hover solo de color (Sin línea animada) */}
              {['Inicio', 'Comercios', 'Nosotros'].map((item) => (
                <Link
                  key={item}
                  href={item === 'Comercios' ? '/comercios' : item === 'Inicio' ? '/' : '#'}
                  className={`text-sm font-medium transition-colors duration-200 hover:text-[#DA0037] ${textSecondary}`}
                >
                  {item}
                </Link>
              ))}

              <div className={`h-6 w-px mx-2 ${isDarkMode ? 'bg-[#444444]' : 'bg-[#EDEDED]'}`}></div>

              <Link href="/auth/login/ingresar" className={`flex items-center gap-2 text-sm font-medium hover:text-[#DA0037] transition-colors ${isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]'}`}>
                <LogIn size={16} />
                Iniciar sesión
              </Link>

              {/* Botón Ingreso Comerciantes: Rojo Sólido */}
              <Link href="/auth/login" className={`text-xs font-bold px-5 py-2.5 rounded-full transition-all bg-[#DA0037] text-white hover:bg-[#b3002d] shadow-lg shadow-[#DA0037]/20 hover:scale-105`}>
                Registro de Comercio
              </Link>

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-[#444444]/30 text-[#EDEDED] hover:bg-[#444444]/50' : 'bg-[#EDEDED] text-[#444444] hover:bg-[#e5e5e5]'}`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleTheme} className="text-[#DA0037]">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]'}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className={`md:hidden absolute w-full px-4 pt-2 pb-6 border-b shadow-xl ${isDarkMode ? 'bg-[#171717] border-[#444444]' : 'bg-white border-[#EDEDED]'}`}>
          <div className="space-y-3">
            {['Inicio', 'Comercios', 'Nosotros'].map((item) => (
              <Link
                key={item}
                href={item === 'Comercios' ? '/comercios' : item === 'Inicio' ? '/' : '#'}
                className={`block px-3 py-3 rounded-lg text-base font-medium ${isDarkMode ? 'text-[#EDEDED]/80 hover:bg-[#444444]/30' : 'text-[#444444] hover:bg-[#EDEDED]'}`}
              >
                {item}
              </Link>
            ))}
            <div className={`h-px w-full my-2 ${isDarkMode ? 'bg-[#444444]' : 'bg-[#EDEDED]'}`}></div>
            <Link href="/auth/login/ingresar" className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-medium border ${isDarkMode ? 'border-[#444444] text-[#EDEDED]' : 'border-[#EDEDED] text-[#171717]'}`}>
              <LogIn size={18} /> Iniciar sesión
            </Link>
            <Link href="/auth/login" className={`block w-full text-center px-3 py-3 rounded-lg font-bold bg-[#DA0037] text-white`}>
              Registro de Comercio
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
