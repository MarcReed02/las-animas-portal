import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const adminClient = createAdminClient(supabaseUrl, serviceKey);
  const { data, error } = await adminClient
    .from("anuncio_solicitudes")
    .select(
      "id,user_id,titulo,descripcion,categoria_principal,subcategoria,horario,direccion,mostrar_telefono,telefono_snapshot,estado,created_at,updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const userIds = Array.from(new Set((data || []).map((d) => d.user_id).filter(Boolean))) as string[];
  let usuariosMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: usuarios } = await adminClient
      .from("usuarios")
      .select("id,nombres,apellidos")
      .in("id", userIds);
    if (usuarios) {
      usuariosMap = usuarios.reduce((acc: Record<string, string>, u: any) => {
        const nombres = (u.nombres || "").trim();
        const apellidos = (u.apellidos || "").trim();
        const full = [nombres, apellidos].filter(Boolean).join(" ").trim();
        acc[u.id] = full || nombres || apellidos || u.id;
        return acc;
      }, {});
    }
  }

  const enriched = (data || []).map((item) => ({
    ...item,
    usuario_nombre: item.user_id ? usuariosMap[item.user_id] || item.user_id : null,
  }));

  return NextResponse.json({ data: enriched });
}
