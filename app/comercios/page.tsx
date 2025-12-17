import React, { Suspense } from "react";
import ComerciosClient from "@/components/comercios-client";
import NavbarNew from "@/components/navbar-new";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

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

  // Fetch listings
  const { data, error } = await adminClient
    .from("anuncio_solicitudes")
    .select(
      "id,titulo,descripcion,categoria_principal,subcategoria,direccion,horario,mostrar_telefono,telefono_snapshot,instagram,facebook,whatsapp,tiktok,contacto_twitter,contacto_web,anuncio_solicitud_imagenes(url,orden)",
    )
    .eq("estado", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[ComerciosPage] Error fetching listings:", JSON.stringify(error, null, 2));
  }

  const listings = (data as any[] | null) || [];

  // Fetch categories
  const { data: categoriesData } = await adminClient
    .from("categorias")
    .select("id, nombre, parent_id")
    .order("orden");

  const categoryGroups: { name: string; subs: string[] }[] = [];

  if (categoriesData) {
    const parentMap = new Map<string, { name: string; subs: string[] }>();

    // First pass: Create groups for parents
    categoriesData.forEach((cat: any) => {
      if (!cat.parent_id) {
        const group = { name: cat.nombre, subs: [] };
        categoryGroups.push(group);
        parentMap.set(cat.id, group);
      }
    });

    // Second pass: Add children to parents
    categoriesData.forEach((cat: any) => {
      if (cat.parent_id) {
        const parent = parentMap.get(cat.parent_id);
        if (parent) {
          parent.subs.push(cat.nombre);
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#171717] pt-20">
      <NavbarNew />
      <Suspense fallback={<div>Cargando comercios...</div>}>
        <ComerciosClient listings={listings} categoryGroups={categoryGroups} />
      </Suspense>
    </div>
  );
}
