import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CategoryGroup = {
  name: string;
  subs: string[];
};

const STATIC_GROUPS: CategoryGroup[] = [
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

export async function GET() {
  // Devolvemos siempre el catálogo completo para que el usuario pueda filtrar aunque no haya anuncios creados aún.
  return NextResponse.json({ data: STATIC_GROUPS });
}
