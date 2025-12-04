import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (authError || !auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const adminClient = createAdminClient(supabaseUrl, serviceKey);

  const { data: businessData, error } = await adminClient
    .from("anuncio_solicitudes")
    .select("estado, titulo")
    .eq("user_id", auth.user.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[api/user/business-status] error fetching business:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(businessData || { estado: null, titulo: null });
}
