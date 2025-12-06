"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
  Clock,
  MapPin,
  Phone,
  Image as ImageIcon,
  Edit3,
  Save,
  Upload,
  X,
  Instagram,
  Facebook,
  Smartphone,
  Bell,
  Sun,
  Plus,
  User,
  Sparkles,
  AlertTriangle,
  Loader2,
  Twitter,
  Globe,
  LogOut
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import NavbarLogged from './navbar-logged';

// Icono TikTok personalizado
const TikTokIcon = ({ size = 18, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const XIcon = ({ size = 18, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

type BusinessData = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  website: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  twitter: string;
  photos: { id: string; url: string; orden?: number }[];
};

const DashboardInput = ({ label, value, onChange, icon: Icon, type = "text", fullWidth = false, disabled = false, delay = 0, isEditing, mounted }: any) => (
  <div
    className={`flex flex-col gap-2 ${fullWidth ? 'col-span-1 md:col-span-2' : 'col-span-1'} transition-all duration-700 ease-out transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider pl-1 transition-colors duration-300 group-focus-within:text-[#DA0037]">{label}</label>
    <div className={`relative flex items-center rounded-xl border transition-all duration-500 group
      ${disabled && !isEditing
        ? 'bg-transparent border-transparent px-0'
        : 'bg-[#27272a] border-[#3f3f46] hover:border-[#52525b] focus-within:border-[#DA0037] focus-within:bg-[#2d2d30] focus-within:shadow-[0_0_15px_rgba(218,0,55,0.15)] px-4'
      }`}>
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        disabled={!isEditing}
        className={`w-full bg-transparent text-[#f4f4f5] text-sm py-3 focus:outline-none placeholder-[#52525b] font-medium transition-all
          ${!isEditing ? 'pl-0 text-base' : ''}
        `}
      />
      {Icon && (
        <div className={`transition-all duration-300 transform group-focus-within:scale-110 ${isEditing ? 'text-[#71717a] group-focus-within:text-[#DA0037]' : 'text-[#DA0037]'}`}>
          <Icon size={18} />
        </div>
      )}
    </div>
    {!isEditing && <div className="h-px bg-[#27272a] w-full origin-left transform transition-transform duration-700 scale-x-100"></div>}
  </div>
);

const TimePicker = ({ value, onChange, disabled, label }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [hours24, minutes] = value ? value.split(':').map(Number) : [9, 0];
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;

  const updateTime = (h: number, m: number, p: string) => {
    let newH = h;
    if (p === 'PM' && newH < 12) newH += 12;
    if (p === 'AM' && newH === 12) newH = 0;
    onChange(`${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const mins = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  return (
    <div className={`relative group/time`}>
      <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-3 block pl-2 group-hover/time:text-[#DA0037] transition-colors">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[#202023] border border-[#27272a] rounded-2xl px-6 py-5 transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#DA0037] hover:shadow-[0_0_15px_rgba(218,0,55,0.1)] hover:-translate-y-1'}
          ${isOpen ? 'border-[#DA0037] ring-1 ring-[#DA0037]' : ''}
        `}
      >
        <span className="text-3xl text-white font-mono font-light tracking-wide">
          {hours12.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')} <span className="text-lg text-[#71717a] font-bold ml-1">{period}</span>
        </span>
        <Clock size={20} className={`transition-colors ${isOpen ? 'text-[#DA0037]' : 'text-[#52525b]'}`} />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
      >
        <div className="overflow-hidden min-h-0 bg-[#18181b] border border-[#27272a] rounded-xl flex h-64 ring-1 ring-white/10">
          {/* Hours */}
          <div className="flex-1 overflow-y-auto border-r border-[#27272a] scrollbar-hide">
            <div className="sticky top-0 bg-[#18181b] text-[10px] text-center py-2 text-[#71717a] font-bold uppercase border-b border-[#27272a] z-10">Hora</div>
            {hours.map(h => (
              <button key={h} onClick={() => updateTime(h, minutes, period)} className={`w-full py-3 text-center hover:bg-[#27272a] transition-colors ${h === hours12 ? 'text-[#DA0037] font-bold bg-[#27272a]' : 'text-[#a1a1aa]'}`}>
                {h.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
          {/* Minutes */}
          <div className="flex-1 overflow-y-auto border-r border-[#27272a] scrollbar-hide">
            <div className="sticky top-0 bg-[#18181b] text-[10px] text-center py-2 text-[#71717a] font-bold uppercase border-b border-[#27272a] z-10">Min</div>
            {mins.map(m => (
              <button key={m} onClick={() => updateTime(hours12, m, period)} className={`w-full py-3 text-center hover:bg-[#27272a] transition-colors ${m === minutes ? 'text-[#DA0037] font-bold bg-[#27272a]' : 'text-[#a1a1aa]'}`}>
                {m.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
          {/* Period */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="sticky top-0 bg-[#18181b] text-[10px] text-center py-2 text-[#71717a] font-bold uppercase border-b border-[#27272a] z-10">AM/PM</div>
            {periods.map(p => (
              <button key={p} onClick={() => updateTime(hours12, minutes, p)} className={`w-full py-3 text-center hover:bg-[#27272a] transition-colors ${p === period ? 'text-[#DA0037] font-bold bg-[#27272a]' : 'text-[#a1a1aa]'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>

  );
};

export default function BusinessDashboardClient({ initialData, user, categoryGroups }: { initialData: any, user: any, categoryGroups: { name: string; subs: string[] }[] }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Parse initial schedule
  const initialSchedule = initialData.horario ? JSON.parse(initialData.horario) : { days: [1, 2, 3, 4, 5], time: { start: "09:00", end: "18:00" } };

  const [selectedDays, setSelectedDays] = useState<number[]>(initialSchedule.days || []);
  const [scheduleTimes, setScheduleTimes] = useState(initialSchedule.time || { start: "09:00", end: "18:00" });

  // Initialize business data
  const [businessData, setBusinessData] = useState<BusinessData>({
    id: initialData.id,
    name: initialData.titulo || "",
    category: initialData.categoria_principal || "",
    subcategory: initialData.subcategoria || "",
    description: initialData.descripcion || "",
    address: initialData.direccion || "",
    phone: initialData.telefono_snapshot || initialData.contacto_telefono || "",
    whatsapp: initialData.whatsapp || initialData.contacto_whatsapp || "",
    website: initialData.contacto_web || "",
    instagram: initialData.instagram || initialData.contacto_instagram || "",
    facebook: initialData.facebook || initialData.contacto_facebook || "",
    tiktok: initialData.tiktok || initialData.contacto_tiktok || "",
    twitter: initialData.contacto_twitter || "",
    photos: initialData.anuncio_solicitud_imagenes?.map((img: any) => ({
      id: img.id || Math.random().toString(36).substr(2, 9),
      url: img.url,
      orden: img.orden
    })) || []
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMainAction = () => {
    if (isEditing) {
      setShowSaveModal(true);
    } else {
      setIsEditing(true);
    }
  };

  const confirmSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        id: businessData.id,
        titulo: businessData.name,
        categoria_principal: businessData.category,
        subcategoria: businessData.subcategory,
        descripcion: businessData.description,
        direccion: businessData.address,
        telefono_snapshot: businessData.phone,
        contacto_whatsapp: businessData.whatsapp,
        contacto_web: businessData.website,
        contacto_instagram: businessData.instagram,
        contacto_facebook: businessData.facebook,
        contacto_tiktok: businessData.tiktok,
        contacto_twitter: businessData.twitter,
        horario: JSON.stringify({ days: selectedDays, time: scheduleTimes }),
        imagenes: businessData.photos.map((p, index) => ({ url: p.url, orden: index }))
      };

      const response = await fetch('/api/anuncios/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const status = response.status;
        const text = await response.text();
        console.error(`Server Error (${status}):`, text);

        let errorMsg = 'Error al guardar';
        try {
          const json = JSON.parse(text);
          errorMsg = json.error || errorMsg;
        } catch (e) {
          // Not JSON, probably HTML error page
          errorMsg = `Error del servidor (${status})`;
        }
        throw new Error(errorMsg);
      }

      setIsEditing(false);
      setShowSaveModal(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelSave = () => {
    setShowSaveModal(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  // --- LÓGICA DE HORARIOS ---
  const daysOfWeek = [
    { id: 1, label: 'L', name: 'Lunes' },
    { id: 2, label: 'M', name: 'Martes' },
    { id: 3, label: 'X', name: 'Miércoles' },
    { id: 4, label: 'J', name: 'Jueves' },
    { id: 5, label: 'V', name: 'Viernes' },
    { id: 6, label: 'S', name: 'Sábado' },
    { id: 0, label: 'D', name: 'Domingo' },
  ];

  const toggleDay = (id: number) => {
    if (!isEditing) return;
    setSelectedDays(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const getScheduleLabel = () => {
    if (selectedDays.length === 0) return "Cerrado temporalmente";
    if (selectedDays.length === 5 && !selectedDays.includes(0) && !selectedDays.includes(6)) return "Lunes a Viernes";
    if (selectedDays.length === 7) return "Todos los días";
    return "Personalizado";
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Upload logic
      const newPhotos: { id: string; url: string; orden?: number }[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        formData.append('file', file);
        formData.append('path', filePath);

        try {
          const res = await fetch('/api/anuncios/upload', {
            method: 'POST',
            body: formData
          });
          if (res.ok) {
            const { url } = await res.json();
            newPhotos.push({
              id: Math.random().toString(36).substr(2, 9),
              url: url
            });
          }
        } catch (err) {
          console.error("Upload failed", err);
        }
      }
      setBusinessData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
    }
  };

  const removePhoto = (id: string) => {
    setBusinessData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id)
    }));
  };

  const getChanges = () => {
    const changes = [];
    const normalize = (val: any) => val === null || val === undefined ? "" : String(val).trim();

    if (normalize(businessData.name) !== normalize(initialData.titulo)) changes.push({ label: "Nombre Comercial", old: initialData.titulo, new: businessData.name });
    if (normalize(businessData.category) !== normalize(initialData.categoria_principal)) changes.push({ label: "Categoría", old: initialData.categoria_principal, new: businessData.category });
    if (normalize(businessData.subcategory) !== normalize(initialData.subcategoria)) changes.push({ label: "Subcategoría", old: initialData.subcategoria, new: businessData.subcategory });
    if (normalize(businessData.description) !== normalize(initialData.descripcion)) changes.push({ label: "Descripción", old: "...", new: "Texto actualizado" });
    if (normalize(businessData.address) !== normalize(initialData.direccion)) changes.push({ label: "Dirección", old: initialData.direccion, new: businessData.address });

    const contactFields = [
      { key: 'phone', dbKey: 'telefono_snapshot', label: 'Teléfono', fallbackDbKey: 'contacto_telefono' },
      { key: 'whatsapp', dbKey: 'contacto_whatsapp', label: 'WhatsApp' },
      { key: 'website', dbKey: 'contacto_web', label: 'Sitio Web' },
      { key: 'instagram', dbKey: 'contacto_instagram', label: 'Instagram' },
      { key: 'facebook', dbKey: 'contacto_facebook', label: 'Facebook' },
      { key: 'tiktok', dbKey: 'contacto_tiktok', label: 'TikTok' },
      { key: 'twitter', dbKey: 'contacto_twitter', label: 'X (Twitter)' },
    ];

    contactFields.forEach(field => {
      // @ts-ignore
      const currentVal = normalize(businessData[field.key]);
      const initialVal = normalize(initialData[field.dbKey] || (field.fallbackDbKey ? initialData[field.fallbackDbKey] : ""));
      if (currentVal !== initialVal) changes.push({ label: field.label, old: initialVal || "(vacío)", new: currentVal || "(vacío)" });
    });

    const currentSchedule = JSON.stringify({ days: selectedDays.sort(), time: scheduleTimes });
    let initialScheduleNormalized = "";
    try {
      const parsed = initialData.horario ? JSON.parse(initialData.horario) : { days: [], time: { start: "", end: "" } };
      if (parsed.days) parsed.days.sort();
      initialScheduleNormalized = JSON.stringify(parsed);
    } catch (e) { initialScheduleNormalized = JSON.stringify({ days: [], time: { start: "", end: "" } }); }

    if (currentSchedule !== initialScheduleNormalized) changes.push({ label: "Horario", old: "Anterior", new: "Actualizado" });

    const initialPhotoIds = new Set(initialData.anuncio_solicitud_imagenes?.map((img: any) => img.id) || []);
    const currentPhotoIds = new Set(businessData.photos.map(p => p.id));
    let photosChanged = false;
    if (initialPhotoIds.size !== currentPhotoIds.size) photosChanged = true;
    else { for (let id of currentPhotoIds) { if (!initialPhotoIds.has(id)) { photosChanged = true; break; } } }
    if (photosChanged) changes.push({ label: "Fotos", old: `${initialPhotoIds.size} fotos`, new: `${currentPhotoIds.size} fotos` });

    return changes;
  };

  const changesList = getChanges();

  return (
    <div className="min-h-screen bg-[#121212] font-sans text-[#f4f4f5] flex flex-col overflow-x-hidden selection:bg-[#DA0037] selection:text-white">

      {/* --- GLOBAL NAVBAR --- */}
      <NavbarLogged user={user} />

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-6 lg:p-12 pt-24 lg:pt-32 space-y-16">

        {/* HEADER CONTEXTUAL */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#27272a] pb-8 transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Configuración del Negocio</h1>
            <p className="text-[#a1a1aa] max-w-xl text-lg leading-relaxed">
              Administra la información pública de <span className="text-white font-semibold relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-[#DA0037] after:scale-x-0 after:origin-left after:transition-transform after:duration-500 hover:after:scale-x-100 cursor-default">{businessData.name}</span>.
            </p>
          </div>
          <button
            onClick={handleMainAction}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:-translate-y-1 active:scale-95
              ${isEditing
                ? 'bg-[#DA0037] text-white shadow-[#DA0037]/30 hover:bg-[#b0002c]'
                : 'bg-[#27272a] text-[#f4f4f5] hover:bg-[#333] border border-[#3f3f46] hover:border-[#71717a]'
              }`}
          >
            {isEditing ? <Save size={18} className="animate-bounce-in" /> : <Edit3 size={18} />}
            <span className="transition-all">{isEditing ? 'Guardar Cambios' : 'Editar Ficha'}</span>
          </button>
        </div>

        {/* 1. FICHA PÚBLICA */}
        <section className={`space-y-8 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#27272a] rounded-lg text-[#DA0037] shadow-lg shadow-[#DA0037]/10">
              <Store size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Información General</h2>
          </div>

          <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-8 shadow-2xl hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-shadow duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Identidad */}
              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DashboardInput label="Nombre Comercial" value={businessData.name} onChange={(e: any) => setBusinessData({ ...businessData, name: e.target.value })} fullWidth delay={300} isEditing={isEditing} mounted={mounted} />

                  {/* Category Selector */}
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <div className={`transition-all duration-700 delay-350 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider pl-1 block mb-2 transition-colors group-focus-within:text-[#DA0037]">Categoría Principal</label>
                      {isEditing ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {categoryGroups?.map((group) => (
                            <button
                              key={group.name}
                              onClick={() => setBusinessData({ ...businessData, category: group.name, subcategory: '' })}
                              className={`relative overflow-hidden p-3 rounded-xl border text-left text-xs font-medium transition-all duration-300 flex flex-col justify-between min-h-[70px] group
                                ${businessData.category === group.name
                                  ? 'bg-[#27272a] border-[#DA0037] text-white shadow-[0_0_15px_rgba(218,0,55,0.15)] scale-[1.02]'
                                  : 'bg-[#202023] border-transparent text-[#71717a] hover:bg-[#27272a] hover:text-[#f4f4f5]'}`}
                            >
                              <span className={`relative z-10 transition-transform duration-300 ${businessData.category === group.name ? 'translate-x-1' : ''}`}>{group.name}</span>
                              {businessData.category === group.name && (
                                <div className="absolute bottom-2 right-2 text-[#DA0037]">
                                  <Sparkles size={12} className="animate-spin" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full bg-[#27272a] border border-[#3f3f46] rounded-xl px-4 py-3 text-sm text-[#f4f4f5] font-medium">
                          {businessData.category || "Sin categoría"}
                        </div>
                      )}
                    </div>

                    {/* Subcategory Selector */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${businessData.category ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider pl-1 block mb-2 transition-colors group-focus-within:text-[#DA0037]">Subcategoría</label>
                      {isEditing ? (
                        <div className="bg-[#202023] border border-[#27272a] rounded-xl p-4 flex flex-wrap gap-2">
                          {categoryGroups?.find(g => g.name === businessData.category)?.subs.map((sub, idx) => (
                            <button
                              key={sub}
                              onClick={() => setBusinessData({ ...businessData, subcategory: sub })}
                              className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 border font-medium
                                ${businessData.subcategory === sub
                                  ? 'bg-[#f4f4f5] text-[#18181b] border-[#DA0037] shadow-lg scale-105'
                                  : 'bg-[#27272a] text-[#a1a1aa] border-[#3f3f46] hover:text-white hover:border-[#52525b]'
                                }`}
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full bg-[#27272a] border border-[#3f3f46] rounded-xl px-4 py-3 text-sm text-[#f4f4f5] font-medium">
                          {businessData.subcategory || "Sin subcategoría"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider pl-1 block mb-2 transition-colors group-focus-within:text-[#DA0037]">Descripción</label>
                  <div className={`relative rounded-xl border transition-all duration-300 ${!isEditing ? 'border-transparent' : 'border-[#3f3f46] bg-[#27272a] focus-within:border-[#DA0037] focus-within:bg-[#2d2d30]'}`}>
                    <textarea
                      disabled={!isEditing}
                      value={businessData.description}
                      onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                      rows={4}
                      className="w-full rounded-xl p-4 text-sm text-[#f4f4f5] focus:outline-none bg-transparent resize-none leading-relaxed transition-colors"
                    />
                  </div>
                  {!isEditing && <div className="h-px bg-[#27272a] w-full"></div>}
                </div>
                <DashboardInput label="Dirección Física" value={businessData.address} onChange={(e: any) => setBusinessData({ ...businessData, address: e.target.value })} icon={MapPin} fullWidth delay={550} isEditing={isEditing} mounted={mounted} />
              </div>

              {/* Divisor */}
              <div className="hidden lg:block w-px bg-[#27272a]"></div>

              {/* Contacto */}
              <div className="lg:col-span-4 space-y-5">
                <DashboardInput label="Teléfono" value={businessData.phone} onChange={(e: any) => setBusinessData({ ...businessData, phone: e.target.value })} icon={Phone} delay={600} isEditing={isEditing} mounted={mounted} />
                <DashboardInput label="WhatsApp" value={businessData.whatsapp} onChange={(e: any) => setBusinessData({ ...businessData, whatsapp: e.target.value })} icon={Smartphone} delay={650} isEditing={isEditing} mounted={mounted} />
                <DashboardInput label="Sitio Web" value={businessData.website} onChange={(e: any) => setBusinessData({ ...businessData, website: e.target.value })} icon={Globe} delay={700} isEditing={isEditing} mounted={mounted} />
                <div className="h-px bg-[#27272a] w-full my-2"></div>

                {/* Redes Sociales - Lista Vertical */}
                <div className="grid grid-cols-1 gap-4">
                  <DashboardInput label="Instagram" value={businessData.instagram} onChange={(e: any) => setBusinessData({ ...businessData, instagram: e.target.value })} icon={Instagram} delay={750} isEditing={isEditing} mounted={mounted} />
                  <DashboardInput label="Facebook" value={businessData.facebook} onChange={(e: any) => setBusinessData({ ...businessData, facebook: e.target.value })} icon={Facebook} delay={800} isEditing={isEditing} mounted={mounted} />
                  <DashboardInput label="TikTok" value={businessData.tiktok} onChange={(e: any) => setBusinessData({ ...businessData, tiktok: e.target.value })} icon={TikTokIcon} delay={850} isEditing={isEditing} mounted={mounted} />
                  <DashboardInput label="X" value={businessData.twitter} onChange={(e: any) => setBusinessData({ ...businessData, twitter: e.target.value })} icon={XIcon} delay={900} isEditing={isEditing} mounted={mounted} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. HORARIOS DE ATENCIÓN */}
        <section className={`space-y-8 transition-all duration-1000 delay-300 relative z-30 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-[#DA0037] rounded-full shadow-[0_0_10px_#DA0037]"></div>
            <div>
              <h2 className="text-2xl font-bold text-white">Horarios de Atención</h2>
              <p className="text-sm text-[#71717a]">Selecciona los días que abres y define tu horario.</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-[#18181b] border border-[#27272a] rounded-3xl shadow-2xl overflow-hidden group-hover:border-[#333] transition-colors pointer-events-none">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#DA0037] opacity-[0.03] blur-[100px] rounded-full group-hover:opacity-[0.05] transition-opacity duration-700"></div>
            </div>

            <div className="relative z-10 p-10">
              <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-[#71717a] uppercase tracking-widest">Días Operativos</span>
                  <span className="text-sm font-medium text-[#DA0037] animate-pulse">{getScheduleLabel()}</span>
                </div>

                <div className="flex flex-wrap justify-between gap-4">
                  {daysOfWeek.map((day, idx) => {
                    const isSelected = selectedDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        onClick={() => toggleDay(day.id)}
                        disabled={!isEditing}
                        style={{ transitionDelay: `${idx * 50}ms` }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-base font-bold transition-all duration-500 ease-out transform
                        ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                        ${isSelected
                            ? 'bg-[#DA0037] text-white shadow-[0_0_25px_rgba(218,0,55,0.5)] scale-110 border-2 border-[#ff4d6d] z-10'
                            : 'bg-[#202023] text-[#52525b] border-2 border-[#27272a] hover:border-[#3f3f46] hover:text-[#a1a1aa]'
                          }
                        ${!isEditing && !isSelected ? 'opacity-30 grayscale' : ''}
                      `}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={`transition-all duration-700 ease-in-out ${selectedDays.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-4 grayscale pointer-events-none'}`}>
                <div className="text-center mb-8 relative">
                  <span className="text-xs font-bold text-[#52525b] uppercase tracking-widest bg-[#18181b] px-4 relative z-10">Definir Horario</span>
                  <div className="h-px bg-[#27272a] absolute top-1/2 left-0 w-full -z-0"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                  <TimePicker
                    label="Apertura"
                    value={scheduleTimes.start}
                    onChange={(val: string) => setScheduleTimes({ ...scheduleTimes, start: val })}
                    disabled={!isEditing}
                  />
                  <TimePicker
                    label="Cierre"
                    value={scheduleTimes.end}
                    onChange={(val: string) => setScheduleTimes({ ...scheduleTimes, end: val })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="mt-10 flex justify-center items-center gap-3 animate-fade-in">
                  <div className={`w-2.5 h-2.5 rounded-full ${scheduleTimes.start && scheduleTimes.end ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-[#3f3f46]'}`}></div>
                  <span className="text-sm text-[#a1a1aa] font-medium">
                    {scheduleTimes.start && scheduleTimes.end
                      ? `Horario establecido: ${scheduleTimes.start} - ${scheduleTimes.end}`
                      : "Define apertura y cierre"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. GALERÍA DE FOTOS */}
        <section className={`space-y-8 pb-12 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#27272a] rounded-lg text-[#DA0037] shadow-lg shadow-[#DA0037]/10">
                <ImageIcon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Galería del Negocio</h2>
                <p className="text-sm text-[#71717a]">Imágenes visibles en tu perfil.</p>
              </div>
            </div>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-[#DA0037] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#b0002c] transition-all hover:-translate-y-1 shadow-lg shadow-[#DA0037]/20 active:scale-95"
              >
                <Upload size={16} /> Subir Nueva
              </button>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handlePhotoUpload} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {isEditing && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-3xl border-2 border-dashed border-[#3f3f46] hover:border-[#DA0037] hover:bg-[#202023] transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer group animate-fade-in"
              >
                <div className="p-4 bg-[#27272a] rounded-full group-hover:bg-[#DA0037] transition-colors duration-300 group-hover:shadow-[0_0_20px_rgba(218,0,55,0.4)]">
                  <Plus size={24} className="text-[#a1a1aa] group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-xs font-bold text-[#52525b] group-hover:text-white uppercase tracking-wider transition-colors">Agregar</span>
              </div>
            )}

            {businessData.photos.map((photo, idx) => (
              <div
                key={photo.id}
                className={`relative aspect-square rounded-3xl overflow-hidden group bg-[#202023] border border-[#27272a] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1
                  ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
                `}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <img src={photo.url} alt="Business" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />

                {isEditing ? (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="p-3 bg-[#DA0037] hover:bg-[#b0002c] rounded-full text-white shadow-xl transition-all hover:scale-110 hover:rotate-90"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <span className="text-xs text-white font-bold flex items-center gap-2"><Sparkles size={14} className="text-[#DA0037] animate-pulse" /> Ampliar</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* --- CONFIRMATION OVERLAY MODAL --- */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 opacity-100">

            {/* Modal Header */}
            <div className="p-6 border-b border-[#27272a] flex items-center gap-4 bg-[#202023]/50">
              <div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                <AlertTriangle size={24} className="text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Guardar cambios?</h3>
                <p className="text-xs text-[#a1a1aa]">Revisa los cambios antes de confirmar.</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scroll">
              {changesList.length === 0 ? (
                <p className="text-sm text-[#a1a1aa] text-center italic">No se han detectado cambios.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#71717a] uppercase tracking-wider font-bold">Resumen de cambios:</p>
                  <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] overflow-hidden">
                    {changesList.map((change, idx) => (
                      <div key={idx} className="p-3 border-b border-[#3f3f46] last:border-0 flex flex-col gap-1">
                        <span className="text-xs font-bold text-[#DA0037]">{change.label}</span>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#71717a] line-through truncate max-w-[40%]">{change.old}</span>
                          <span className="text-[#52525b]">→</span>
                          <span className="text-white font-medium truncate max-w-[45%]">{change.new}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={cancelSave}
                className="flex-1 px-4 py-3 rounded-xl border border-[#3f3f46] text-[#a1a1aa] text-sm font-bold hover:bg-[#27272a] hover:text-white transition-colors"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={confirmSave}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl bg-[#DA0037] hover:bg-[#b0002c] text-white text-sm font-bold transition-colors shadow-lg shadow-[#DA0037]/20 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .animate-swing {
          animation: swing 2s ease-in-out infinite;
          transform-origin: top center;
        }
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
