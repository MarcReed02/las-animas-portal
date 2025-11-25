"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { TbFileUpload } from "react-icons/tb";
import punycode from "punycode/";
import { formatRutCapped, normalizeRut, validateRut } from "@/lib/rut";
import { createClient } from "@/lib/supabase/client";
import { hashPassword } from "@/lib/password";

type PasswordCheck = {
  score: number;
  message: string | null;
};

const PHONE_CODE = "+56";
const PHONE_ISO = "CL";

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const supabase = createClient();

  const passwordCheck: PasswordCheck = useMemo(() => evaluatePassword(password), [password]);

  const handleUpload = (selected: File | null) => {
    if (!selected) return;
    setFile(selected);
    setProgress(20);
    setTimeout(() => setProgress(70), 400);
    setTimeout(() => setProgress(100), 1200);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);
    setStatus(null);
    try {
      const normalizedFirstName = finalizeName(firstName);
      const normalizedLastName = finalizeName(lastName);
      const normalizedRut = normalizeRut(rut);
      const normalizedEmail = normalizeEmail(email);
      const normalizedAddress = normalizeAddress(address);
      console.log("[registro] generando hash de contrasena segura");
      const passwordHash = await hashPassword(password);
      console.log("[registro] hash calculado");
      const nationalNumber = phone.replace(/\D/g, "");
      const e164Phone = `${PHONE_CODE}${nationalNumber}`;
      let documentoUrl: string | null = null;
        if (file) {
          const uniqueId =
            typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
              ? crypto.randomUUID()
              : Date.now().toString();
          const path = `solicitudes/${uniqueId}-${file.name}`;
          console.log("[registro] Subiendo documento...", { path, fileName: file.name, size: file.size });
          const { error: uploadError } = await supabase.storage.from("documentos").upload(path, file);
          if (uploadError) {
            console.error("[registro] Error subiendo documento", uploadError);
            throw uploadError;
          }
          const { data } = supabase.storage.from("documentos").getPublicUrl(path);
          documentoUrl = data.publicUrl;
          console.log("[registro] Documento subido con exito", { documentoUrl });
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
      console.log("[registro] Insertando solicitud...", payload);
      const { error: insertError } = await supabase.from("solicitudes_registro").insert({
        ...payload,
      });
      if (insertError) {
        if (insertError.code === "23505") {
          console.warn("[registro] correo duplicado en solicitud", insertError);
          setErrors((prev) => ({
            ...prev,
            email: "Ya existe una solicitud con este correo. Si ya enviaste una, espera a que la revisemos.",
          }));
          return;
        }
        console.error("[registro] ERROR COMPLETO AL INSERTAR:", {
          mensaje: insertError?.message,
          detalles: insertError?.details,
          hint: insertError?.hint,
          codigo: insertError?.code,
          stack: insertError?.stack,
          error_completo: JSON.stringify(insertError, null, 2),
        });
        throw insertError;
      }
      console.log("[registro] Solicitud creada correctamente");
      setStatus("ok");
      setFirstName("");
      setLastName("");
      setRut("");
      setPhone("");
      setEmail("");
      setAddress("");
      setPassword("");
      setConfirmPassword("");
      setFile(null);
      setProgress(null);
    } catch (err) {
      console.error("[registro] Error en proceso de registro", err);
      setStatus("err");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100svh-4rem)] w-full items-center justify-center bg-[#0B0B0B] px-4 py-16 text-white">
      <div className="w-full max-w-md">
        <form
          onSubmit={onSubmit}
          className="space-y-6 rounded-[32px] border border-white/10 bg-[#0B0B0B] px-6 py-8 text-white"
        >
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold md:text-4xl">Ingresar Registro</h1>
            <p className="text-sm text-white/60 md:text-base">Completa con tu informacion</p>
          </div>

          <div className="space-y-6">
            <FieldWrapper label="Nombres" error={errors.firstName}>
              <input
                type="text"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(formatNameInput(e.target.value))}
                onBlur={(e) => setFirstName(finalizeName(e.target.value))}
                placeholder="Ej: Juan Antonio"
                aria-invalid={Boolean(errors.firstName)}
                className={inputClass(errors.firstName)}
              />
            </FieldWrapper>

            <FieldWrapper label="Apellidos" error={errors.lastName}>
              <input
                type="text"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(formatNameInput(e.target.value))}
                onBlur={(e) => setLastName(finalizeName(e.target.value))}
                placeholder="Ej: Pérez Soto"
                aria-invalid={Boolean(errors.lastName)}
                className={inputClass(errors.lastName)}
              />
            </FieldWrapper>

            <FieldWrapper label="RUT" error={errors.rut}>
              <input
                type="text"
                required
                autoComplete="off"
                value={rut}
                onChange={(e) => setRut(formatRutInput(e.target.value))}
                onBlur={(e) => setRut(formatRutInput(e.target.value))}
                maxLength={12}
                placeholder="12.345.678-9"
                aria-invalid={Boolean(errors.rut)}
                className={inputClass(errors.rut)}
              />
            </FieldWrapper>

            <FieldWrapper label="Telefono" error={errors.phone}>
              <div
                className={`flex overflow-hidden rounded-2xl border text-sm transition focus-within:ring-2 ${
                  errors.phone
                    ? "border-[#ff3b30]/80 bg-[#1a0d0d] focus-within:border-[#ff3b30] focus-within:ring-[#ff3b30]/30"
                    : "border-white/15 bg-[#111111] focus-within:border-white/40 focus-within:ring-white/15"
                }`}
              >
                <span className="flex items-center border-r border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
                  {PHONE_CODE}
                </span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="telefono"
                  value={phone}
                  maxLength={9}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                    setPhone(digits);
                  }}
                  aria-invalid={Boolean(errors.phone)}
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none"
                />
              </div>
            </FieldWrapper>

            <FieldWrapper label="Dirección" error={errors.address}>
              <input
                type="text"
                required
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onBlur={(e) => setAddress(normalizeAddress(e.target.value))}
                placeholder="Ubicación"
                aria-invalid={Boolean(errors.address)}
                className={inputClass(errors.address)}
              />
            </FieldWrapper>

            <FieldWrapper label="Correo electronico" error={errors.email}>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="correocontacto@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(errors.email)}
                className={inputClass(errors.email)}
              />
            </FieldWrapper>

            <FieldWrapper label="Contrasena" error={errors.password}>
              <div className="relative">
                <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(errors.password)}
                className={inputClass(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-4 flex items-center text-white/50 transition hover:text-white focus:outline-none"
                >
                  <span className="inline-flex items-center justify-center opacity-100 transition-opacity duration-100">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </button>
              </div>
              {passwordCheck.message && (
                <p className="text-xs text-white/50">{passwordCheck.message}</p>
              )}
            </FieldWrapper>

            <FieldWrapper label="Confirmar Contrasena" error={errors.confirmPassword}>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className={inputClass(errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-4 flex items-center text-white/50 transition hover:text-white focus:outline-none"
                >
                  <span className="inline-flex items-center justify-center opacity-100 transition-opacity duration-200">
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </button>
              </div>
            </FieldWrapper>
            <FieldWrapper label="Documento de pertenecia" error={errors.file}>
              <div
                className={`space-y-3 rounded-3xl border border-dashed px-4 py-5 text-sm transition ${
                  errors.file ? "border-[#ff3b30]/80 bg-[#1a0d0d]" : "border-white/15 bg-[#111111]"
                }`}
              >
                {file ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{file.name}</span>
                      <span>{progress ?? 0}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-[#ef2b2d] transition-all"
                        style={{ width: `${progress ?? 0}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-white/70">
                    arrastra o sube los archivos
                    <div className="text-xs text-white/40">PDF, JPG, PNG maximo 10MB</div>
                  </div>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#ef2b2d] px-4 py-2 font-semibold text-white transition hover:bg-[#ff3b30]">
                  <TbFileUpload className="h-5 w-5" />
                  Subir archivo
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </FieldWrapper>
          </div>

          {status === "ok" && (
            <p className="text-center text-sm text-[#48d2a0]">Cuenta creada exitosamente!</p>
          )}
          {status === "err" && (
            <p className="text-center text-sm text-[#ff3b30]">Ocurrio un error. Intente nuevamente.</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#ef2b2d] py-3 text-lg font-semibold text-white transition hover:bg-[#ff3b30] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>

          <div className="text-center text-sm text-white/70">
            Ya tienes una cuenta?{" "}
            <Link href="/auth/login/ingresar" className="font-semibold text-[#ff3b30] transition hover:text-white">
              iniciar sesion
            </Link>
          </div>
        </form>
      </div>
    </div>
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
  if (/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/.test(cleaned)) {
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
  if (!normalizedRut) {
    errors.rut = "RUT es obligatorio.";
  } else if (!validateRut(normalizedRut)) {
    errors.rut = "RUT invalido.";
  }

  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    errors.phone = "Phone number is required.";
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail.includes("@")) {
    errors.email = "Email must be valid.";
  }

  const addressError = validateAddress(address);
  if (addressError) {
    errors.address = addressError;
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
    errors.password = `Password must be between ${MIN_PASSWORD} and ${MAX_PASSWORD} characters.`;
  }
  if (passwordCheck.score < 4) {
    errors.password = passwordCheck.message || "Password is too weak.";
  }
  if (confirmPassword !== password) {
    errors.confirmPassword = "Las contrasenas no coinciden.";
  }

  if (!file) {
    errors.file = "Please upload a document.";
  }

  return errors;
}

function evaluatePassword(password: string): PasswordCheck {
  if (!password) {
    return { score: 0, message: "Se requiere una contrasena." };
  }
  if (password.trim() !== password) {
    return { score: 0, message: "No spaces at the beginning or end." };
  }
  for (const ch of password) {
    const code = ch.codePointAt(0)!;
    if (bannedPasswordRanges.some(([start, end]) => code >= start && code <= end)) {
      return { score: 0, message: "Password contains unsupported characters." };
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

function inputClass(hasError?: string) {
  return `w-full rounded-2xl border px-4 py-3 text-white placeholder-white/40 transition focus:outline-none focus:ring-2 ${
    hasError
      ? "border-[#ff3b30]/80 bg-[#1a0d0d] focus:border-[#ff3b30] focus:ring-[#ff3b30]/30"
      : "border-white/15 bg-transparent focus:border-white/40 focus:ring-white/15"
  }`;
}

function FieldWrapper({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-white/80">{label}</label>
      {children}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#ff3b30]/40 bg-[#1a0d0d] px-3 py-2 text-sm text-[#ff6b5c]">
          <span className="text-lg leading-none text-[#ff3b30]">!</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
