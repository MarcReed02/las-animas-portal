import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const user = data.user;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
        <h1 className="text-3xl font-semibold">Mi perfil</h1>
        <p className="mt-2 text-sm text-white/60">Revisa y actualiza la informacion asociada a tu cuenta.</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 space-y-4 text-sm">
        <div>
          <p className="text-white/50">Correo</p>
          <p className="text-lg font-medium text-white">{user.email}</p>
        </div>
        <div>
          <p className="text-white/50">Nombre</p>
          <p className="text-lg font-medium text-white">
            {(user.user_metadata?.nombre as string | undefined) ||
              (user.user_metadata?.full_name as string | undefined) ||
              "Sin definir"}
          </p>
        </div>
        <div>
          <p className="text-white/50">Telefono</p>
          <p className="text-lg font-medium text-white">
            {(user.user_metadata?.telefono as string | undefined) || "Agrega un numero de contacto"}
          </p>
        </div>
      </div>
    </div>
  );
}
