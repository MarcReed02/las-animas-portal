"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { PiUserCircleFill } from "react-icons/pi";

const getFirstToken = (value?: unknown) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0] ?? "";
};

const getShortDisplayName = (user: User | null) => {
  if (!user) return "Usuario";
  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const fullName = (metadata.nombre as string | undefined) ?? (metadata.full_name as string | undefined) ?? "";
  const rawFirstNames =
    (metadata.nombres as string | undefined) ??
    (metadata.first_name as string | undefined) ??
    (metadata.nombre as string | undefined) ??
    "";
  const rawLastNames =
    (metadata.apellidos as string | undefined) ??
    (metadata.apellido as string | undefined) ??
    (metadata.last_name as string | undefined) ??
    "";

  let firstName = getFirstToken(rawFirstNames);
  let lastName = getFirstToken(rawLastNames);

  if (!firstName && fullName) {
    firstName = getFirstToken(fullName);
  }

  if (!lastName) {
    const trimmedFull = fullName.trim();
    const fullTokens = trimmedFull ? trimmedFull.split(/\s+/).filter(Boolean) : [];
    const firstNamesTokensRaw =
      typeof rawFirstNames === "string" && rawFirstNames.trim().length > 0
        ? rawFirstNames.trim().split(/\s+/).filter(Boolean)
        : [];
    const assumedFirstTokensCount = firstNamesTokensRaw.length || (firstName ? 1 : 0);

    if (fullTokens.length > assumedFirstTokensCount) {
      const remainderTokens = fullTokens.slice(assumedFirstTokensCount);
      if (remainderTokens.length) {
        lastName = remainderTokens[0];
      }
    }

    if (!lastName && fullTokens.length > 1) {
      lastName = fullTokens[1];
    }
  }

  const combined = [firstName, lastName].filter(Boolean).join(" ").trim();
  return combined || user.email?.split("@")[0] || "Usuario";
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setCurrentUser(data.user ?? null);
      setCheckingSession(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!showMenu) return;
    const handleOutside = (event: MouseEvent) => {
      if (!userMenuRef.current) return;
      if (userMenuRef.current.contains(event.target as Node)) return;
      setShowMenu(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [showMenu]);

  const nav = [
    { name: "Comercios", href: "/comercios" },
    { name: "Contacto", href: "/contacto" },
    { name: "Nosotros", href: "/nosotros" },
  ];

  const navBg = "bg-[#0B0B0B]/95 text-white";
  const navLink = "text-sm text-white/90 hover:text-white transition-colors";
  const loginBtn =
    "text-sm px-3 py-1.5 rounded-full border border-white/30 hover:border-white/60 hover:text-white transition-colors";
  const signupBtn = "text-sm px-3 py-1.5 rounded-full bg-[#c21e1e] text-white hover:bg-[#961111] transition-colors";
  const menuButton =
    "inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 hover:bg-white/10 focus:ring-white/50";

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setIsOpen(false);
    } catch (error) {
      console.error("[navbar] error al cerrar sesión", error);
    }
  };

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const shortDisplayName = useMemo(() => getShortDisplayName(currentUser), [currentUser]);

  const userAvatar = currentUser ? (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 transition"
      >
        <PiUserCircleFill className="h-6 w-6 text-white" />
        <span className="hidden md:block font-semibold">{shortDisplayName}</span>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 z-[70] mt-2 w-56 rounded-2xl border border-white/15 bg-[#0B0B0B] p-3 text-sm text-white shadow-2xl">
            <div className="mb-3 flex items-center gap-3 border-b border-white/10 pb-3">
              <PiUserCircleFill className="h-6 w-6 text-white" />
              <div className="flex flex-col text-xs text-white/70">
                <span className="text-sm font-semibold text-white">{shortDisplayName}</span>
                <span className="uppercase text-white/50">Sesión activa</span>
              </div>
            </div>
            <Link
              href="/protected/anuncios"
              className="mb-2 block rounded-full border border-white/20 px-3 py-2 text-center text-white/90 hover:border-white/60 hover:bg-white/5"
              onClick={() => setShowMenu(false)}
            >
              Mis anuncios
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setShowMenu(false);
              }}
              className="w-full rounded-full border border-white/25 px-3 py-2 text-white/90 hover:border-white/60"
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link href="/auth/login/ingresar" className={loginBtn}>
        Iniciar sesión
      </Link>
      <Link href="/auth/login" className={signupBtn}>
        Registrarse
      </Link>
    </div>
  );

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur transition-colors ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="text-xl font-extrabold tracking-wide text-white"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault()
                setIsOpen(false)
                try {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                } catch {
                  window.scrollTo(0, 0)
                }
              }
            }}
          >
            ANIMAS
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {nav.map((item) => (
              <Link key={item.name} href={item.href} className={navLink}>
                {item.name}
              </Link>
            ))}
            {!checkingSession && userAvatar}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setIsOpen(!isOpen)} className={menuButton}>
              <span className="sr-only">Abrir menu principal</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0B0B]">
          <div className="px-4 py-3 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-2 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {!checkingSession ? (
              currentUser ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-white/15 px-3 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-base font-semibold uppercase text-white">
                    {shortDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-sm text-white/80">
                    <span className="font-semibold">Sesión iniciada</span>
                    <span className="text-white/60">{shortDisplayName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-white/25 px-3 py-2 text-sm text-white/90 hover:border-white/60"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login/ingresar"
                    className="block px-2 py-2 rounded-full border border-white/20 text-white/90 hover:text-white hover:bg-white/10"
                    onClick={() => setIsOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/auth/login"
                    className="block px-2 py-2 rounded-full bg-[#c21e1e] text-white hover:bg-[#961111]"
                    onClick={() => setIsOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )
            ) : null}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

