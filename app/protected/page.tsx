import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import BusinessRegistrationWorkspace from "@/components/business-registration-workspace";

export const dynamic = "force-dynamic";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: userData, error } = await supabase.auth.getUser();

  if (error || !userData.user) {
    redirect("/auth/login");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const adminClient = createAdminClient(supabaseUrl, serviceKey);

  // Check if user has an approved business
  const { data: existingBusiness } = await adminClient
    .from("anuncio_solicitudes")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("estado", "approved")
    .single();

  if (existingBusiness) {
    redirect("/dashboard");
  }

  // Fetch categories logic (replicated from app/comercios/page.tsx)
  let categoryGroups: { name: string; subs: string[] }[] = [];

  const { data: categoriesData } = await adminClient
    .from("categorias")
    .select("id, nombre, parent_id")
    .order("orden");

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
    <BusinessRegistrationWorkspace user={userData.user} categoryGroups={categoryGroups} />
  );
}

