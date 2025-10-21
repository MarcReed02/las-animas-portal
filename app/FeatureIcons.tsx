'use client'

import React, { useRef } from "react";
import Link from "next/link";
import {
  FiShield,
  FiUser,
  FiActivity,
  FiTruck,
  FiMap,
  FiShoppingBag,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

type Shortcut = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const shortcuts: Shortcut[] = [
  { label: "Seguridad", href: "/seguridad", icon: FiShield },
  { label: "Adulto Mayor", href: "/adulto-mayor", icon: FiUser },
  { label: "Recreación", href: "/recreacion", icon: FiActivity },
  { label: "Transporte", href: "/transporte", icon: FiTruck },
  { label: "Espacios Públicos", href: "/espacios-publicos", icon: FiMap },
  { label: "Comercios", href: "/comercios-adheridos", icon: FiShoppingBag },
];

export default function FeatureIcons() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (delta: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="w-full md:px-8 py-8">
      <div className="w-full px-0 py-0">
        <div className="relative bg-[#AC2734] min-h-[150px] flex items-center rounded-[10px] overflow-hidden mx-4 md:mx-8 shadow-lg ">
          {/* Botón izquierda */}
          <button
            type="button"
            aria-label="Desplazar a la izquierda"
            onClick={() => scrollBy(-280)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/95 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            <FiChevronLeft className="h-7 w-7" />
          </button>

          {/* Ítems */}
          <div className="w-full overflow-x-auto scrollbar-thin" ref={scrollRef}>
            <div className="mx-12 flex items-stretch justify-between gap-8">
              {shortcuts.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="shrink-0 flex flex-col items-center justify-center px-2 py-4 text-center"
                >
                  <Icon className="h-9 w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white mb-2" />
                  <span className="text-white text-xs md:text-sm font-semibold uppercase tracking-wide">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Botón derecha */}
          <button
            type="button"
            aria-label="Desplazar a la derecha"
            onClick={() => scrollBy(280)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/95 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            <FiChevronRight className="h-7 w-7" />
          </button>
        </div>
      </div>
    </section>
  );
}
