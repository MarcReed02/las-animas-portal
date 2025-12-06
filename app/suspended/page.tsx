
import Link from 'next/link';
import { ShieldAlert, Mail } from 'lucide-react';
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';

export default async function SuspendedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Double check status to avoid showing this if they were re-activated
  const { data: profile } = await supabase
    .from('usuarios')
    .select('estado')
    .eq('id', user.id)
    .single();

  if (profile?.estado === 'activo') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#18181b] flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-[#27272a] p-8 md:p-12 rounded-3xl border border-[#3f3f46] max-w-lg w-full shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-orange-600"></div>

        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-500/5">
          <ShieldAlert size={40} className="text-red-500" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Perfil Pausado
        </h1>
        <p className="text-red-400 font-medium mb-8 uppercase tracking-wider text-xs">
          Acceso Restringido
        </p>

        <div className="bg-[#18181b] rounded-xl p-6 text-left space-y-4 mb-8 border border-[#3f3f46]/50">
          <div className="flex items-start gap-3">
            <div className="min-w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <strong className="text-white block mb-0.5">Edición Deshabilitada</strong>
              No puedes editar tu perfil ni subir contenido nuevo mientras tu cuenta esté en pausa.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="min-w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
            <p className="text-gray-300 text-sm leading-relaxed">
              <strong className="text-white block mb-0.5">Anuncio Oculto</strong>
              Tu comercio y anuncios han sido ocultados de la vista pública hasta nuevo aviso.
            </p>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Si crees que esto es un error o necesitas reactivar tu cuenta, por favor ponte en contacto con la administración.
        </p>

        <div className="space-y-4">
          <a
            href="mailto:contacto@portalanimas.cl"
            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-[#DA0037] hover:bg-[#b0002c] text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 hover:shadow-red-900/40 hover:-translate-y-0.5"
          >
            <Mail size={18} />
            Contactar Soporte
          </a>

          <form action="/auth/signout" method="post">
            <button className="text-sm text-gray-500 hover:text-white transition-colors py-2 flex items-center justify-center gap-2 w-full">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-600 font-mono">
        ID: {user.id}
      </p>
    </div>
  );
}
