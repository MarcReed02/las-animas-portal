"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiLayout, FiCheckSquare, FiFileText, FiUsers, FiSettings } from "react-icons/fi";

const nav = [
  { href: "/admin", label: "Solicitudes", icon: FiCheckSquare },
  { href: "/admin/noticias", label: "Noticias", icon: FiFileText },
  { href: "/admin/usuarios", label: "Usuarios", icon: FiUsers },
  { href: "/admin/ajustes", label: "Ajustes", icon: FiSettings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
                className={`group flex items-center gap-3 px-3 py-2 rounded-md transition-colors border ${
                  active
                    ? "bg-white/10 border-white/10"
                    : "border-transparent hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4 text-white/70 group-hover:text-white" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="h-6" />
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
