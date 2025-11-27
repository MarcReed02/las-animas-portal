"use client";

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
  Sun,
  Moon,
  LogIn
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { hashPassword } from '@/lib/password';

export default function LoginPage() {
  // --- ESTADO Y LÓGICA DE AUTENTICACIÓN ---
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { theme: nextTheme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = identifier.trim().toLowerCase();
      let hashedPassword: string | null = null;

      try {
        hashedPassword = await hashPassword(password);
      } catch (hashError) {
        console.warn('[login] no se pudo calcular hash', hashError);
      }

      let signInData = null;
      let authError = null;

      if (hashedPassword) {
        const hashedAttempt = await supabase.auth.signInWithPassword({
          email,
          password: hashedPassword,
        });

        if (hashedAttempt.error) {
          // Fallback to plain password
          const plainAttempt = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          signInData = plainAttempt.data;
          authError = plainAttempt.error;
        } else {
          signInData = hashedAttempt.data;
          authError = null;
        }
      } else {
        const plainAttempt = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        signInData = plainAttempt.data;
        authError = plainAttempt.error;
      }

      if (authError) {
        // Check for pending request
        const { data: pendingData } = await supabase
          .from('solicitudes_registro')
          .select('estado')
          .eq('correo', email)
          .eq('estado', 'pendiente')
          .maybeSingle();

        if (pendingData) {
          setError('Tu solicitud aún está en revisión. Te avisaremos cuando sea aprobada.');
          return;
        }

        // Check if user exists
        const { data: userData } = await supabase
          .from('usuarios')
          .select('id')
          .eq('correo', email)
          .maybeSingle();

        if (!userData) {
          setError('No encontramos una cuenta con ese correo. Revisa si lo escribiste bien o crea una solicitud nueva.');
        } else {
          setError('Contraseña incorrecta. Intenta nuevamente o restablece tu contraseña.');
        }
        return;
      }

      // Successful login
      const { data: userDetails } = await supabase.auth.getUser();
      const uid = userDetails?.user?.id;

      if (uid) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('rol, estado')
          .eq('id', uid)
          .single();

        if (perfil?.rol === 'admin') {
          router.push('/admin');
          return;
        }

        if (perfil?.estado && perfil.estado !== 'activo') {
          setError('Tu cuenta no está activa.');
          return;
        }
      }

      router.push('/');
      router.refresh();

    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // --- TEMA DE COLORES (ADAPTADO DEL CÓDIGO PROPORCIONADO) ---
  const themeStyles = {
    bgSide: isDarkMode ? 'bg-[#171717]' : 'bg-gray-50',
    textPrimary: isDarkMode ? 'text-[#EDEDED]' : 'text-[#111827]',
    textSecondary: isDarkMode ? 'text-[#EDEDED]/50' : 'text-gray-500',
    textLabel: isDarkMode ? 'text-[#EDEDED]' : 'text-[#111827]',

    inputBg: isDarkMode ? 'bg-[#1F1F1F]' : 'bg-white',
    inputBorder: isDarkMode ? 'border-[#333333]' : 'border-gray-300',
    // Restauramos el foco Rojo
    inputFocus: 'focus:border-[#DA0037] focus:ring-[#DA0037]',

    toggleBg: isDarkMode ? 'bg-[#1F1F1F] hover:bg-[#2A2A2A]' : 'bg-white hover:bg-gray-100 border border-gray-200',

    // Iconos de inputs (Mail, Lock)
    iconColor: isDarkMode ? 'text-[#EDEDED]' : 'text-gray-400',
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen w-full flex font-sans ${themeStyles.bgSide} transition-colors duration-500 ease-in-out`}>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');
      `}</style>

      {/* --- COLUMNA IZQUIERDA: IMAGEN DE MARCA (Solo Desktop) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#171717]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60 grayscale transition-all duration-500"></div>

        {/* Overlay con el ROJO original sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#DA0037]/40 to-[#171717]/90 mix-blend-multiply transition-all duration-500"></div>

        <div className="relative z-10 w-full h-full flex flex-col justify-between p-16 text-[#EDEDED]">
          <div>
            <span className="text-3xl font-black tracking-tighter leading-none text-white">PORTAL</span>
            <br />
            {/* "ANIMAS" vuelve a Rojo */}
            <span className="text-sm font-bold tracking-[0.4em] text-[#DA0037]">ANIMAS</span>
          </div>

          <div className="mb-12">
            <blockquote className="text-2xl font-medium leading-relaxed mb-4">
              "La plataforma centralizada para gestionar tu comercio y conectar con la comunidad de Las Ánimas."
            </blockquote>
            <p className="text-sm opacity-60 font-mono">
              — Cámara de Comercio y Turismo
            </p>
          </div>
        </div>
      </div>

      {/* --- COLUMNA DERECHA: FORMULARIO --- */}
      <div className="w-full lg:w-1/2 flex flex-col relative transition-colors duration-500 ease-in-out">

        {/* NAV SUPERIOR */}
        <div className="absolute top-0 left-0 w-full px-8 py-8 flex justify-between items-center z-20">
          {/* Link vuelve a tener hover Rojo */}
          <Link href="/" className={`flex items-center gap-2 text-sm font-medium ${themeStyles.textSecondary} hover:text-[#DA0037] transition-colors duration-300`}>
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Volver al sitio</span>
          </Link>

          {/* BOTÓN TOGGLE: AQUÍ APLICAMOS EL CAMBIO SOLICITADO */}
          {/* En Dark Mode usa text-[#EDEDED] (Blanco Hueso) en vez de Rojo */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full transition-all duration-500 ease-in-out ${themeStyles.toggleBg} ${isDarkMode ? 'text-[#EDEDED]' : 'text-gray-600'}`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* CENTRO DEL FORMULARIO */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-20 lg:px-24 xl:px-32">

          <div className="lg:hidden mb-10 text-center">
            <span className={`text-2xl font-black tracking-tighter ${themeStyles.textPrimary} transition-colors duration-500`}>PORTAL</span>
            <span className="text-xs font-bold tracking-[0.2em] text-[#DA0037] ml-2">ANIMAS</span>
          </div>

          <div className="mb-10">
            <h1 className={`text-3xl font-bold tracking-tight mb-2 ${themeStyles.textPrimary} transition-colors duration-500`}>
              Hola de nuevo
            </h1>
            <p className={`text-sm ${themeStyles.textSecondary} transition-colors duration-500`}>
              Ingresa tus credenciales para acceder al panel.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-wider ${themeStyles.textLabel} transition-colors duration-500`}>Correo Electrónico</label>
              <div className="relative">
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300 outline-none ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.inputFocus} ${themeStyles.textPrimary}`}
                  placeholder="nombre@empresa.com"
                  required
                />
                <Mail size={18} className={`absolute left-3 top-3.5 ${themeStyles.iconColor} transition-colors duration-500`} />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className={`text-xs font-bold uppercase tracking-wider ${themeStyles.textLabel} transition-colors duration-500`}>Contraseña</label>
                {/* Link vuelve a ser Rojo */}
                <Link href="/auth/forgot-password" className="text-xs font-medium text-[#DA0037] hover:underline transition-colors duration-300">¿Olvidaste tu contraseña?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-all duration-300 outline-none ${themeStyles.inputBg} ${themeStyles.inputBorder} ${themeStyles.inputFocus} ${themeStyles.textPrimary}`}
                  placeholder="••••••••"
                  required
                />
                <Lock size={18} className={`absolute left-3 top-3.5 ${themeStyles.iconColor} transition-colors duration-500`} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3.5 ${themeStyles.iconColor} hover:text-[#DA0037] transition-colors duration-300`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 transition-all duration-500 ease-in-out">{error}</p>}

            {/* BOTÓN: Vuelve a ser Rojo Vibrante */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-[#DA0037] text-white font-bold shadow-lg shadow-[#DA0037]/20 hover:bg-[#b3002d] hover:shadow-[#DA0037]/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'INGRESANDO...' : 'INGRESAR'} <LogIn size={18} />
            </button>

          </form>

          <div className="mt-10 text-center">
            <p className={`text-sm ${themeStyles.textSecondary} transition-colors duration-500`}>
              ¿No tienes cuenta?{' '}
              {/* Link vuelve a ser Rojo */}
              <Link href="/auth/login" className="font-bold text-[#DA0037] hover:underline transition-colors duration-300">
                Regístrate gratis
              </Link>
            </p>
          </div>

        </div>

        <div className={`py-6 text-center lg:hidden text-xs ${themeStyles.textSecondary} opacity-50 transition-colors duration-500`}>
          © 2025 Portal Las Ánimas
        </div>

      </div>

    </div>
  );
}
