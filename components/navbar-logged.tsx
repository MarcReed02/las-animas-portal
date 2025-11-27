import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Sun, Moon, Bell, Menu, X,
  User as UserIcon, LogOut, Settings, LayoutDashboard,
  Plus, Heart
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';

interface NavbarLoggedProps {
  session?: Session;
  user?: User;
  progress?: number;
}

const NavbarLogged = ({ session, user: propUser, progress }: NavbarLoggedProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const currentUser = session?.user || propUser;

  // Obtener nombre y apellido desde metadata
  const getDisplayName = () => {
    if (!currentUser) return "Usuario";
    const metadata = currentUser.user_metadata;
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
    email: currentUser?.email,
    role: "merchant", // Cambiar a 'neighbor' para ver la diferencia
    notifications: 5,
    messages: 2
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!mounted) return null;

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
          <div className="hidden md:block flex-1">
            <div className="flex items-center justify-end space-x-6">

              {progress !== undefined ? (
                /* PROGRESS BAR MODE */
                <div className="flex flex-col items-end gap-1 w-64 mr-6">
                  <div className="flex justify-between w-full text-[10px] font-bold uppercase tracking-widest text-[#71717a]">
                    <span>Progreso</span>
                    <span className={progress === 100 ? 'text-[#DA0037]' : ''}>{progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#27272a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#DA0037] to-[#ff4d6d] transition-all duration-1000 ease-out shadow-[0_0_10px_#DA0037]"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                /* STANDARD LINKS MODE */
                <>
                  {['Inicio', 'Directorio', 'Agenda', 'Proyectos', 'Nosotros'].map((item) => (
                    <Link
                      key={item}
                      href={item === 'Directorio' ? '/comercios' : item === 'Inicio' ? '/' : '#'}
                      className={`text-sm font-medium transition-colors duration-200 hover:text-[#DA0037] ${textSecondary}`}
                    >
                      {item}
                    </Link>
                  ))}
                  <div className={`h-6 w-px mx-2 ${isDarkMode ? 'bg-[#444444]' : 'bg-[#EDEDED]'}`}></div>
                </>
              )}

              {/* ZONA DE ACCIÓN DEL USUARIO */}
              <div className="flex items-center gap-3">
                {/* Botón Publicar / Favoritos - Only show if NOT in progress mode or if desired */}
                {progress === undefined && (
                  userData.role === 'merchant' ? (
                    <button className="group bg-[#DA0037] hover:bg-[#b0002d] text-white pl-2 pr-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#DA0037]/20 hover:scale-105">
                      <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors">
                        <Plus size={14} strokeWidth={3} />
                      </div>
                      <span>Publicar</span>
                    </button>
                  ) : (
                    <button className={`border border-[#DA0037] text-[#DA0037] hover:bg-[#DA0037] hover:text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all`}>
                      <Heart size={14} strokeWidth={2.5} />
                      <span>Favoritos</span>
                    </button>
                  )
                )}

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-[#444444]/30 text-[#EDEDED] hover:bg-[#444444]/50' : 'bg-[#EDEDED] text-[#444444] hover:bg-[#e5e5e5]'}`}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notificaciones */}
                <button className={`p-2 rounded-full relative transition-all ${isDarkMode ? 'bg-[#444444]/30 text-[#EDEDED] hover:bg-[#444444]/50' : 'bg-[#EDEDED] text-[#444444] hover:bg-[#e5e5e5]'}`}>
                  <Bell size={18} />
                  {userData.notifications > 0 && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#DA0037] rounded-full ring-2 ring-[#1E1E1E] animate-pulse"></span>
                  )}
                </button>

                {/* Avatar Trigger */}
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="relative pl-1 pr-1 group focus:outline-none flex items-center"
                  >
                    <div className={`relative rounded-full p-1 border-2 ${isProfileOpen ? 'border-[#DA0037]' : 'border-transparent group-hover:border-[#DA0037]/50'} transition-all ${isDarkMode ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}>
                      <UserIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1E1E1E] rounded-full"></span>
                    </div>
                  </button>

                  {/* --- DROPDOWN MENU (Profile) --- */}
                  {isProfileOpen && (
                    <div className={`absolute right-0 top-12 w-64 rounded-2xl shadow-2xl border origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 z-50 overflow-hidden ${isDarkMode ? 'bg-[#1E1E1E] border-[#333]' : 'bg-white border-gray-100'}`}>
                      {/* Header del Dropdown */}
                      <div className={`p-5 border-b ${isDarkMode ? 'border-[#333]' : 'border-gray-100'}`}>
                        <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{userData.email}</p>
                        <span className={`inline-block mt-3 text-[10px] font-bold px-2 py-0.5 rounded border ${userData.role === 'merchant' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'} uppercase tracking-wider`}>
                          {userData.role === 'merchant' ? 'Cuenta Comerciante' : 'Cuenta Vecino'}
                        </span>
                      </div>

                      {/* Opciones del Menú */}
                      <div className="p-2 space-y-1">
                        {userData.role === 'merchant' && (
                          <Link href="/protected" className={`flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-all ${isDarkMode ? 'text-gray-300 hover:bg-[#DA0037] hover:text-white hover:shadow-lg hover:shadow-red-900/20' : 'text-gray-700 hover:bg-[#DA0037] hover:text-white'}`}>
                            <LayoutDashboard size={18} />
                            <span className="font-medium">Panel de Control</span>
                          </Link>
                        )}

                        <Link href="#" className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-[#2A2A2A] hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                          <UserIcon size={18} />
                          <span>Editar Perfil</span>
                        </Link>

                        <Link href="#" className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-[#2A2A2A] hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                          <Settings size={18} />
                          <span>Ajustes</span>
                        </Link>
                      </div>

                      {/* Footer Dropdown */}
                      <div className={`p-2 border-t ${isDarkMode ? 'border-[#333]' : 'border-gray-100'} mt-1`}>
                        <button
                          onClick={handleSignOut}
                          className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}
                        >
                          <LogOut size={14} />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu Toggle */}
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
            {['Inicio', 'Directorio', 'Agenda', 'Proyectos', 'Nosotros'].map((item) => (
              <Link
                key={item}
                href={item === 'Directorio' ? '/comercios' : item === 'Inicio' ? '/' : '#'}
                className={`block px-3 py-3 rounded-lg text-base font-medium ${isDarkMode ? 'text-[#EDEDED]/80 hover:bg-[#444444]/30' : 'text-[#444444] hover:bg-[#EDEDED]'}`}
              >
                {item}
              </Link>
            ))}
            <div className={`h-px w-full my-2 ${isDarkMode ? 'bg-[#444444]' : 'bg-[#EDEDED]'}`}></div>

            {/* Mobile User Profile Info */}
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarLogged;
