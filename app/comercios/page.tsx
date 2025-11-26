import ComerciosClient from "@/components/comercios-client";
import Navbar from "@/components/navbar";
import { createClient as createAdminClient } from "@supabase/supabase-js";

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
};

const STATIC_CATEGORY_GROUPS = [
  { name: "Restaurantes y Gastronomía", subs: ["Restaurantes", "Comida rápida", "Pizzerías", "Comida casera", "Pastelerías"] },
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

export default async function ComerciosPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-white">
        <h1 className="text-3xl font-semibold mb-2">Comercios</h1>
        <p className="text-white/70">Configuracion de Supabase incompleta.</p>
      </div>
    );
  }

  const adminClient = createAdminClient(supabaseUrl, serviceKey);
  const { data } = await adminClient
    .from("anuncio_solicitudes")
    .select(
      "id,titulo,descripcion,categoria_principal,subcategoria,direccion,horario,mostrar_telefono,telefono_snapshot,instagram,facebook,whatsapp,tiktok,anuncio_solicitud_imagenes(url,orden)",
    )
    .eq("estado", "approved")
    .order("created_at", { ascending: false });

  const listings = (data as any[] | null) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0b] via-[#0b0b0b] to-[#050505] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50">Explora</p>
            <h1 className="text-3xl font-semibold">Comercios y anuncios</h1>
          </div>
        </div>
        <ComerciosClient listings={listings} categoryGroups={STATIC_CATEGORY_GROUPS} />
      </div>
    </div>
  );
}
