"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { PiHeartBold, PiMapPin, PiPhoneCall, PiClock } from "react-icons/pi";
import { FiInstagram } from "react-icons/fi";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";

type Listing = {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria_principal: string | null;
  subcategoria: string | null;
  direccion: string | null;
  horario: string | null;
  mostrar_telefono: boolean | null;
  telefono_snapshot: string | null;
  instagram?: string | null;
  facebook?: string | null;
  whatsapp?: string | null;
  tiktok?: string | null;
  anuncio_solicitud_imagenes?: { url: string; orden: number | null }[];
};

function firstImage(listing: Listing) {
  if (listing.anuncio_solicitud_imagenes?.length) {
    const sorted = [...listing.anuncio_solicitud_imagenes].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    return sorted[0]?.url || null;
  }
  return null;
}

function Card({ listing }: { listing: Listing }) {
  const image = firstImage(listing);
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0c0c0c] shadow-2xl overflow-hidden text-white">
      <div className="relative h-44 w-full overflow-hidden">
        {image ? (
          <Image src={image} alt={listing.titulo} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/40">Sin imagen</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
        <button
          type="button"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/90 backdrop-blur"
        >
          <PiHeartBold />
        </button>
        <span className="absolute right-3 bottom-3 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold uppercase text-black">
          Abierto
        </span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {listing.categoria_principal && (
            <span className="inline-flex rounded-full bg-green-900/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-200">
              {listing.categoria_principal}
            </span>
          )}
          {listing.subcategoria && (
            <span className="inline-flex rounded-full bg-green-900/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-100">
              {listing.subcategoria}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold leading-tight text-white">{listing.titulo}</h3>
        {listing.descripcion && (
          <p className="text-sm text-white/65 line-clamp-2">{listing.descripcion}</p>
        )}
        <div className="mt-2 space-y-2 border-t border-white/10 pt-3 text-xs text-white/75">
          <div className="inline-flex items-center gap-2">
            <PiClock className="h-4 w-4" />
            <span className="italic">{listing.horario || "Horario por confirmar"}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <PiMapPin className="h-4 w-4" />
            <span>{listing.direccion || "Direccion no especificada"}</span>
          </div>
          {listing.mostrar_telefono && listing.telefono_snapshot && (
            <div className="inline-flex items-center gap-2">
              <PiPhoneCall className="h-4 w-4" /> {listing.telefono_snapshot}
            </div>
          )}
        </div>
        {(listing.instagram || listing.facebook || listing.whatsapp || listing.tiktok) && (
          <div className="pt-2">
            <p className="text-[11px] uppercase tracking-wide text-white/50">Social</p>
            <div className="mt-2 flex items-center gap-3 text-white/80">
              {listing.instagram && (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5">
                  <FiInstagram className="h-4 w-4" />
                </span>
              )}
              {listing.facebook && (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5">
                  <FaFacebookF className="h-4 w-4" />
                </span>
              )}
              {listing.whatsapp && (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5">
                  <FaWhatsapp className="h-4 w-4" />
                </span>
              )}
              {listing.tiktok && (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5">
                  <FaTiktok className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CATEGORY_GROUPS = [
  {
    name: "Restaurantes y Gastronomía",
    subs: ["Restaurantes", "Comida rápida", "Pizzerías", "Comida casera", "Pastelerías"],
  },
  { name: "Cafeterías y Panaderías", subs: ["Cafeterías", "Panaderías"] },
  { name: "Minimarkets y Almacenes", subs: ["Abarrotes", "Minimarkets", "Kioskos"] },
  { name: "Supermercados", subs: ["Supermercados"] },
  { name: "Ropa y Accesorios", subs: ["Tiendas de ropa", "Calzado", "Accesorios"] },
  { name: "Belleza y Cuidado Personal", subs: ["Peluquerías", "Barberías", "Manicure y Spa"] },
  { name: "Servicios Profesionales", subs: ["Servicios técnicos", "Servicios de reparación", "Profesionales independientes"] },
  { name: "Ferreterías y Materiales", subs: ["Ferreterías", "Materiales de construcción"] },
  { name: "Hogar y Electrodomésticos", subs: ["Electrodomésticos", "Electrónica", "Muebles y decoración"] },
  { name: "Librerías y Papelerías", subs: ["Librerías", "Papelerías"] },
  { name: "Salud y Bienestar", subs: ["Farmacias", "Ópticas", "Centros de salud"] },
  { name: "Turismo y Alojamiento", subs: ["Hospedajes", "Hostales", "Cabañas", "Servicios turísticos"] },
];

export default function ComerciosClient({ listings }: { listings: Listing[] }) {
  const [search, setSearch] = useState("");
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [activeSubs, setActiveSubs] = useState<string[]>([]);

  const categories = useMemo(() => CATEGORY_GROUPS.map((c) => c.name), []);
  const subcategories = useMemo(
    () => Array.from(new Set(CATEGORY_GROUPS.flatMap((c) => c.subs))),
    [],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return listings.filter((l) => {
      const matchesCat = activeCats.length === 0 || activeCats.includes(l.categoria_principal || "");
      const matchesSub = activeSubs.length === 0 || activeSubs.includes(l.subcategoria || "");
      const text = `${l.titulo} ${l.descripcion} ${l.categoria_principal} ${l.subcategoria}`.toLowerCase();
      const matchesSearch = term ? text.includes(term) : true;
      return matchesCat && matchesSub && matchesSearch;
    });
  }, [listings, search, activeCats, activeSubs]);

  const toggleCat = (cat: string) => {
    setActiveCats((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  const toggleSub = (sub: string) => {
    setActiveSubs((prev) => (prev.includes(sub) ? prev.filter((c) => c !== sub) : [...prev, sub]));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px,1fr]">
      <aside className="rounded-3xl border border-white/10 bg-[#0c0c0c] p-5 space-y-4">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-white">Categorias</p>
          <p className="text-sm text-white/60">Selecciona para filtrar</p>
        </div>
        <div className="space-y-4 text-sm text-white/80">
          {categories.length === 0 && <p className="text-white/50">Sin categorias</p>}
          {CATEGORY_GROUPS.map((group) => {
            const active = activeCats.includes(group.name);
            return (
              <div
                key={group.name}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 space-y-3 shadow-inner"
              >
                <label className="flex items-center gap-2 text-base font-semibold">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleCat(group.name)}
                    className="h-4 w-4 rounded border-white/30 bg-transparent"
                  />
                  <span className={active ? "text-white" : "text-white/80"}>{group.name}</span>
                </label>
                <div className="flex flex-wrap gap-2 pl-1">
                  {group.subs.map((sub) => {
                    const subActive = activeSubs.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSub(sub)}
                        className={`rounded-xl px-3 py-1 text-xs font-semibold ${
                          subActive
                            ? "bg-white/15 text-white border border-white/40"
                            : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <div className="space-y-6">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="¿Que estas buscando hoy?"
            className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white placeholder:text-white/50 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-white/70">
            No hay resultados con los filtros aplicados.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((listing) => (
              <Card key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
