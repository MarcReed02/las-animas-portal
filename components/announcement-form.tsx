"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import AnnouncementImageUploader, { UploadedImage } from "@/components/announcement-image-uploader";
import { FiInstagram } from "react-icons/fi";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

type CategoryGroup = { name: string; subs: string[] };

const socialFields = [
  { key: "instagram", label: "Instagram", placeholder: "@usuario", icon: FiInstagram },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/tu.pagina", icon: FaFacebookF },
  { key: "whatsapp", label: "Whatsapp", placeholder: "+56 9 1234 5678", icon: FaWhatsapp },
  { key: "tiktok", label: "TikTok", placeholder: "https://tusitio.cl", icon: FaTiktok },
] as const;

const previewFallbackDescription =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Describe brevemente tu propuesta para captar atencion.";
const STORAGE_BUCKET = "anuncios-imagenes";

export default function AnnouncementForm({ userPhone }: { userPhone?: string | null }) {
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [title, setTitle] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [comuna, setComuna] = useState("");
  const [schedule, setSchedule] = useState("");
  const [address, setAddress] = useState("");
  const [visibility, setVisibility] = useState({
    phone: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [socials, setSocials] = useState<Record<(typeof socialFields)[number]["key"], string>>({
    instagram: "",
    facebook: "",
    whatsapp: "",
    tiktok: "",
  });
  const [images, setImages] = useState<UploadedImage[]>([]);

  const selectedGroup = useMemo(
    () => categoryGroups.find((g) => g.name === mainCategory) || null,
    [mainCategory, categoryGroups],
  );
  const subCategoryOptions = selectedGroup?.subs || [];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/anuncios/categorias");
        const payload = await res.json().catch(() => null);
        if (res.ok && Array.isArray(payload?.data)) {
          setCategoryGroups(payload.data as CategoryGroup[]);
        }
      } catch (e) {
        console.warn("No se pudieron cargar las categorias", e);
      }
    };
    fetchCategories();
  }, []);

  const previewData = useMemo(() => {
    const mainLabel = selectedGroup?.name || "";
    const subLabel = subCategory || "";
    const categoryDisplay = subLabel || mainLabel || "Categoria";
    return {
      title: title.trim() || "Titulo del anuncio",
      category: categoryDisplay,
      categoryMain: mainLabel,
      categorySub: subLabel,
      description: description.trim() || previewFallbackDescription,
      comuna: comuna || "Comuna",
      schedule: schedule || "Horario por confirmar",
      address: address.trim() || "Direccion no especificada",
      socials: socialFields
        .map((field) => ({ ...field, value: socials[field.key].trim() }))
        .filter((item) => Boolean(item.value)),
      image: images[0]?.previewUrl || null,
    };
  }, [title, mainCategory, subCategory, description, comuna, schedule, address, socials, images, selectedGroup]);

  const toggleVisibility = (key: keyof typeof visibility) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSocialChange = (key: (typeof socialFields)[number]["key"], value: string) => {
    setSocials((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setSubmitMessage(null);
    setSubmitting(true);
    try {
      const supabase = createBrowserClient();
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id || "anon";

      const uploadedImages: { url: string; orden: number }[] = [];
      for (const [index, img] of images.entries()) {
        const ext = img.file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `${userId}/anuncios/${Date.now()}-${index}.${ext}`;
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, img.file);
        if (uploadError) {
          throw new Error(uploadError.message || "No se pudo subir las imagenes");
        }
        const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
        if (publicData?.publicUrl) {
          uploadedImages.push({ url: publicData.publicUrl, orden: index });
        }
      }

      const payload = {
        titulo: title.trim(),
        descripcion: description.trim(),
        categoria_principal: mainCategory,
        subcategoria: subCategory || null,
        horario: schedule.trim() || null,
        direccion: address.trim() || null,
        mostrar_telefono: visibility.phone,
        telefono: visibility.phone ? (userPhone || null) : null,
        instagram: socials.instagram.trim() || null,
        facebook: socials.facebook.trim() || null,
        whatsapp: socials.whatsapp.trim() || null,
        tiktok: socials.tiktok.trim() || null,
        imagenes: uploadedImages,
      };

      const response = await fetch("/api/anuncios/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "No se pudo crear el anuncio");
      }

      setSubmitMessage({ type: "success", text: "Solicitud enviada, queda pendiente de aprobacion." });
      setIsMainOpen(false);
      setIsSubOpen(false);
    } catch (error: any) {
      setSubmitMessage({
        type: "error",
        text: error?.message || "Ocurrio un error al enviar la solicitud.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,1.2fr)]">
      <form id="announcement-form" className="space-y-6" onSubmit={handleSubmit}>
        <section className="rounded-3xl border border-white/10 bg-[#0f0f0f] p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-white">Informacion basica</h2>
            <p className="text-base text-white/55">Define el nombre y la categoria de tu anuncio.</p>
          </div>
          <div className="space-y-5">
            <label className="flex flex-col gap-2 text-sm text-white/70">
              <span className="text-base font-semibold text-white">Titulo del anuncio</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/80">
                <input
                  type="text"
                  value={title}
                  minLength={10}
                  maxLength={70}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Promocion 2x1 en pizzas este fin de semana"
                  className="w-full bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
                />
                <span className="text-xs text-white/40">{title.length}/70</span>
              </div>
            </label>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-base font-semibold text-white">Categoria principal</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMainOpen((prev) => !prev)}
                    className={`flex w-full items-center justify-between rounded-2xl border border-white/15 px-4 py-3 text-left text-base font-semibold ${
                      mainCategory ? "bg-white/5 text-white" : "bg-white/5 text-white/40"
                    }`}
                  >
                    <span>{selectedGroup?.name || "Selecciona categoria"}</span>
                    <span className="text-lg text-white/70">›</span>
                  </button>
                  {isMainOpen && (
                    <div className="absolute z-20 mt-2 w-full rounded-2xl border border-white/20 bg-[#0d0d0d] shadow-2xl">
                      {categoryGroups.map((cat) => (
                        <button
                          type="button"
                          key={cat.name}
                          onClick={() => {
                            setMainCategory(cat.name);
                            setSubCategory("");
                            setIsMainOpen(false);
                            setIsSubOpen(false);
                          }}
                          className={`block w-full px-4 py-3 text-left text-base text-white/90 hover:bg-white/10 ${
                            mainCategory === cat.name ? "bg-white/10 font-semibold" : ""
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-base font-semibold text-white">Subcategoria</p>
                <div className="relative">
                  <button
                    type="button"
                    disabled={!selectedGroup}
                    onClick={() => selectedGroup && setIsSubOpen((prev) => !prev)}
                    className={`flex w-full items-center justify-between rounded-2xl border border-white/15 px-4 py-3 text-left text-base font-semibold ${
                      selectedGroup ? "bg-white/5 text-white" : "bg-white/5 text-white/40 cursor-not-allowed"
                    }`}
                  >
                    <span>
                      {subCategory || (selectedGroup ? "Selecciona subcategoria" : "Primero elige categoria")}
                    </span>
                    <span className="text-lg text-white/70">›</span>
                  </button>
                  {isSubOpen && selectedGroup && (
                    <div className="absolute z-20 mt-2 w-full rounded-2xl border border-white/20 bg-[#0d0d0d] shadow-2xl">
                      {subCategoryOptions.map((sub) => (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => {
                            setSubCategory(sub);
                            setIsSubOpen(false);
                          }}
                          className={`block w-full px-4 py-3 text-left text-base text-white/90 hover:bg-white/10 ${
                            subCategory === sub ? "bg-white/10 font-semibold" : ""
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                  value={description}
                  maxLength={400}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe que ofreces, a quien va dirigido, condicionantes y fechas."
                  className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                />
              </div>
              <span className="text-right text-xs text-white/40">
                {description.length}/400 (max 400)
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#0f0f0f] p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Imagenes</h2>
            <p className="text-sm text-white/50">Carga imagenes llamativas para mostrar tu anuncio.</p>
          </div>
          <AnnouncementImageUploader onChange={setImages} />
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#0f0f0f] p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Ubicacion y horario</h2>
            <p className="text-sm text-white/50">Entrega informacion para que los usuarios te encuentren y sepan cuando atiendes.</p>
          </div>
          <label className="text-sm text-white/70">
            Horario de atencion
            <div className="mt-2 rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white/70">
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Ej: Lunes a viernes 10:00 a 19:00 (max 120)"
                maxLength={120}
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            <span className="mt-1 block text-xs text-white/40">{schedule.length}/120 (max 120)</span>
          </label>
          <label className="text-sm text-white/70">
            Direccion
            <div className="mt-2 rounded-2xl border border-white/15 bg-black/20 px-4 py-2.5 text-white/80">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ingresa direccion exacta (opcional, max 120)"
                maxLength={120}
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
            <span className="mt-1 block text-xs text-white/40">{address.length}/120 (max 120)</span>
          </label>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#0f0f0f] p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Datos adicionales visibles</h2>
            <p className="text-sm text-white/50">Selecciona la informacion que quieres mostrar junto al anuncio.</p>
          </div>
          <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={visibility.phone}
                onChange={() => toggleVisibility("phone")}
                className="h-4 w-4 rounded border-white/30 bg-transparent"
              />
              Mostrar telefono
            </label>
          </div>

          <div className="border-t border-white/10 pt-5 space-y-2">
            <div>
              <p className="text-base font-semibold text-white">Redes sociales (opcional)</p>
              <p className="text-sm text-white/50">Anade tus redes para que los usuarios puedan seguir tu negocio.</p>
            </div>
            <div className="space-y-3">
              {socialFields.map((social) => (
                <div key={social.key} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/20 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80">
                    <social.icon className="h-4 w-4 text-white/70" />
                  </div>
                  <input
                    type="text"
                    value={socials[social.key]}
                    onChange={(e) => handleSocialChange(social.key, e.target.value)}
                    placeholder={social.placeholder}
                    className="flex-1 rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </form>

      <aside className="space-y-4 rounded-3xl border border-white/10 bg-[#0f0f0f] p-6">
        <h3 className="text-lg font-semibold text-white">Vista previa</h3>
        <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
          <div className="h-40 rounded-2xl bg-[#1b1b1b] overflow-hidden">
            {previewData.image ? (
              <img src={previewData.image} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/40">Sin imagen</div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              {previewData.categoryMain && (
                <span className="inline-flex rounded-full bg-green-900/40 px-3 py-1 text-xs text-green-200">
                  {previewData.categoryMain}
                </span>
              )}
              {previewData.categorySub && (
                <span className="inline-flex rounded-full bg-green-900/30 px-3 py-1 text-xs text-green-100">
                  {previewData.categorySub}
                </span>
              )}
              {!previewData.categoryMain && !previewData.categorySub && (
                <span className="inline-flex rounded-full bg-green-900/40 px-3 py-1 text-xs text-green-200">Categoria</span>
              )}
            </div>
            <h4 className="text-xl font-semibold text-white break-words">{previewData.title}</h4>
            <p className="text-sm text-white/60 whitespace-pre-line break-words">{previewData.description}</p>
          </div>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            <span className="break-words whitespace-pre-wrap">{previewData.schedule}</span>
            <p className="text-xs text-white/50 break-words whitespace-pre-wrap">{previewData.address}</p>
          </div>
          {visibility.phone && (userPhone || "").trim().length > 0 && (
            <div className="mt-3 text-sm text-white/70">
              <p className="text-xs uppercase tracking-wide text-white/50">Telefono de contacto</p>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 py-2">
                <span className="text-white/80">{(userPhone || "").trim()}</span>
              </div>
            </div>
          )}

          {previewData.socials.length > 0 && (
            <div className="mt-6 space-y-2 text-sm text-white/70">
              <p className="text-xs uppercase tracking-wide text-white/50">Social</p>
              <div className="flex items-center gap-3 text-white/80">
                {previewData.socials.map((social) => (
                  <div
                    key={social.key}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5"
                    title={social.value}
                  >
                    <social.icon className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-xs text-yellow-100">
          Los anuncios enviados a revision seran validados por un administrador antes de publicarse.
        </div>
        {submitMessage && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              submitMessage.type === "success"
                ? "border-green-500/40 bg-green-500/10 text-green-100"
                : "border-red-500/40 bg-red-500/10 text-red-100"
            }`}
          >
            {submitMessage.text}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="flex-1 rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-white/60">
            Cancelar
          </button>
          <button
            type="submit"
            form="announcement-form"
            disabled={submitting}
            className="flex-1 rounded-full bg-[#c21e1e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#961111] disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Enviar a revision"}
          </button>
        </div>
      </aside>
    </div>
  );
}
