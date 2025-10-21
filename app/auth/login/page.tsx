"use client";

import Link from "next/link";
import { useState } from "react";
import { formatRutCapped, validateRut } from "@/lib/rut";

export default function Page() {
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | "ok" | "err">(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSent(null);
    try {
      // Placeholder: aquí podrías enviar a una API o email.
      await new Promise((r) => setTimeout(r, 800));
      setSent("ok");
      setName("");
      setRut("");
      setEmail("");
      setFile(null);
    } catch {
      setSent("err");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-svh w-full flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <form
          onSubmit={onSubmit}
          className="rounded-2xl bg-[#151515]/90 ring-1 ring-white/10 p-6 md:p-8 text-white shadow-xl"
        >
          <h1 className="text-xl md:text-2xl font-extrabold tracking-wide mb-6">
            VERIFICAR PERTENENCIA A LA CÁMARA DE COMERCIO DE LAS ÁNIMAS
          </h1>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="NOMBRE"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md bg-black/20 border border-white/10 px-3 py-2 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="RUT (12.345.678-9)"
                value={rut}
                onChange={(e) => setRut(formatRutCapped(e.target.value))}
                required
                maxLength={12}
                aria-invalid={rut ? String(!validateRut(rut)) : undefined}
                className="w-full rounded-md bg-black/20 border border-white/10 px-3 py-2 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              {rut && !validateRut(rut) && (
                <p className="mt-1 text-xs text-red-400">RUT inválido</p>
              )}
            </div>
            <div>
              <input
                type="email"
                placeholder="CORREO"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md bg-black/20 border border-white/10 px-3 py-2 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wide text-white/80 mb-1">
                DOCUMENTACIÓN DE PATENTE
              </label>
              <label className="block w-full rounded-md border border-dashed border-white/20 bg-black/20 px-3 py-3 text-white/80 cursor-pointer hover:border-white/30">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                {file ? file.name : "Subir archivo"}
              </label>
            </div>
          </div>

          {sent === "ok" && (
            <p className="mt-3 text-green-400 text-sm">Solicitud enviada correctamente.</p>
          )}
          {sent === "err" && (
            <p className="mt-3 text-red-400 text-sm">Ocurrió un error. Inténtalo nuevamente.</p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="mt-6 w-full rounded-md bg-[#AC2734] hover:bg-[#C92F3F] py-3 font-semibold uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? "Enviando..." : "Enviar"}
          </button>

          <div className="mt-4 text-center text-white/80 text-sm">
            ¿Ya cuentas con un usuario?{' '}
            <Link href="/auth/login/ingresar" className="underline hover:text-white">
              Ingresar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
