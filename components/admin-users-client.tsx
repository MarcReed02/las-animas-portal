"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRut } from "@/lib/rut";
import {
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  Shield,
  ShieldOff,
  User as UserIcon,
  Loader2,
  X
} from "lucide-react";

type UserRow = {
  id: string;
  nombres: string | null;
  apellidos: string | null;
  rut: string | null;
  correo: string;
  telefono: string | null;
  rol: string;
  estado: "activo" | "suspendido";
};

// --- CONFIRMATION MODAL COMPONENT ---
type ConfirmationModalProps = {
  isOpen: boolean;
  type: "suspend" | "activate" | "delete" | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
};

const ConfirmationModal = ({ isOpen, type, onClose, onConfirm, loading }: ConfirmationModalProps) => {
  if (!isOpen || !type) return null;

  const config = {
    suspend: {
      title: "Suspender Usuario",
      description: "El usuario perderá acceso inmediato al dashboard y sus anuncios dejarán de ser visibles públicamente.",
      confirmText: "Suspender Cuenta",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      btnColor: "bg-yellow-600 hover:bg-yellow-500",
      icon: ShieldOff
    },
    activate: {
      title: "Reactivar Usuario",
      description: "El usuario recuperará el acceso al dashboard y sus anuncios volverán a ser visibles.",
      confirmText: "Reactivar Cuenta",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      btnColor: "bg-green-600 hover:bg-green-500",
      icon: Shield
    },
    delete: {
      title: "Eliminar Usuario",
      description: "Esta acción es IRREVERSIBLE. Se eliminará permanentemente al usuario y todos sus datos asociados.",
      confirmText: "Eliminar Definitivamente",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      btnColor: "bg-[#DA0037] hover:bg-red-600",
      icon: Trash2
    }
  }[type];

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-md bg-[#18181b] border ${config.borderColor} rounded-2xl shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 overflow-hidden`}>

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#27272a]">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${config.color}`}>
            <Icon size={24} />
            {config.title}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 mb-4 flex gap-3 text-sm`}>
            <AlertTriangle className={`shrink-0 ${config.color}`} size={20} />
            <p className="text-gray-300 leading-relaxed font-medium">
              {config.description}
            </p>
          </div>
          <p className="text-xs text-gray-500 text-center">
            ¿Estás seguro de que deseas continuar?
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#27272a] bg-[#27272a]/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-[#27272a] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${config.btnColor}`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {config.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminUsersClient({ users: initialUsers }: { users: UserRow[] }) {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"suspend" | "activate" | "delete" | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${u.nombres || ""} ${u.apellidos || ""}`.toLowerCase();
    return (
      fullName.includes(term) ||
      u.correo.toLowerCase().includes(term) ||
      (u.rut && u.rut.toLowerCase().includes(term))
    );
  });

  const openModal = (type: "suspend" | "activate" | "delete", userId: string) => {
    setModalType(type);
    setSelectedUser(userId);
    setModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !modalType) return;

    setLoading(true);
    try {
      if (modalType === "delete") {
        await fetch(`/api/admin/users?userId=${selectedUser}`, { method: "DELETE" });
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser));
      } else {
        const newStatus = modalType === "activate" ? "activo" : "suspendido";
        await fetch("/api/admin/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: selectedUser, estado: newStatus }),
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser ? { ...u, estado: newStatus } : u))
        );
      }
      router.refresh();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto text-white font-sans">
      <ConfirmationModal
        isOpen={modalOpen}
        type={modalType}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmAction}
        loading={loading}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h2 className="text-[#DA0037] text-xs font-bold uppercase tracking-[0.2em] mb-2">Administración</h2>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
            Controla el acceso y estado de los usuarios registrados en la plataforma.
          </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#18181b] border border-[#3f3f46] text-white rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-[#DA0037] focus:ring-1 focus:ring-[#DA0037] transition-all placeholder-gray-600 shadow-sm"
          />
          <Search className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-[#DA0037] transition-colors" size={18} />
        </div>
      </div>

      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#27272a] text-gray-400 text-[10px] uppercase tracking-widest border-b border-[#3f3f46]">
                <th className="p-5 font-bold">Usuario</th>
                <th className="p-5 font-bold">Contacto & Info</th>
                <th className="p-5 font-bold text-center">Estado</th>
                <th className="p-5 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <UserIcon size={48} className="opacity-20" />
                      <p className="font-medium">No se encontraron usuarios</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#202023] transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${user.estado === 'activo'
                            ? 'bg-gradient-to-br from-[#DA0037] to-[#990026] text-white'
                            : 'bg-[#333] text-gray-500'
                          }`}>
                          <UserIcon size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-base leading-tight">
                            {user.nombres} {user.apellidos}
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono mt-1 tracking-wide uppercase">ID: {user.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <span className="w-16 text-gray-500 font-medium text-[10px] uppercase">Email</span>
                          {user.correo}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <span className="w-16 text-gray-500 font-medium text-[10px] uppercase">RUT</span>
                          {formatRut(user.rut || "")}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <span className="w-16 text-gray-500 font-medium text-[10px] uppercase">Teléfono</span>
                          {user.telefono || <span className="text-gray-600 italic">No registrado</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center align-middle">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.estado === "activo"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}
                        >
                          {user.estado === "activo" ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          {user.estado === "activo" ? "Activo" : "Suspendido"}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal(user.estado === "activo" ? "suspend" : "activate", user.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border shadow-sm ${user.estado === "activo"
                              ? "bg-[#27272a] text-gray-300 border-[#3f3f46] hover:border-yellow-500/50 hover:text-yellow-500 hover:bg-yellow-500/5"
                              : "bg-[#27272a] text-gray-300 border-[#3f3f46] hover:border-green-500/50 hover:text-green-500 hover:bg-green-500/5"
                            }`}
                        >
                          {user.estado === "activo" ? (
                            <>
                              <ShieldOff size={14} /> Suspender
                            </>
                          ) : (
                            <>
                              <Shield size={14} /> Reactivar
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => openModal("delete", user.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#27272a] text-gray-300 border border-[#3f3f46] hover:border-[#DA0037]/50 hover:text-[#DA0037] hover:bg-[#DA0037]/5 transition-all shadow-sm"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-[#202023] p-4 border-t border-[#27272a] flex justify-between items-center text-xs text-gray-500">
          <span>{filteredUsers.length} usuarios registrados</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Activos
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div> Suspendidos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
