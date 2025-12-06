"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import AdminNavbar from "@/components/admin-navbar";

// --- Theme Configuration (Matched to User's Request) ---
const themeConfig = {
  dark: {
    bg: '#171717',
    surface: '#171717',
    surfaceHighlight: '#262626',
    border: '#444444',
    text: '#EDEDED',
    textSecondary: 'rgba(237, 237, 237, 0.6)',
    hover: 'rgba(68, 68, 68, 0.4)',
  },
  light: {
    bg: '#F3F4F6',
    surface: '#FFFFFF',
    surfaceHighlight: '#F9FAFB',
    border: '#E5E7EB',
    text: '#111827',
    textSecondary: '#6B7280',
    hover: '#F3F4F6',
  }
};

const nav = [
  { href: "/admin", label: "Solicitudes", icon: LayoutDashboard },
  { href: "/admin/noticias", label: "Noticias", icon: FileText },
  { href: "/admin/usuarios", label: "Gestión Usuarios", icon: Users },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme Integration
  const { theme: nextTheme } = useTheme();

  // Determine current theme colors
  const currentThemeKey = (mounted && (nextTheme === 'dark' || resolvedTheme === 'dark')) ? 'dark' : 'light';
  const currentTheme = themeConfig[currentThemeKey];

  const handleSignOut = async () => {
    if (isSigningOut) return;
    try {
      setIsSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!mounted) return null;

  const isDarkMode = resolvedTheme === 'dark';
  const bgClass = isDarkMode ? 'bg-[#171717]' : 'bg-[#F3F4F6]';
  const textClass = isDarkMode ? 'text-[#EDEDED]' : 'text-[#111827]';

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${bgClass} ${textClass}`}
      style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}>

      {/* Sidebar */}
      <aside className="w-64 shrink-0 hidden md:flex flex-col border-r transition-colors duration-300 z-20"
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>

        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b transition-colors duration-300"
          style={{ borderColor: currentTheme.border }}>
          <div className="w-8 h-8 rounded bg-[#DA0037] flex items-center justify-center mr-3 shadow-lg shadow-[#DA0037]/20">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-wide transition-colors duration-300" style={{ color: currentTheme.text }}>
            ADMIN
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${active
                  ? 'bg-[#DA0037] text-white shadow-lg shadow-[#DA0037]/20'
                  : 'hover:bg-opacity-10'
                  }`}
                style={{
                  color: active ? 'white' : currentTheme.textSecondary,
                  backgroundColor: active ? '#DA0037' : 'transparent',
                }}
                // Inline hover effect simulation for non-active items
                onMouseEnter={(e) => !active && (e.currentTarget.style.backgroundColor = currentTheme.hover)}
                onMouseLeave={(e) => !active && (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Icon className={`mr-3 h-5 w-5 ${active ? 'text-white' : ''}`}
                  style={{ color: active ? 'white' : currentTheme.textSecondary }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="h-[69px] px-4 border-t flex items-center transition-colors duration-300" style={{ borderColor: currentTheme.border }}>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg hover:text-[#DA0037] transition-colors disabled:opacity-60"
            style={{ color: currentTheme.textSecondary }}
          >
            <LogOut size={18} className="mr-3" />
            {isSigningOut ? "Saliendo..." : "Cerrar Sesión"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col relative">
        <AdminNavbar
          showLogo={false}
          showLinks={true}
          links={[
            { label: 'Inicio', href: '/' },
            { label: 'Comercios', href: '/comercios' },
            { label: 'Nosotros', href: '#' }
          ]}
        />
        <div className="flex-1 pt-20">
          {children}
        </div>
      </main>
    </div>
  );
}
