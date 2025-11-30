import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

type CreateBody = {
  titulo?: string;
  descripcion?: string;
  categoria_principal?: string;
  subcategoria?: string;
  horario?: string;
  direccion?: string;
  mostrar_telefono?: boolean;
  telefono?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  whatsapp?: string | null;
  tiktok?: string | null;
  website?: string | null;
  twitter?: string | null;
  imagenes?: { url: string; orden?: number }[];
};

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (authError || !auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as CreateBody;
  const {
    titulo,
    descripcion,
    categoria_principal,
    subcategoria,
    horario,
    direccion,
    mostrar_telefono,
    telefono,
    instagram,
    facebook,
    whatsapp,
    tiktok,
    website,
    twitter,
    imagenes,
  } = body;

  if (!titulo || !descripcion || !categoria_principal) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios: titulo, descripcion o categoria_principal." },
      { status: 400 },
    );
  }

  const payload = {
    user_id: auth.user.id,
    titulo,
    descripcion,
    categoria_principal,
    subcategoria: subcategoria || null,
    horario: horario || null,
    direccion: direccion || null,
    mostrar_telefono: Boolean(mostrar_telefono),
    telefono_snapshot: mostrar_telefono ? telefono || null : null,
    instagram: instagram || null,
    facebook: facebook || null,
    whatsapp: whatsapp || null,
    tiktok: tiktok || null,
    contacto_web: website || null,
    contacto_twitter: twitter || null,
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[api/anuncios/crear] faltan variables de entorno SUPABASE");
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const adminClient = createAdminClient(supabaseUrl, serviceKey);

  const { data: solicitud, error: insertError } = await adminClient
    .from("anuncio_solicitudes")
    .insert(payload)
    .select("id")
    .single();

  if (insertError || !solicitud?.id) {
    console.error("[api/anuncios/crear] error insertando solicitud", insertError);
    return NextResponse.json({ error: insertError?.message || "No se pudo crear la solicitud" }, { status: 400 });
  }

  if (Array.isArray(imagenes) && imagenes.length > 0) {
    const imagesToInsert = imagenes
      .filter((img) => img?.url)
      .map((img, index) => ({
        solicitud_id: solicitud.id,
        url: img.url,
        orden: typeof img.orden === "number" ? img.orden : index,
      }));

    if (imagesToInsert.length > 0) {
      const { error: imagesError } = await adminClient.from("anuncio_solicitud_imagenes").insert(imagesToInsert);
      if (imagesError) {
        console.error("[api/anuncios/crear] error insertando imagenes", imagesError);
        return NextResponse.json(
          { error: "Solicitud creada, pero las imagenes no pudieron guardarse." },
          { status: 207 },
        );
      }
    }
  }

  return NextResponse.json({ id: solicitud.id, estado: "pendiente" });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { id?: string; estado?: "approved" | "rejected" };
  if (!body?.id || !body.estado) {
    return NextResponse.json({ error: "Faltan id o estado" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const adminClient = createAdminClient(supabaseUrl, serviceKey);
  const { error } = await adminClient.from("anuncio_solicitudes").update({ estado: body.estado }).eq("id", body.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
