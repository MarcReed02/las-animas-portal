import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const emailParam = request.nextUrl.searchParams.get("email");
    if (!emailParam) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    const normalizedEmail = emailParam.trim().toLowerCase();
    const supabase = await createClient();

    const { data: solicitudes, error: solicitudesError } = await supabase
      .from("solicitudes_registro")
      .select("id, correo, estado, password_hash, created_at, fecha_solicitud")
      .eq("correo", normalizedEmail)
      .order("fecha_solicitud", { ascending: false });

    const { data: usuarios, error: usuariosError } = await supabase
      .from("usuarios")
      .select("id, correo, estado, rol, created_at")
      .eq("correo", normalizedEmail);

    console.log("[debug-login] estado para correo", {
      normalizedEmail,
      solicitudesCount: solicitudes?.length ?? 0,
      usuariosCount: usuarios?.length ?? 0,
      solicitudesError,
      usuariosError,
      hashes: (solicitudes || []).map((s) => ({
        id: s.id,
        estado: s.estado,
        hashLength: s.password_hash?.length ?? 0,
        hashPreview: s.password_hash ? s.password_hash.slice(0, 6) : null,
      })),
    });

    return NextResponse.json(
      {
        normalizedEmail,
        solicitudes,
        usuarios,
        solicitudesError,
        usuariosError,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[debug-login] fallo inesperado", error);
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}

