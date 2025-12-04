import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Sun, Moon, Bell, Menu, X,
  User as UserIcon, LogOut, Settings, LayoutDashboard,
  FileText, Users, ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import ProfileMenu from './profile-menu';

interface AdminNavbarProps {
  session?: Session;
  user?: User;
  showLogo?: boolean;
  showLinks?: boolean;
  links?: { label: string; href: string; icon?: any }[];
}

const AdminNavbar = ({ session, user: propUser, showLogo = true, showLinks = true, links }: AdminNavbarProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifications = () => setIsNotificationsOpen(!isNotificationsOpen);

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

  useEffect(() => {
    setMounted(true);
    const fetchRole = async () => {
      if (currentUser?.id) {
        // Fetch Role
        const { data: userData } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', currentUser.id)
          .single();
        if (userData) {
          setUserRole(userData.rol);
        }
      }
    };
    fetchRole();
  }, [currentUser, supabase]);

  const userData = {
    name: (userRole === 'admin' || !userRole) ? "Administrador" : getDisplayName(),
    email: currentUser?.email,
    role: userRole || "admin", // Default to admin for this component context
    notifications: 0, // Admin notifications logic to be implemented if needed
  };

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

  const defaultNavItems = [
    { href: "/admin", label: "Solicitudes", icon: LayoutDashboard },
    { href: "/admin/noticias", label: "Noticias", icon: FileText },
    { href: "/admin/usuarios", label: "Usuarios", icon: Users },
    { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
  ];

  const navItems = links || defaultNavItems;

  return (
    <nav className={`fixed top-0 w-full z-50 ${navClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* LOGO TEXTO: PORTAL ANIMAS ADMIN */}
          {showLogo ? (
            <Link href="/admin" className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded bg-[#DA0037] flex items-center justify-center shadow-lg shadow-[#DA0037]/20">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <span className={`text-xl font-black tracking-tighter leading-none ${isDarkMode ? 'text-[#EDEDED]' : 'text-[#171717]'}`}>
                  PORTAL
                </span>
                <span className={`text-xs font-bold tracking-[0.2em] uppercase leading-none text-[#DA0037]`}>
                  ADMIN
                </span>
              </div>
            </Link>
          ) : (
            <div /> /* Spacer if logo is hidden */
          )}

          {/* Desktop Menu */}
          <div className="hidden md:block flex-1">
            <div className="flex items-center justify-end space-x-6">

              {/* LINKS MODE */}
              {showLinks && (
                <>
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`text-sm font-medium transition-colors duration-200 hover:text-[#DA0037] ${isActive ? 'text-[#DA0037] font-bold' : textSecondary}`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                  <div className={`h-6 w-px mx-2 ${isDarkMode ? 'bg-[#444444]' : 'bg-[#EDEDED]'}`}></div>
                </>
              )}

              {/* ZONA DE ACCIÓN DEL USUARIO */}
              <div className="flex items-center gap-3">

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-[#444444]/30 text-[#EDEDED] hover:bg-[#444444]/50' : 'bg-[#EDEDED] text-[#444444] hover:bg-[#e5e5e5]'}`}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Notificaciones */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={toggleNotifications}
                    className={`p-2 rounded-full relative transition-all ${isDarkMode ? 'bg-[#444444]/30 text-[#EDEDED] hover:bg-[#444444]/50' : 'bg-[#EDEDED] text-[#444444] hover:bg-[#e5e5e5]'}`}
                  >
                    <Bell size={18} />
                    {userData.notifications > 0 && (
                      <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#DA0037] rounded-full ring-2 ring-[#1E1E1E] animate-pulse"></span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 transform origin-top-right z-50 p-4">
                      <div className="text-center py-4">
                        <p className="text-xs text-[#a1a1aa]">No tienes notificaciones nuevas.</p>
                      </div>
                    </div>
                  )}
                </div>

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
                    <ProfileMenu
                      user={{ name: userData.name, email: userData.email || undefined }}
                      role={userData.role}
                      onClose={() => setIsProfileOpen(false)}
                      onSignOut={handleSignOut}
                    />
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
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`block px-3 py-3 rounded-lg text-base font-medium ${isDarkMode ? 'text-[#EDEDED]/80 hover:bg-[#444444]/30' : 'text-[#444444] hover:bg-[#EDEDED]'}`}
              >
                {item.label}
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

export default AdminNavbar;
