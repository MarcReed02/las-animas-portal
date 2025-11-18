import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const dummyImages = [
  { id: 1, label: "Imagen principal" },
  { id: 2, label: "Imagen extra" },
  { id: 3, label: "Imagen extra" },
  { id: 4, label: "Imagen extra" },
];

export default async function MisAnunciosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/40">Panel / Mis anuncios / Crear anuncio</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Crear anuncio</h1>
          <p className="mt-2 text-sm text-white/60">Completa la informacion para publicar tu anuncio en el portal de Las Animas.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80 transition hover:border-white/60"
          >
            Guardar borrador
          </button>
          <button
            type="button"
            className="rounded-full bg-[#c21e1e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#961111]"
          >
            Enviar a revision
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,1.2fr)]">
        <form className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-[#0f0f0f] p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Informacion basica</h2>
              <p className="text-sm text-white/50">Define el nombre y la categoria de tu anuncio.</p>
            </div>
            <div className="space-y-3">
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Titulo del anuncio
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white/80">
                  <input
                    type="text"
                    placeholder="Ej: Promocion 2x1 en pizzas este fin de semana"
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                  />
                  <span className="text-xs text-white/40">0/80</span>
                </div>
              </label>
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Categoria
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white/80">
                  <input
                    type="text"
                    placeholder="Selecciona una categoria"
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                  />
                  <span className="text-xs text-white/40">0/50</span>
                </div>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#0f0f0f] p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Descripcion y detalles</h2>
              <p className="text-sm text-white/50">Describe tu oferta con claridad y menciona condiciones importantes.</p>
            </div>
            <div className="space-y-3">
              <label className="flex flex-col gap-2 text-sm text-white/70">
                Descripcion
                <div className="rounded-3xl border border-white/15 bg-black/20 px-4 py-3">
                  <textarea
                    rows={4}
                    placeholder="Describe que ofreces, a quien va dirigido, condicionantes y fechas."
                    className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                  />
                </div>
                <span className="text-right text-xs text-white/40">0/500</span>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#0f0f0f] p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Imagenes</h2>
              <p className="text-sm text-white/50">Carga imagenes llamativas para mostrar tu anuncio.</p>
            </div>
            <div className="rounded-3xl border border-dashed border-white/20 bg-black/30 p-6 text-center text-sm text-white/60">
              <p>Arrastra imagenes aqui o haz click para subir</p>
              <button type="button" className="mt-3 rounded-full border border-white/25 px-4 py-1.5 text-xs text-white/80">
                Subir archivo
              </button>
              <p className="mt-3 text-xs text-white/40">Formato recomendado: JPG o PNG de al menos 1280px de ancho.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {dummyImages.map((image) => (
                <div
                  key={image.id}
                  className="relative flex h-20 w-28 items-center justify-center rounded-2xl border border-white/10 bg-cover bg-center text-[11px] text-white/70"
                  style={{ backgroundImage: "linear-gradient(135deg,#262626,#111111)" }}
                >
                  {image.label}
                  <button
                    type="button"
                    className="absolute -right-2 -top-2 rounded-full bg-[#c21e1e] px-2 text-xs text-white shadow-lg"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#0f0f0f] p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Ubicacion y fechas</h2>
              <p className="text-sm text-white/50">Entrega informacion para que los usuarios te encuentren facilmente.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/70">
                Comuna o sector
                <div className="mt-2 rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white/70">
                  <select className="w-full bg-transparent text-sm focus:outline-none">
                    <option value="">Selecciona opcion</option>
                    <option value="las-animas">Las Animas</option>
                    <option value="santa-rosa">Santa Rosa</option>
                  </select>
                </div>
              </label>
              <label className="text-sm text-white/70">
                Fecha de termino
                <div className="mt-2 rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white/70">
                  <input type="date" className="w-full bg-transparent text-sm focus:outline-none" />
                </div>
              </label>
            </div>
            <label className="text-sm text-white/70">
              Direccion
              <div className="mt-2 rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white/80">
                <input type="text" placeholder="Ingresa direccion exacta (opcional)" className="w-full bg-transparent text-sm focus:outline-none" />
              </div>
            </label>
            <div className="flex flex-wrap gap-4 text-sm text-white/60">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-white/30 bg-transparent" /> Mostrar direccion exacta en el anuncio
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-white/30 bg-transparent" /> Sin fecha al tiempo
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#0f0f0f] p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Datos adicionales visibles</h2>
              <p className="text-sm text-white/50">Selecciona la informacion que quieres mostrar junto al anuncio.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Mostrar correo de contacto",
                "Mostrar telefono",
                "Intrucciones especiales",
                "Mostrar enlace externo",
                "Mostrar nombre de contacto",
                "Mostrar telefono alterno",
                "Mostrar enlace de anuncio",
              ].map((label) => (
                <label key={label} className="flex items-center gap-2 text-sm text-white/70">
                  <input type="checkbox" className="h-4 w-4 rounded border-white/30 bg-transparent" />
                  {label}
                </label>
              ))}
            </div>
          </section>
        </form>

        <aside className="space-y-4 rounded-3xl border border-white/10 bg-[#0f0f0f] p-6">
          <h3 className="text-lg font-semibold text-white">Vista previa</h3>
          <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
            <div className="h-40 rounded-2xl bg-[#1b1b1b]" />
            <div className="mt-4 space-y-2">
              <span className="inline-flex rounded-full bg-green-900/40 px-3 py-1 text-xs text-green-200">Categoria</span>
              <h4 className="text-xl font-semibold text-white">Titulo del anuncio</h4>
              <p className="text-sm text-white/60">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Describe brevemente tu propuesta para captar atencion.
              </p>
            </div>
            <div className="mt-4 space-y-2 text-sm text-white/70">
              <div className="flex items-center justify-between">
                <span>Las Animas</span>
                <span>Del 20 al 22 mayo</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2">
                <span>Desde</span>
                <span className="text-lg font-semibold">$12.000</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-xs text-yellow-100">
            Los anuncios enviados a revision seran validados por un administrador antes de publicarse.
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="flex-1 rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-white/60">
              Cancelar
            </button>
            <button type="button" className="flex-1 rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-white/60">
              Guardar borrador
            </button>
            <button type="button" className="flex-1 rounded-full bg-[#c21e1e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#961111]">
              Enviar a revision
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
