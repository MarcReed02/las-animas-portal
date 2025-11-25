import { redirect } from "next/navigation";

import { InfoIcon } from "lucide-react";

import { formatRut } from "@/lib/rut";
import { createClient } from "@/lib/supabase/server";

type Solicitud = {
  id: string;
  nombres: string | null;
  apellidos: string | null;
  rut: string;
  correo: string;
  telefono: string | null;
  documento_url: string | null;
  estado: string;
  fecha_solicitud: string | null;
  created_at: string | null;
};

export const dynamic = "force-dynamic";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const [{ data: claimsData, error: claimsError }, { data: userData, error: userError }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.auth.getUser(),
  ]);

  if (userError || !userData?.user) {
    redirect("/auth/login");
  }

  const currentUser = userData.user;

  const { data: solicitudes, error: solicitudesError } = await supabase
    .from("solicitudes_registro")
    .select("id,nombres,apellidos,rut,correo,telefono,documento_url,estado,fecha_solicitud,created_at")
    .order("fecha_solicitud", { ascending: false });

  const fmtDate = (value?: string | null) => {
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "N/A";
    const date = `${String(parsed.getDate()).padStart(2, "0")}/${String(parsed.getMonth() + 1).padStart(2, "0")}/${String(
      parsed.getFullYear(),
    ).slice(-2)}`;
    const time = parsed.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
    return `${date} - ${time}`;
  };

  const fmtRut = (value?: string | null) => {
    if (!value) return "N/A";
    return formatRut(value);
  };

  const buildFullName = (nombres?: string | null, apellidos?: string | null) => {
    const first = (nombres ?? "").trim();
    const last = (apellidos ?? "").trim();
    const combined = [first, last].filter(Boolean).join(" ").trim();
    return combined || first || last || "Sin nombre";
  };

  const displayName =
    buildFullName(
      (currentUser.user_metadata?.nombres as string | undefined) ||
        (currentUser.user_metadata?.nombre as string | undefined) ||
        (currentUser.user_metadata?.full_name as string | undefined) ||
        undefined,
      (currentUser.user_metadata?.apellidos as string | undefined) || undefined,
    ) || currentUser.email?.split("@")[0] || "Usuario";

  const solicitudesList = solicitudes ?? [];
  const resumen = solicitudesList.reduce(
    (acc, item) => {
      if (item.estado === "pendiente") acc.pendientes += 1;
      if (item.estado === "aprobado") acc.aprobadas += 1;
      if (item.estado === "rechazado") acc.rechazadas += 1;
      return acc;
    },
    { pendientes: 0, aprobadas: 0, rechazadas: 0 },
  );
  const total = solicitudesList.length;

  const nextSteps = [
    "Completar informacion de tu perfil",
    "Subir la imagen principal de tu anuncio",
    "Crear tu primer anuncio",
    "Revisar el estado de tus solicitudes",
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#101010] via-[#0b0b0b] to-[#050505] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/60">Hola, {displayName}</p>
            <h1 className="mt-1 text-3xl font-bold">Este es tu panel en Las Animas</h1>
            <p className="mt-2 text-sm text-white/60">Revisa el estado de tus solicitudes y mantiene tu perfil al dia.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-[#c21e1e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#961111]"
          >
            + Crear anuncio
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/60">Pendientes</p>
            <p className="mt-2 text-3xl font-semibold">{resumen.pendientes}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/60">Aprobadas</p>
            <p className="mt-2 text-3xl font-semibold">{resumen.aprobadas}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/60">Rechazadas</p>
            <p className="mt-2 text-3xl font-semibold">{resumen.rechazadas}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/60">Total</p>
            <p className="mt-2 text-3xl font-semibold">{total}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-[#111111] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Solicitudes de registro</h2>
              <p className="text-sm text-white/60">Ultimas solicitudes almacenadas en Supabase.</p>
            </div>
            <span className="text-sm text-white/60">Total: {total}</span>
          </div>

          {solicitudesError && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              Error al cargar solicitudes: {solicitudesError.message}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-white/5">
            <table className="min-w-full text-sm">
              <thead className="bg-black/60 text-white/60">
                <tr>
                  <th className="px-4 py-3 text-left font-normal">Fecha</th>
                  <th className="px-4 py-3 text-left font-normal">Nombre</th>
                  <th className="px-4 py-3 text-left font-normal">RUT</th>
                  <th className="px-4 py-3 text-left font-normal">Correo</th>
                  <th className="px-4 py-3 text-left font-normal">Telefono</th>
                  <th className="px-4 py-3 text-left font-normal">Estado</th>
                  <th className="px-4 py-3 text-left font-normal">Documento</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesList.map((solicitud) => (
                  <tr key={solicitud.id} className="border-t border-white/5 text-white/80 hover:bg-white/5">
                    <td className="px-4 py-2">{fmtDate(solicitud.fecha_solicitud ?? solicitud.created_at)}</td>
                    <td className="px-4 py-2 font-medium text-white">{buildFullName(solicitud.nombres, solicitud.apellidos)}</td>
                    <td className="px-4 py-2">{fmtRut(solicitud.rut)}</td>
                    <td className="px-4 py-2">{solicitud.correo}</td>
                    <td className="px-4 py-2">{solicitud.telefono ?? "N/A"}</td>
                    <td className="px-4 py-2 capitalize">
                      <span className="rounded-full border border-white/20 px-3 py-1 text-xs">{solicitud.estado || "Pendiente"}</span>
                    </td>
                    <td className="px-4 py-2">
                      {solicitud.documento_url ? (
                        <a href={solicitud.documento_url} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">
                          Ver
                        </a>
                      ) : (
                        <span className="text-white/50">Sin documento</span>
                      )}
                    </td>
                  </tr>
                ))}

                {!solicitudesError && total === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-white/60">
                      Aun no hay solicitudes registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#111111] p-5">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <InfoIcon size={16} strokeWidth={2} />
              Tu sesion esta activa
            </div>
            <pre className="mt-4 max-h-48 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/70">
              {JSON.stringify(claimsData?.claims ?? claimsError, null, 2)}
            </pre>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#111111] p-5">
            <h3 className="text-lg font-semibold">Proximos pasos</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              {nextSteps.map((step) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white/40" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
