import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import BusinessDashboardClient from "@/components/business-dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const adminClient = createAdminClient(supabaseUrl, serviceKey);

  // Fetch user's business
  const { data: business, error } = await adminClient
    .from("anuncio_solicitudes")
    .select(`
      *,
      anuncio_solicitud_imagenes (
        id,
        url,
        orden
      )
    `)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  console.log("Dashboard Debug:", { userId: user.id, business, error });

  if (!business) {
    // If no business found, maybe redirect to registration or show a "Create Business" state
    // For now, let's redirect to the registration page if they don't have one
    redirect("/protected");
  }

  // Fetch categories logic
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

  return <BusinessDashboardClient initialData={business} user={user} categoryGroups={categoryGroups} />;
}
