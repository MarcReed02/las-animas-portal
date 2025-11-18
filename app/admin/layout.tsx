"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FiLayout, FiCheckSquare, FiFileText, FiUsers, FiSettings, FiLogOut } from "react-icons/fi";

import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/admin", label: "Solicitudes", icon: FiCheckSquare },
  { href: "/admin/noticias", label: "Noticias", icon: FiFileText },
  { href: "/admin/usuarios", label: "Usuarios", icon: FiUsers },
  { href: "/admin/ajustes", label: "Ajustes", icon: FiSettings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
        return;
      }
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Unexpected error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 hidden md:flex flex-col bg-[#111213] border-r border-white/10">
        <div className="h-16 flex items-center px-5 text-lg font-bold gap-2">
          <FiLayout className="h-5 w-5 text-white/70" />
          Dashboard
        </div>
        <nav className="flex-1 px-3 py-3 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2 rounded-full transition-colors border ${
                  active
                    ? "bg-white/10 border-transparent"
                    : "border-transparent hover:bg-white/5"
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
            className="group flex w-full items-center gap-3 px-3 py-2 rounded-full border border-transparent transition-colors hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiLogOut className="h-4 w-4 text-white/70 group-hover:text-white" />
            <span className="text-sm">{isSigningOut ? "Saliendo..." : "Salir"}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
