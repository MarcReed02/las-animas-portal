import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get("path");
    const bucketParam = request.nextUrl.searchParams.get("bucket")?.trim();
    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    const serverClient = await createServerClient();
    const { data: userData } = await serverClient.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: perfil, error: perfilErr } = await serverClient.from("usuarios").select("rol").eq("id", uid).single();
    if (perfilErr || perfil?.rol !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const bucket = bucketParam || process.env.NEXT_PUBLIC_SUPABASE_DOCUMENTS_BUCKET || "documentos";
    const supabase =
      serviceKey && serviceKey.length > 0 ? createAdminClient(supabaseUrl, serviceKey) : serverClient;

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 5);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ signedUrl: data?.signedUrl ?? null });
  } catch (error: any) {
    console.error("[documents/sign] unexpected error", error);
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}
