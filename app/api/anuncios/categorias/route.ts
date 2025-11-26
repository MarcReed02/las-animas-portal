import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type CategoryGroup = {
  name: string;
  subs: string[];
};

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const adminClient = createAdminClient(supabaseUrl, serviceKey);
  const { data, error } = await adminClient
    .from("anuncio_solicitudes")
    .select("categoria_principal, subcategoria");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const groupsMap = new Map<string, Set<string>>();
  (data || []).forEach((row: any) => {
    const cat = (row?.categoria_principal as string | null) || null;
    const sub = (row?.subcategoria as string | null) || null;
    if (!cat) return;
    if (!groupsMap.has(cat)) groupsMap.set(cat, new Set<string>());
    if (sub) groupsMap.get(cat)!.add(sub);
  });

  const groups: CategoryGroup[] = Array.from(groupsMap.entries()).map(([name, subs]) => ({
    name,
    subs: Array.from(subs.values()),
  }));

  return NextResponse.json({ data: groups });
}

