import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import BusinessDetailView from "@/components/business-detail-view";
import { slugify } from "@/lib/utils";

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return <div>Error: Supabase configuration missing</div>;
  }

  const adminClient = createAdminClient(supabaseUrl, serviceKey);

  // 1. Fetch all approved businesses (lightweight) to find the ID
  const { data: allBusinesses } = await adminClient
    .from("anuncio_solicitudes")
    .select("id, titulo")
    .eq("estado", "approved");

  console.log("DEBUG: Requested slug:", slug);
  console.log("DEBUG: Total businesses fetched:", allBusinesses?.length);

  // 2. Find matching slug
  const matchedBusiness = allBusinesses?.find(b => {
    const s = slugify(b.titulo);
    console.log(`DEBUG: Checking "${b.titulo}" -> "${s}" vs "${slug}"`);
    return s === slug;
  });

  if (!matchedBusiness) {
    console.log("DEBUG: No matching business found for slug:", slug);
    notFound();
  }

  console.log("DEBUG: Found matching business:", matchedBusiness);

  // 3. Fetch full details using the found ID
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
    .eq("id", matchedBusiness.id)
    .single();

  if (error || !business) {
    console.error("Error fetching business:", error);
    notFound();
  }

  return <BusinessDetailView businessData={business} />;
}
