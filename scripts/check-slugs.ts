import { createClient } from "@supabase/supabase-js";
import { slugify } from "../lib/utils";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceKey);

async function main() {
  const { data: businesses, error } = await adminClient
    .from("anuncio_solicitudes")
    .select("id, titulo, estado")
    .eq("estado", "approved");

  if (error) {
    console.error("Error fetching:", error);
    return;
  }

  console.log(`Found ${businesses.length} approved businesses:`);
  businesses.forEach(b => {
    const s = slugify(b.titulo);
    console.log(`"${b.titulo}" -> "${s}" (ID: ${b.id})`);
  });
}

main();
