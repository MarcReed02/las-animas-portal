"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FiHome, FiFileText, FiUser, FiLogOut } from "react-icons/fi";

import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/protected", label: "Inicio", icon: FiHome },
  { href: "/protected/anuncios", label: "Mis anuncios", icon: FiFileText },
  { href: "/protected/perfil", label: "Mi perfil", icon: FiUser },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    try {
      setIsSigningOut(true);
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("[protected] error al cerrar sesión", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (pathname === "/protected") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#0c0c0c]">
        <div className="h-16 flex items-center px-5 text-lg font-semibold tracking-wide">
          Panel
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-full px-3 py-2 border transition-colors ${active ? "bg-white/10 border-transparent" : "border-transparent hover:bg-white/5"
                  }`}
              >
                <Icon className="h-4 w-4 text-white/70 group-hover:text-white" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-4">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center gap-3 rounded-full border border-transparent px-3 py-2 text-sm transition-colors hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiLogOut className="h-4 w-4 text-white/70" />
            {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden border-b border-white/10 bg-[#0c0c0c]/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-base font-semibold">Panel</span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:border-white/60 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSigningOut ? "Cerrando..." : "Salir"}
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 pb-3">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-1 items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${active ? "bg-white/10 border-transparent" : "border-white/10"
                    }`}
                >
                  <Icon className="h-4 w-4 text-white/70" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        <main className="flex-1 min-w-0 px-4 py-6 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
