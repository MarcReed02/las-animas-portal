"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  Bell,
  User as UserIcon,
  Menu,
  LogOut,
  Pencil,
  Plus,
  LogIn
} from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import ProfileMenu from './profile-menu';

interface BusinessDetailNavbarProps {
  scrolled: boolean;
  mounted: boolean;
  session: Session | null;
  userData: {
    name: string;
    email?: string;
    role: string | null;
    notifications: number;
  };
  businessStatus: string | null;
  businessName: string | null;
  isNotificationsOpen: boolean;
  toggleNotifications: () => void;
  notificationRef: any;
  isProfileOpen: boolean;
  toggleProfile: () => void;
  setIsProfileOpen: (open: boolean) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  handleSignOut: () => void;
}

export default function BusinessDetailNavbar({
  scrolled,
  mounted,
  session,
  userData,
  businessStatus,
  businessName,
  isNotificationsOpen,
  toggleNotifications,
  notificationRef,
  isProfileOpen,
  toggleProfile,
  setIsProfileOpen,
  isMenuOpen,
  setIsMenuOpen,
  handleSignOut
}: BusinessDetailNavbarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  const themeColors = {
    navBgScrolled: isDarkMode ? 'bg-[#171717]/90' : 'bg-[#EDEDED]/90',
    navBorder: isDarkMode ? 'border-[#27272a]' : 'border-[#d4d4d4]',
    navText: isDarkMode ? 'text-[#ccc]' : 'text-[#333]',
  };

  // Logic to determine background: Sticky needs solid background if scrolled, 
  // but if user wants "separated", maybe we force solid always? 
  // For now, let's keep the transparent-to-solid transition behavior but position it appropriately.
  // Actually, if we use sticky positioned relatively, it pushes content.

  return (
    <nav className={`grid grid-cols-1 w-full z-40 transition-all duration-500 fixed top-0 ${scrolled ? `${themeColors.navBgScrolled} backdrop-blur-xl border-b ${themeColors.navBorder} shadow-sm` : 'bg-black/30 backdrop-blur-md'} h-20`}>
      {/* Fixed position with transparency/blur to show content behind */}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center w-full">
        <Link href="/" className="flex flex-col leading-none select-none cursor-pointer group">
          <span className={`font-black text-xl tracking-tighter group-hover:text-[#DA0037] transition-colors text-white`}>PORTAL</span>
          <span className={`font-bold text-[10px] tracking-[0.2em] uppercase transition-colors text-[#DA0037] group-hover:text-white`}>ANIMAS</span>
        </Link>

        {/* Links aligned right via ml-auto */}
        <div className={`hidden md:flex items-center gap-8 ml-auto text-sm font-medium transition-colors text-white/90`}>
          <Link href="/" className={`hover:text-white transition-colors`}>Inicio</Link>
          <Link href="/comercios" className={`hover:text-white transition-colors`}>Comercios</Link>
          <Link href="/nosotros" className={`hover:text-white transition-colors`}>Nosotros</Link>
        </div>

        <div className="flex items-center gap-4 ml-8">
          {/* BOTÓN DE TEMA */}
          <button
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            className={`p-2 rounded-full transition-all hover:bg-white/10 text-white`}
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
                  className={`p-2 rounded-full transition-all relative hover:bg-white/10 text-white`}
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
                  <div className={`relative rounded-full p-1 border-2 ${isProfileOpen ? 'border-[#DA0037]' : 'border-transparent group-hover:border-[#DA0037]/50'} transition-all bg-white/10 backdrop-blur-md`}>
                    <UserIcon className={`w-5 h-5 text-white`} />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1E1E1E] rounded-full"></span>
                  </div>
                </button>

                {/* --- DROPDOWN MENU (Profile) --- */}
                {isProfileOpen && (
                  <ProfileMenu
                    user={{ name: userData.name, email: userData.email || "" }}
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
              <Link href="/auth/login/ingresar" className={`hidden md:flex items-center gap-2 text-sm font-medium hover:text-[#DA0037] transition-colors text-white`}>
                <LogIn size={16} />
                <span className="hidden lg:inline">Ingresar</span>
              </Link>

              <Link href="/auth/login" className={`hidden md:flex items-center gap-2 bg-[#DA0037] hover:bg-[#b0002c] text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#DA0037]/30`}>
                <Plus size={16} /> Publicar
              </Link>
            </>
          )}

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu /></button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className={`md:hidden absolute top-20 left-0 w-full px-4 pt-2 pb-6 border-b shadow-xl bg-[#171717] border-[#444444]`}>
          <div className="space-y-3">
            {['Inicio', 'Comercios', 'Nosotros'].map((item) => (
              <Link
                key={item}
                href={item === 'Comercios' ? '/comercios' : item === 'Inicio' ? '/' : '/nosotros'}
                className={`block px-3 py-3 rounded-lg text-base font-medium text-[#EDEDED]/80 hover:bg-[#444444]/30`}
              >
                {item}
              </Link>
            ))}
            <div className={`h-px w-full my-2 bg-[#444444]`}></div>

            {session ? (
              <>
                <div className={`p-4 rounded-lg bg-[#2A2A2A]`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-full bg-[#333]`}>
                      <UserIcon size={20} className={'text-gray-300'} />
                    </div>
                    <div>
                      <p className={`font-bold text-sm text-white`}>{userData.name}</p>
                      <p className="text-xs text-gray-500">{userData.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors bg-[#333] text-red-400`}
                  >
                    <LogOut size={14} />
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login/ingresar" className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-medium border border-[#444444] text-[#EDEDED]`}>
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
  );
}
