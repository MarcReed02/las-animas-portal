'use client'

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  FiShield,
  FiUser,
  FiActivity,
  FiTruck,
  FiMap,
  FiShoppingBag,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import bannerImg from "@/app/assets/images/SDG_website_banner_S_100px.png";

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
  { label: "Comercios Adheridos", href: "/comercios-adheridos", icon: FiShoppingBag },
];

export default function FeatureIcons() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (delta: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="w-full">
      <div className="w-full px-0 py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
          {/* Izquierda: barra de accesos directos (estilo banda con degradado) */}
          <div className="lg:col-span-8 relative">
            <div className="relative bg-gradient-to-r from-[#F24E6F] to-[#D12B7D] min-h-[90px] flex items-center">
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
                      <Icon className="h-9 w-9 md:h-10 md:w-10 text-white mb-2" />
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

          {/* Derecha: tarjeta con imagen y fondo blanco */}
          <div className="lg:col-span-4">
            <div className="h-full bg-white flex items-center justify-center px-4">
              <Image
                src={bannerImg}
                alt="Objetivos de Desarrollo Sostenible"
                className="w-auto h-16 md:h-20 lg:h-24 object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
