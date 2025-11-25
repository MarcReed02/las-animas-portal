import { redirect } from "next/navigation";

import AnnouncementForm from "@/components/announcement-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MisAnunciosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const userPhone =
    (data.user.user_metadata?.telefono as string | undefined) ||
    (data.user.user_metadata?.phone as string | undefined) ||
    null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/40">Panel / Mis anuncios / Crear anuncio</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Crear anuncio</h1>
          <p className="mt-2 text-sm text-white/60">Completa la informacion para publicar tu anuncio en el portal de Las Animas.</p>
        </div>
      </div>

      <AnnouncementForm userPhone={userPhone} />
    </div>
  );
}
