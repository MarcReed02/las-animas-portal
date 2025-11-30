import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (authError || !auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    id,
    titulo,
    descripcion,
    categoria_principal,
    subcategoria,
    horario,
    direccion,
    telefono_snapshot,
    contacto_whatsapp,
    contacto_web,
    contacto_instagram,
    contacto_facebook,
    contacto_tiktok,
    contacto_twitter,
    imagenes,
  } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  console.log("[API Update] Received update request for ID:", id);
  console.log("[API Update] Auth user:", auth.user.id);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[API Update] Missing env vars");
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const adminClient = createAdminClient(supabaseUrl, serviceKey);

  // 1. Verify ownership and update main table
  // We use adminClient to bypass RLS for the update, but we MUST verify user_id manually
  const { data: existing, error: fetchError } = await adminClient
    .from("anuncio_solicitudes")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    console.error("[API Update] Fetch error or not found:", fetchError);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.user_id !== auth.user.id) {
    console.error("[API Update] Forbidden. Owner:", existing.user_id, "Requestor:", auth.user.id);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = {
    titulo,
    descripcion,
    categoria_principal,
    subcategoria,
    horario,
    direccion,
    telefono_snapshot,
    whatsapp: contacto_whatsapp,
    contacto_web,
    instagram: contacto_instagram,
    facebook: contacto_facebook,
    tiktok: contacto_tiktok,
    contacto_twitter,
    // We don't update 'estado' here, it remains as is
  };

  const { error: updateError } = await adminClient
    .from("anuncio_solicitudes")
    .update(payload)
    .eq("id", id);

  if (updateError) {
    console.error("[API Update] Update error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // 2. Update images
  if (Array.isArray(imagenes)) {
    // Delete existing images
    const { error: deleteError } = await adminClient
      .from("anuncio_solicitud_imagenes")
      .delete()
      .eq("solicitud_id", id);

    if (deleteError) {
      console.error("Error deleting old images", deleteError);
      // Continue anyway to try inserting new ones? Or fail? 
      // Let's continue but log it.
    }

    // Insert new images
    if (imagenes.length > 0) {
      const imagesToInsert = imagenes.map((img: any, index: number) => ({
        solicitud_id: id,
        url: img.url,
        orden: typeof img.orden === "number" ? img.orden : index,
      }));

      const { error: insertError } = await adminClient
        .from("anuncio_solicitud_imagenes")
        .insert(imagesToInsert);

      if (insertError) {
        console.error("Error inserting new images", insertError);
        return NextResponse.json({ error: "Error updating images" }, { status: 500 });
      }
    }
  }

  console.log("[API Update] Success");
  return NextResponse.json({ success: true });
}
