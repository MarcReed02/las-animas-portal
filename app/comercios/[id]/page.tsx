import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import BusinessDetailView from "@/components/business-detail-view";

export default async function BusinessPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return <div>Error: Supabase configuration missing</div>;
  }

  const adminClient = createAdminClient(supabaseUrl, serviceKey);

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
    .eq("id", id)
    .eq("estado", "approved")
    .single();

  if (error || !business) {
    console.error("Error fetching business:", error);
    notFound();
  }

  return <BusinessDetailView businessData={business} />;
}
