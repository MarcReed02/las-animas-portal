"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  User,

  MapPin,
  Eye,
  EyeOff,
  UploadCloud,
  FileText,
  CheckCircle2,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import punycode from "punycode";
import { formatRutCapped, normalizeRut, validateRut } from "@/lib/rut";
import { createClient } from "@/lib/supabase/client";
import { hashPassword } from "@/lib/password";
import NavbarNew from "@/components/navbar-new";
import MinimalFooter from "@/components/minimal-footer";

type PasswordCheck = {
  score: number;
  message: string | null;
};

const PHONE_CODE = "+56";

const bannedPasswordRanges = [
  [0x0000, 0x001f],
  [0x007f, 0x009f],
  [0x200b, 0x200f],
  [0x2028, 0x202f],
  [0xfeff, 0xfeff],
  [0xd800, 0xdfff],
];

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 64;

export default function Page() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rut, setRut] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<null | "ok" | "err">(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const supabase = createClient();

  // Debug log for state changes
  useEffect(() => {
    console.log("DEBUG: Form State Updated:", {
      firstName, lastName, rut, phone, address, email, termsAccepted, file: file?.name
    });
  }, [firstName, lastName, rut, phone, address, email, termsAccepted, file]);

  const passwordCheck: PasswordCheck = useMemo(() => evaluatePassword(password), [password]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    } else if (e.type === "drop") {
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        console.log("DEBUG: File dropped:", e.dataTransfer.files[0].name);
        handleUpload(e.dataTransfer.files[0]);
      }
    }
  };

  const handleUpload = (selected: File | null) => {
    if (!selected) return;
    console.log("DEBUG: File selected:", selected.name);
    setFile(selected);
    setProgress(20);
    setTimeout(() => setProgress(70), 400);
    setTimeout(() => setProgress(100), 1200);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("DEBUG: onSubmit triggered");

    const validation = validateForm({
      firstName,
      lastName,
      rut,
      phone,
      address,
      email,
      password,
      confirmPassword,
      file,
      passwordCheck,
      termsAccepted,
    });

    console.log("DEBUG: Validation result:", validation);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      console.warn("DEBUG: Validation failed", validation);
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      console.log("DEBUG: Proceeding with submission...");
      const normalizedFirstName = finalizeName(firstName);
      const normalizedLastName = finalizeName(lastName);
      const normalizedRut = normalizeRut(rut);
      const normalizedEmail = normalizeEmail(email);
      const normalizedAddress = normalizeAddress(address);
      const passwordHash = await hashPassword(password);
      const nationalNumber = phone.replace(/\D/g, "");
      const e164Phone = `${PHONE_CODE}${nationalNumber}`;

      console.log("DEBUG: Normalized Data:", {
        normalizedFirstName, normalizedLastName, normalizedRut, normalizedEmail, e164Phone
      });

      let documentoUrl: string | null = null;
      if (file) {
        console.log("DEBUG: Uploading file...");
        const uniqueId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Date.now().toString();
        const path = `solicitudes/${uniqueId}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("documentos").upload(path, file);
        if (uploadError) {
          console.error("DEBUG: Upload error:", uploadError);
          throw uploadError;
        }
        const { data } = supabase.storage.from("documentos").getPublicUrl(path);
        documentoUrl = data.publicUrl;
        console.log("DEBUG: File uploaded, URL:", documentoUrl);
        setProgress(100);
      }

      const payload = {
        nombres: normalizedFirstName,
        apellidos: normalizedLastName,
        rut: normalizedRut,
        correo: normalizedEmail,
        direccion: normalizedAddress,
        telefono: e164Phone,
        documento_url: documentoUrl,
        estado: "pendiente",
        password_hash: passwordHash,

      };

      console.log("DEBUG: Inserting payload:", payload);

      const { error: insertError } = await supabase.from("solicitudes_registro").insert({ ...payload });

      if (insertError) {
        console.error("DEBUG: Insert error FULL:", insertError);
        console.error("DEBUG: Insert error details:", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        });

        if (insertError.code === "23505") {
          const msg = insertError.message || "";
          if (msg.includes("rut")) {
            setErrors((prev) => ({
              ...prev,
              rut: "Este RUT ya tiene una solicitud o cuenta activa.",
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              email: "Ya existe una solicitud con este correo.",
            }));
          }
          return;
        }
        throw insertError;
      }

      console.log("DEBUG: Submission successful");
      setStatus("ok");
      // Reset form
      setFirstName(""); setLastName(""); setRut(""); setPhone("");
      setAddress(""); setEmail(""); setPassword("");
      setConfirmPassword(""); setFile(null); setProgress(null); setTermsAccepted(false);
    } catch (err) {
      console.error("DEBUG: Exception caught:", err);
      setStatus("err");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#171717] font-sans text-[#171717] dark:text-[#EDEDED] transition-colors duration-300">
      <NavbarNew />

      <div className="flex-1 flex flex-col lg:flex-row w-full">
        {/* --- COLUMNA IZQUIERDA: VISUAL & BRANDING --- */}
        <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-[#f0f0f0] dark:bg-[#0f0f0f] pt-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1569388330292-79cc1ec67270?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 dark:opacity-40 grayscale mix-blend-multiply dark:mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/20 dark:from-[#171717] dark:via-transparent dark:to-[#171717]/50"></div>

          <div className="relative z-10 w-full h-full flex flex-col justify-between p-12">
            <div className="mt-8">
              {/* Content pushed down by navbar */}
            </div>

            <div className="mb-12">
              <div className="w-12 h-1 bg-[#DA0037] mb-6"></div>
              <h1 className="text-4xl font-bold text-[#171717] dark:text-white mb-4 leading-tight">
                Impulsa tu negocio en el corazón de Valdivia.
              </h1>
              <p className="text-[#444444] dark:text-[#EDEDED]/60 text-lg max-w-md">
                Únete a la red oficial de comercio, aumenta tu visibilidad y conecta con miles de vecinos y turistas cada día.
              </p>

              <div className="mt-8 flex gap-8 border-t border-[#d4d4d4] dark:border-[#444444] pt-8">
                <div>
                  <span className="block text-2xl font-bold text-[#171717] dark:text-white">+120</span>
                  <span className="text-xs uppercase tracking-wider text-[#666666] dark:text-[#EDEDED]/50">Locales</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-[#171717] dark:text-white">5k</span>
                  <span className="text-xs uppercase tracking-wider text-[#666666] dark:text-[#EDEDED]/50">Visitas/mes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- COLUMNA DERECHA: FORMULARIO --- */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center relative overflow-y-auto pt-20">
          <div className="w-full max-w-2xl mx-auto px-6 py-12 lg:px-16 lg:py-20">

            <div className="mb-10">
              <h2 className="text-3xl font-bold text-[#171717] dark:text-white mb-2">Crear cuenta comercial</h2>
              <p className="text-[#666666] dark:text-[#EDEDED]/50">
                ¿Ya tienes una cuenta? <Link href="/auth/login/ingresar" className="text-[#DA0037] font-medium hover:underline transition-colors">Iniciar sesión</Link>
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">

              {/* SECCIÓN 1: DATOS PERSONALES */}
              <div className="space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#DA0037] flex items-center gap-2 mb-4">
                  <User size={14} /> Representante Legal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="group relative">
                    <label className="block text-xs font-medium text-[#666666] dark:text-[#EDEDED]/60 mb-1.5 ml-1 group-focus-within:text-[#DA0037] transition-colors">Nombres</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(formatNameInput(e.target.value))}
                        onBlur={(e) => setFirstName(finalizeName(e.target.value))}
                        className={`w-full bg-[#f5f5f5] dark:bg-[#1f1f1f] border-b-2 px-4 py-3 text-sm text-[#171717] dark:text-white focus:outline-none focus:bg-[#e5e5e5] dark:focus:bg-[#252525] transition-all rounded-t-md ${errors.firstName ? 'border-red-500 pr-10' : 'border-[#d4d4d4] dark:border-[#444444] focus:border-[#DA0037]'}`}
                        placeholder="Ej. Juan Andrés"
                      />
                      {errors.firstName && <AlertCircle className="absolute right-3 top-3 text-red-500 animate-in fade-in zoom-in duration-300" size={18} />}
                    </div>
                    {errors.firstName && <span className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1 animate-in slide-in-from-top-1">{errors.firstName}</span>}
                  </div>
                  <div className="group relative">
                    <label className="block text-xs font-medium text-[#666666] dark:text-[#EDEDED]/60 mb-1.5 ml-1 group-focus-within:text-[#DA0037] transition-colors">Apellidos</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(formatNameInput(e.target.value))}
                        onBlur={(e) => setLastName(finalizeName(e.target.value))}
                        className={`w-full bg-[#f5f5f5] dark:bg-[#1f1f1f] border-b-2 px-4 py-3 text-sm text-[#171717] dark:text-white focus:outline-none focus:bg-[#e5e5e5] dark:focus:bg-[#252525] transition-all rounded-t-md ${errors.lastName ? 'border-red-500 pr-10' : 'border-[#d4d4d4] dark:border-[#444444] focus:border-[#DA0037]'}`}
                        placeholder="Ej. Pérez Soto"
                      />
                      {errors.lastName && <AlertCircle className="absolute right-3 top-3 text-red-500 animate-in fade-in zoom-in duration-300" size={18} />}
                    </div>
                    {errors.lastName && <span className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1 animate-in slide-in-from-top-1">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="group relative">
                    <label className="block text-xs font-medium text-[#666666] dark:text-[#EDEDED]/60 mb-1.5 ml-1 group-focus-within:text-[#DA0037] transition-colors">RUT Personal</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={rut}
                        onChange={(e) => {
                          const val = formatRutInput(e.target.value);
                          console.log("DEBUG: RUT Changed. Input:", e.target.value, "Formatted:", val);
                          setRut(val);
                        }}
                        maxLength={12}
                        className={`w-full bg-[#f5f5f5] dark:bg-[#1f1f1f] border-b-2 px-4 py-3 text-sm text-[#171717] dark:text-white focus:outline-none focus:bg-[#e5e5e5] dark:focus:bg-[#252525] transition-all rounded-t-md ${errors.rut ? 'border-red-500 pr-10' : 'border-[#d4d4d4] dark:border-[#444444] focus:border-[#DA0037]'}`}
                        placeholder="12.345.678-9"
                      />
                      {errors.rut && <AlertCircle className="absolute right-3 top-3 text-red-500 animate-in fade-in zoom-in duration-300" size={18} />}
                    </div>
                    {errors.rut && <span className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1 animate-in slide-in-from-top-1">{errors.rut}</span>}
                  </div>
                  <div className="group relative">
                    <label className="block text-xs font-medium text-[#666666] dark:text-[#EDEDED]/60 mb-1.5 ml-1 group-focus-within:text-[#DA0037] transition-colors">Teléfono Móvil</label>
                    <div className="relative">
                      <div className="absolute left-4 top-3 text-sm text-[#666666] dark:text-[#EDEDED]/60 select-none pointer-events-none">
                        +56
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                        className={`w-full bg-[#f5f5f5] dark:bg-[#1f1f1f] border-b-2 pl-12 pr-4 py-3 text-sm text-[#171717] dark:text-white focus:outline-none focus:bg-[#e5e5e5] dark:focus:bg-[#252525] transition-all rounded-t-md ${errors.phone ? 'border-red-500 pr-10' : 'border-[#d4d4d4] dark:border-[#444444] focus:border-[#DA0037]'}`}
                        placeholder="9 1234 5678"
                      />
                      {errors.phone && <AlertCircle className="absolute right-3 top-3 text-red-500 animate-in fade-in zoom-in duration-300" size={18} />}
                    </div>
                    {errors.phone && <span className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1 animate-in slide-in-from-top-1">{errors.phone}</span>}
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#d4d4d4]/50 dark:bg-[#444444]/30 my-8"></div>

              {/* SECCIÓN 2: DATOS DEL COMERCIO */}
              <div className="space-y-5">


                <div className="group relative">
                  <label className="block text-xs font-medium text-[#666666] dark:text-[#EDEDED]/60 mb-1.5 ml-1 group-focus-within:text-[#DA0037] transition-colors">Dirección Comercial</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`w-full bg-[#f5f5f5] dark:bg-[#1f1f1f] border-b-2 pl-4 pr-10 py-3 text-sm text-[#171717] dark:text-white focus:outline-none focus:bg-[#e5e5e5] dark:focus:bg-[#252525] transition-all rounded-t-md ${errors.address ? 'border-red-500' : 'border-[#d4d4d4] dark:border-[#444444] focus:border-[#DA0037]'}`}
                      placeholder="Calle, Número, Comuna"
                    />
                    {errors.address ? (
                      <AlertCircle className="absolute right-3 top-3 text-red-500 animate-in fade-in zoom-in duration-300" size={18} />
                    ) : (
                      <MapPin className="absolute right-3 top-3 text-[#999999] dark:text-[#444444]" size={18} />
                    )}
                  </div>
                  {errors.address && <span className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1 animate-in slide-in-from-top-1">{errors.address}</span>}
                </div>
              </div>

              {/* SECCIÓN 3: CREDENCIALES */}
              <div className="space-y-5">
                <div className="group relative">
                  <label className="block text-xs font-medium text-[#666666] dark:text-[#EDEDED]/60 mb-1.5 ml-1 group-focus-within:text-[#DA0037] transition-colors">Correo Electrónico (Usuario)</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-[#f5f5f5] dark:bg-[#1f1f1f] border-b-2 px-4 py-3 text-sm text-[#171717] dark:text-white focus:outline-none focus:bg-[#e5e5e5] dark:focus:bg-[#252525] transition-all rounded-t-md ${errors.email ? 'border-red-500 pr-10' : 'border-[#d4d4d4] dark:border-[#444444] focus:border-[#DA0037]'}`}
                      placeholder="nombre@empresa.cl"
                    />
                    {errors.email && <AlertCircle className="absolute right-3 top-3 text-red-500 animate-in fade-in zoom-in duration-300" size={18} />}
                  </div>
                  {errors.email && <span className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1 animate-in slide-in-from-top-1">{errors.email}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="group relative">
                    <label className="block text-xs font-medium text-[#666666] dark:text-[#EDEDED]/60 mb-1.5 ml-1 group-focus-within:text-[#DA0037] transition-colors">Contraseña</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full bg-[#f5f5f5] dark:bg-[#1f1f1f] border-b-2 px-4 py-3 text-sm text-[#171717] dark:text-white focus:outline-none focus:bg-[#e5e5e5] dark:focus:bg-[#252525] transition-all rounded-t-md pr-10 ${errors.password ? 'border-red-500' : 'border-[#d4d4d4] dark:border-[#444444] focus:border-[#DA0037]'}`}
                      placeholder="Mín. 8 caracteres"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-[#999999] dark:text-[#444444] hover:text-[#171717] dark:hover:text-[#EDEDED]">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {errors.password && <span className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1 animate-in slide-in-from-top-1">{errors.password}</span>}
                  </div>
                  <div className="group relative">
                    <label className="block text-xs font-medium text-[#666666] dark:text-[#EDEDED]/60 mb-1.5 ml-1 group-focus-within:text-[#DA0037] transition-colors">Repetir Contraseña</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full bg-[#f5f5f5] dark:bg-[#1f1f1f] border-b-2 px-4 py-3 text-sm text-[#171717] dark:text-white focus:outline-none focus:bg-[#e5e5e5] dark:focus:bg-[#252525] transition-all rounded-t-md ${errors.confirmPassword ? 'border-red-500' : 'border-[#d4d4d4] dark:border-[#444444] focus:border-[#DA0037]'}`}
                      placeholder="Confirmar"
                    />
                    {errors.confirmPassword && <span className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1 animate-in slide-in-from-top-1">{errors.confirmPassword}</span>}
                  </div>
                </div>
              </div>

              {/* VALIDACIÓN */}
              <div className="bg-[#f5f5f5] dark:bg-[#1f1f1f] rounded-xl p-6 border border-[#d4d4d4] dark:border-[#444444] mt-4">
                <h4 className="text-sm font-bold text-[#171717] dark:text-white mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-[#DA0037]" /> Documento de Validación
                </h4>

                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer ${dragActive
                    ? 'border-[#DA0037] bg-[#DA0037]/10'
                    : errors.file ? 'border-red-500 bg-red-500/10' : 'border-[#d4d4d4] dark:border-[#444444] hover:border-[#171717] dark:hover:border-[#EDEDED] hover:bg-[#e5e5e5] dark:hover:bg-[#252525]'
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrag}
                >
                  <UploadCloud className="mx-auto h-10 w-10 text-[#999999] dark:text-[#444444] mb-3" />
                  <p className="text-sm font-medium text-[#171717] dark:text-[#EDEDED]">
                    {file ? <span className="text-[#DA0037]">{file.name}</span> : <><span className="text-[#DA0037]">Sube tu patente</span> o arrastra el archivo</>}
                  </p>
                  <p className="text-xs text-[#666666] dark:text-[#EDEDED]/40 mt-1">PDF, PNG, JPG (Máx. 10MB)</p>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
                  />
                </div>
                {errors.file && <span className="text-xs text-red-500 mt-1 block text-center">{errors.file}</span>}
                {progress !== null && (
                  <div className="mt-4 h-1 w-full bg-[#d4d4d4] dark:bg-[#444444] rounded-full overflow-hidden">
                    <div className="h-full bg-[#DA0037] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                )}
              </div>

              {/* FOOTER DEL FORMULARIO */}
              <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <label className="flex items-start gap-3 text-sm text-[#666666] dark:text-[#EDEDED]/60 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className={`peer appearance-none h-5 w-5 border-2 rounded bg-transparent checked:bg-[#DA0037] checked:border-[#DA0037] transition-all ${errors.terms ? 'border-red-500' : 'border-[#d4d4d4] dark:border-[#444444]'}`}
                      />
                      <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none" />
                    </div>
                    <span className={`group-hover:text-[#171717] dark:group-hover:text-[#EDEDED] transition-colors ${errors.terms ? 'text-red-500' : ''}`}>Acepto los términos y condiciones de uso</span>
                  </label>
                  {errors.terms && <span className="text-xs text-red-500 ml-8">{errors.terms}</span>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-4 bg-[#171717] dark:bg-[#EDEDED] text-white dark:text-[#171717] font-black rounded-lg hover:bg-[#000000] dark:hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/5 dark:shadow-white/5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "REGISTRANDO..." : "REGISTRAR"} <ArrowRight size={18} className="text-[#DA0037]" />
                </button>
              </div>

              {status === "ok" && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-center">
                  ¡Solicitud enviada con éxito!
                </div>
              )}
              {status === "err" && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-center">
                  Ocurrió un error. Intente nuevamente.
                </div>
              )}

            </form>
          </div>
        </div>
      </div >
      <MinimalFooter />
    </div >
  );
}

function formatRutInput(raw: string) {
  const upper = raw.replace(/[\s.-]/g, "").toUpperCase();
  let clean = "";
  let hasLetterDv = false;

  for (const char of upper) {
    if (/\d/.test(char)) {
      if (hasLetterDv || clean.length >= 9) continue;
      clean += char;
    } else if (char === "K") {
      if (clean.length === 0 || hasLetterDv) continue;
      hasLetterDv = true;
      if (clean.length >= 9) {
        clean = clean.slice(0, 8);
      }
      clean += "K";
    }
  }

  return formatRutCapped(clean);
}

function formatNameInput(value: string) {
  const normalized = value.normalize("NFKC").replace(/[^\p{L}\s]/gu, "");
  const collapsed = normalized.replace(/\s{2,}/g, " ").trimStart();
  const endsWithSpace = /\s$/.test(collapsed);
  const cleaned = endsWithSpace ? collapsed : collapsed.trimEnd();
  return cleaned.slice(0, 40);
}

function finalizeName(value: string) {
  return formatNameInput(value).trim();
}

function normalizeAddress(value: string) {
  return value.trim().slice(0, 120);
}

function validateSimpleName(value: string, label: string) {
  const cleaned = finalizeName(value);
  if (!cleaned) {
    return `${label} es obligatorio.`;
  }
  if (cleaned.length < 2 || cleaned.length > 40) {
    return `${label} debe tener entre 2 y 40 letras.`;
  }
  const lettersOnly = /^[A-Za-z\s]+$/;
  if (!lettersOnly.test(cleaned)) {
    return `${label} solo puede tener letras.`;
  }
  return "";
}

function validateAddress(value: string) {
  const normalized = normalizeAddress(value);
  if (!normalized) {
    return "La direccion es obligatoria.";
  }
  if (normalized.length < 5) {
    return "La direccion debe tener al menos 5 caracteres.";
  }
  return "";
}

function normalizeEmail(value: string) {
  const trimmed = value.trim();
  const [localRaw, domainRaw = ""] = trimmed.split("@");
  const local = localRaw.toLowerCase();
  const domain = domainRaw.toLowerCase();
  const asciiDomain = domain ? punycode.toASCII(domain) : "";
  return `${local}${domain ? "@" + asciiDomain : ""}`.slice(0, 254);
}

function validateForm({
  firstName,
  lastName,
  rut,
  phone,
  address,
  email,
  password,
  confirmPassword,
  file,
  passwordCheck,
  termsAccepted,
}: {
  firstName: string;
  lastName: string;
  rut: string;
  phone: string;
  address: string;
  email: string;
  password: string;
  confirmPassword: string;
  file: File | null;
  passwordCheck: PasswordCheck;
  termsAccepted: boolean;
}) {
  const errors: Record<string, string> = {};
  const firstNameError = validateSimpleName(firstName, "Nombres");
  if (firstNameError) {
    errors.firstName = firstNameError;
  }
  const lastNameError = validateSimpleName(lastName, "Apellidos");
  if (lastNameError) {
    errors.lastName = lastNameError;
  }

  const normalizedRut = normalizeRut(rut);
  console.log("DEBUG: Validation - Normalizing RUT:", rut, "->", normalizedRut);

  if (!normalizedRut) {
    errors.rut = "El RUT es obligatorio.";
  } else if (!validateRut(normalizedRut)) {
    console.warn("DEBUG: Validation - RUT Invalid:", normalizedRut);
    errors.rut = "El RUT ingresado no es válido.";
  } else {
    console.log("DEBUG: Validation - RUT Valid:", normalizedRut);
  }

  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    errors.phone = "El teléfono es obligatorio.";
  } else if (digits.length !== 9) {
    errors.phone = "El teléfono debe tener 9 dígitos.";
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail.includes("@")) {
    errors.email = "El correo electrónico no es válido.";
  }

  const addressError = validateAddress(address);
  if (addressError) {
    errors.address = addressError;
  }

  if (!password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
    errors.password = `La contraseña debe tener entre ${MIN_PASSWORD} y ${MAX_PASSWORD} caracteres.`;
  }
  if (passwordCheck.score < 4) {
    errors.password = passwordCheck.message || "La contraseña es débil.";
  }
  if (confirmPassword !== password) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  if (!file) {
    errors.file = "Debes subir un documento de validación.";
  }

  if (!termsAccepted) {
    errors.terms = "Debes aceptar los términos y condiciones.";
  }

  return errors;
}

function evaluatePassword(password: string): PasswordCheck {
  if (!password) {
    return { score: 0, message: "Se requiere una contrasena." };
  }
  if (password.trim() !== password) {
    return { score: 0, message: "No uses espacios al inicio o al final." };
  }
  for (const ch of password) {
    const code = ch.codePointAt(0)!;
    if (bannedPasswordRanges.some(([start, end]) => code >= start && code <= end)) {
      return { score: 0, message: "La contrasena contiene caracteres no soportados." };
    }
  }

  if (password.length < MIN_PASSWORD) {
    return { score: 0, message: `La contrasena debe contener minimo ${MIN_PASSWORD} caracteres.` };
  }
  if (password.length > MAX_PASSWORD) {
    return { score: 0, message: `La contrasena no puede superar ${MAX_PASSWORD} caracteres.` };
  }

  if (!/[A-Z]/.test(password)) {
    return { score: 0, message: "Debe incluir al menos una letra mayuscula." };
  }
  if (!/[a-z]/.test(password)) {
    return { score: 0, message: "Debe incluir al menos una letra minuscula." };
  }
  if (!/[0-9]/.test(password)) {
    return { score: 0, message: "Debe incluir al menos un numero." };
  }

  const specialPattern = /[!@#$%^&*()_+\-={}\[\]<>?,.]/;
  if (!specialPattern.test(password)) {
    return { score: 0, message: "Debe incluir al menos un caracter especial (!@#$%^&*()_+-={}[]<>?,.)." };
  }

  return { score: 4, message: null };
}
