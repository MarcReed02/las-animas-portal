"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import {
  Store,
  CheckCircle2,
  LayoutGrid,
  ArrowRight,
  Sparkles,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Smartphone,
  MousePointer2,
  Twitter,
  ChevronRight,
  Check,
  MapPin,
  Image as ImageIcon,
  Upload,
  X,
  Plus,
  Clock,
  CalendarDays
} from 'lucide-react';
import NavbarLogged from './navbar-logged';
import { User } from '@supabase/supabase-js';
import Footer from './footer';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Icono personalizado de TikTok
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

// Componentes UI extraídos para evitar re-renders
const MinimalInput = ({
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
  type = "text",
  fullWidth = false,
  onFocus,
  onBlur,
  delay = 0,
  mounted,
  focusedField,
  setFocusedField,
  themeColors,
  error,
  touched
}: any) => (
  <div
    className={`flex flex-col gap-2 ${fullWidth ? 'col-span-1 md:col-span-2' : 'col-span-1'} transition-all duration-700 ease-out transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className="flex justify-between items-center">
      <label className={`text-xs font-semibold ${themeColors.textSecondary} uppercase tracking-wider pl-1 transition-colors duration-300 group-focus-within:text-[#DA0037] ${touched && error ? 'text-red-500' : ''}`}>
        {label}
      </label>
      {touched && error && (
        <span className="text-[10px] text-red-500 font-medium animate-fade-in">{error}</span>
      )}
    </div>
    <div className="relative group">
      <div className={`absolute inset-0 bg-[#DA0037] rounded-xl opacity-0 transition-opacity duration-300 ${focusedField === label ? 'opacity-10 blur-md' : ''}`}></div>
      <div className={`relative flex items-center ${themeColors.bgTertiary} rounded-xl border transition-all duration-300 ${touched && error ? 'border-red-500' : focusedField === label ? `border-[#DA0037] bg-gray-200 dark:bg-[#2d2d30] shadow-lg` : `border-transparent ${themeColors.borderSecondary} ${themeColors.hoverBg}`}`}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => { if (onFocus) onFocus(); setFocusedField(label); }}
          onBlur={(e) => { if (onBlur) onBlur(e); setFocusedField(null); }}
          placeholder={placeholder}
          className={`w-full bg-transparent ${themeColors.textPrimary} text-sm px-4 py-4 focus:outline-none placeholder-gray-400 dark:placeholder-[#52525b] font-medium`}
        />
        {Icon && (
          <div className={`pr-4 transition-all duration-300 ${focusedField === label ? 'text-[#DA0037] scale-110' : themeColors.textTertiary}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
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
    <div className="relative group/time" ref={containerRef}>
      <label className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider mb-3 block pl-2 group-hover/time:text-[#DA0037] transition-colors">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white dark:bg-[#202023] border border-gray-200 dark:border-[#27272a] rounded-2xl px-6 py-5 transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#DA0037] hover:shadow-[0_0_15px_rgba(218,0,55,0.1)] hover:-translate-y-1'}
          ${isOpen ? 'border-[#DA0037] ring-1 ring-[#DA0037]' : ''}
        `}
      >
        <span className="text-3xl text-gray-900 dark:text-white font-mono font-light tracking-wide">
          {hours12.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')} <span className="text-lg text-gray-500 dark:text-[#71717a] font-bold ml-1">{period}</span>
        </span>
        <Clock size={20} className={`transition-colors ${isOpen ? 'text-[#DA0037]' : 'text-gray-400 dark:text-[#52525b]'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-xl shadow-2xl z-50 flex h-64 overflow-hidden animate-fade-in">
          {/* Hours */}
          <div className="flex-1 overflow-y-auto border-r border-gray-200 dark:border-[#27272a] scrollbar-hide">
            <div className="sticky top-0 bg-white dark:bg-[#18181b] text-[10px] text-center py-2 text-gray-500 dark:text-[#71717a] font-bold uppercase border-b border-gray-200 dark:border-[#27272a] z-10">Hora</div>
            {hours.map(h => (
              <button key={h} onClick={() => updateTime(h, minutes, period)} className={`w-full py-3 text-center hover:bg-gray-100 dark:hover:bg-[#27272a] transition-colors ${h === hours12 ? 'text-[#DA0037] font-bold bg-gray-100 dark:bg-[#27272a]' : 'text-gray-400 dark:text-[#a1a1aa]'}`}>
                {h.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
          {/* Minutes */}
          <div className="flex-1 overflow-y-auto border-r border-gray-200 dark:border-[#27272a] scrollbar-hide">
            <div className="sticky top-0 bg-white dark:bg-[#18181b] text-[10px] text-center py-2 text-gray-500 dark:text-[#71717a] font-bold uppercase border-b border-gray-200 dark:border-[#27272a] z-10">Min</div>
            {mins.map(m => (
              <button key={m} onClick={() => updateTime(hours12, m, period)} className={`w-full py-3 text-center hover:bg-gray-100 dark:hover:bg-[#27272a] transition-colors ${m === minutes ? 'text-[#DA0037] font-bold bg-gray-100 dark:bg-[#27272a]' : 'text-gray-400 dark:text-[#a1a1aa]'}`}>
                {m.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
          {/* Period */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="sticky top-0 bg-white dark:bg-[#18181b] text-[10px] text-center py-2 text-gray-500 dark:text-[#71717a] font-bold uppercase border-b border-gray-200 dark:border-[#27272a] z-10">AM/PM</div>
            {periods.map(p => (
              <button key={p} onClick={() => updateTime(hours12, minutes, p)} className={`w-full py-3 text-center hover:bg-gray-100 dark:hover:bg-[#27272a] transition-colors ${p === period ? 'text-[#DA0037] font-bold bg-gray-100 dark:bg-[#27272a]' : 'text-gray-400 dark:text-[#a1a1aa]'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function BusinessRegistrationWorkspace({ user, categoryGroups }: { user: User, categoryGroups: { name: string; subs: string[] }[] }) {
  // Estado Identidad
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');

  // Estado Horarios Flexible (NUEVO)
  // 0=Dom, 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // Sin días seleccionados por defecto
  const [scheduleTime, setScheduleTime] = useState({ start: '09:00', end: '18:00' });
  const [hasBreak, setHasBreak] = useState(false); // Opción para horario partido

  // Estado Fotos
  const [photos, setPhotos] = useState<{ id: string; url: string; name: string; file: File }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado Contacto
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [twitter, setTwitter] = useState('');

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Estado de Validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { resolvedTheme } = useTheme();
  const router = useRouter();


  useEffect(() => {
    setMounted(true);
  }, []);

  // Color variables based on theme
  // Color variables based on theme (using Tailwind dark mode modifiers)
  const bgPrimary = 'bg-gray-50 dark:bg-[#18181b]';
  const bgSecondary = 'bg-white dark:bg-[#202023]';
  const bgTertiary = 'bg-gray-100 dark:bg-[#27272a]';
  const textPrimary = 'text-gray-900 dark:text-[#f4f4f5]';
  const textSecondary = 'text-gray-600 dark:text-[#a1a1aa]';
  const textTertiary = 'text-gray-500 dark:text-[#71717a]';
  const borderPrimary = 'border-gray-200 dark:border-[#27272a]';
  const borderSecondary = 'border-gray-300 dark:border-[#3f3f46]';
  const hoverBg = 'hover:bg-gray-200 dark:hover:bg-[#323235]';

  const themeColors = {
    bgPrimary,
    bgSecondary,
    bgTertiary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderPrimary,
    borderSecondary,
    hoverBg
  };

  // Manejo de Fotos
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newPhotos = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        name: file.name,
        file: file
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Lógica de Días
  const daysOfWeek = [
    { id: 1, label: 'L', name: 'Lunes' },
    { id: 2, label: 'M', name: 'Martes' },
    { id: 3, label: 'X', name: 'Miércoles' },
    { id: 4, label: 'J', name: 'Jueves' },
    { id: 5, label: 'V', name: 'Viernes' },
    { id: 6, label: 'S', name: 'Sábado' },
    { id: 0, label: 'D', name: 'Domingo' },
  ];

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId].sort()
    );
  };

  const getScheduleSummary = () => {
    if (selectedDays.length === 0) return "Cerrado temporalmente";
    if (selectedDays.length === 7) return "Todos los días";
    if (selectedDays.length === 5 && selectedDays.includes(1) && selectedDays.includes(5)) return "Lunes a Viernes";
    // Lógica simple para rangos (ej. Lun-Jue)
    const isSequential = selectedDays.every((day, i, arr) => i === 0 || day === arr[i - 1] + 1);
    if (isSequential && selectedDays.length > 2) {
      const first = daysOfWeek.find(d => d.id === selectedDays[0])?.name;
      const last = daysOfWeek.find(d => d.id === selectedDays[selectedDays.length - 1])?.name;
      return `De ${first} a ${last}`;
    }
    return `${selectedDays.length} días seleccionados`;
  };

  const validateField = (name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'businessName':
        if (!value) error = 'El nombre es obligatorio';
        else if (value.length < 3) error = 'Mínimo 3 caracteres';
        break;
      case 'address':
        if (!value) error = 'La dirección es obligatoria';
        else if (value.length < 5) error = 'Dirección muy corta';
        break;
      case 'description':
        if (!value) error = 'La descripción es obligatoria';
        else if (value.length < 20) error = 'Mínimo 20 caracteres';
        break;
      case 'phone':
      case 'whatsapp':
        if (value && !/^\+56 9\d{8}$/.test(value)) error = 'Formato: +56 912345678';
        break;
      case 'website':
        if (value && !value.includes('.')) error = 'URL inválida';
        break;
      case 'scheduleStart':
      case 'scheduleEnd':
        if (selectedDays.length > 0 && !value) error = 'Requerido';
        break;
    }
    return error;
  };

  const handleBlur = (name: string, value: any) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: any, setter: any) => {
    setter(value);
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handlePhoneChange = (name: string, value: string, setter: any) => {
    // 1. Eliminar todo lo que no sea número
    let numericValue = value.replace(/\D/g, '');

    // 2. Si el usuario borra todo, restaurar el prefijo base "56" (para que se vea +56)
    if (!numericValue.startsWith('56')) {
      numericValue = '56';
    }

    // 3. Limitar a 11 dígitos (56 + 9 números)
    if (numericValue.length > 11) {
      numericValue = numericValue.slice(0, 11);
    }

    // 4. Formatear con el + y espacio
    const rest = numericValue.slice(2);
    const formattedValue = '+56 ' + rest;

    setter(formattedValue);

    if (touched[name]) {
      const error = validateField(name, formattedValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const supabase = createClient();

      // 1. Upload photos
      const uploadedImages = [];
      for (const photo of photos) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const formData = new FormData();
        formData.append('file', photo.file);
        formData.append('path', filePath);

        const uploadResponse = await fetch('/api/anuncios/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          console.error('Error uploading photo');
          continue;
        }

        const { url } = await uploadResponse.json();
        uploadedImages.push({ url });
      }

      // 2. Prepare payload
      const payload = {
        titulo: businessName,
        direccion: address,
        categoria_principal: category,
        subcategoria: subcategory,
        descripcion: description,
        horario: JSON.stringify({ days: selectedDays, time: scheduleTime }),
        telefono: phone,
        whatsapp: whatsapp,
        website: website,
        instagram: instagram,
        facebook: facebook,
        tiktok: tiktok,
        twitter: twitter,
        imagenes: uploadedImages,
        mostrar_telefono: true // Default to true for now
      };

      // 3. Send to API
      const response = await fetch('/api/anuncios/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la solicitud');
      }

      // 4. Success
      router.push('/'); // Redirect to home
      router.refresh();

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Hubo un error al enviar la solicitud. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cálculo de Progreso
  const calculateProgress = () => {
    let score = 0;
    if (businessName.length > 3) score += 15;
    if (address.length > 5) score += 10;
    if (category) score += 10;
    if (subcategory) score += 5;
    if (selectedDays.length > 0 && scheduleTime.start && scheduleTime.end) score += 15;
    if (description.length > 20) score += 15;
    if (photos.length > 0) score += 15;
    if (phone.length > 6 || whatsapp.length > 6 || website || instagram || facebook || tiktok || twitter) score += 15;
    return Math.min(score, 100);
  };

  const progress = calculateProgress();
  const hasContact = phone.length > 6 || whatsapp.length > 6 || website || instagram || facebook || tiktok || twitter;
  const hasSchedule = selectedDays.length > 0 && scheduleTime.start && scheduleTime.end;



  return (
    <div className={`min-h-screen ${themeColors.bgPrimary} font-sans ${themeColors.textPrimary} flex flex-col selection:bg-[#DA0037] selection:text-white overflow-x-hidden`}>

      {/* Background Ambient Light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-[#DA0037] opacity-[0.04] blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute top-[40%] -left-[10%] w-[30vw] h-[30vw] bg-indigo-500 opacity-[0.03] blur-[130px] rounded-full"></div>
      </div>

      {/* HEADER */}
      <NavbarLogged user={user} progress={progress} />

      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 p-6 lg:p-12 mt-20">

        {/* MAIN FORM */}
        <main className="lg:col-span-8 space-y-12">

          {/* SECCIÓN 1: IDENTIDAD */}
          <section className={`transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <header className="mb-8 pl-4 border-l-4 border-[#DA0037]">
              <h2 className={`text-2xl font-bold ${textPrimary} mb-1`}>Identidad Comercial</h2>
              <p className={`text-sm ${textSecondary}`}>Define cómo te verán tus clientes en el mapa.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MinimalInput
                fullWidth
                label="Nombre del Negocio"
                placeholder="Ej. Panadería Las Ánimas"
                value={businessName}
                onChange={(e: any) => handleChange('businessName', e.target.value, setBusinessName)}
                onBlur={(e: any) => handleBlur('businessName', businessName)}
                error={errors.businessName}
                touched={touched.businessName}
                icon={Store}
                delay={100}
                mounted={mounted}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                themeColors={themeColors}
              />

              <MinimalInput
                fullWidth
                label="Dirección Física"
                placeholder="Ej. Av. Pedro Aguirre Cerda 123"
                value={address}
                onChange={(e: any) => handleChange('address', e.target.value, setAddress)}
                onBlur={(e: any) => handleBlur('address', address)}
                error={errors.address}
                touched={touched.address}
                icon={MapPin}
                delay={150}
                mounted={mounted}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                themeColors={themeColors}
              />

              {/* Categorías Minimalistas */}
              <div
                className={`col-span-1 md:col-span-2 flex flex-col gap-3 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '200ms' }}
              >
                <label className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider pl-1`}>Categoría Principal</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categoryGroups.map((group) => (
                    <button
                      key={group.name}
                      onClick={() => { setCategory(group.name); setSubcategory(''); }}
                      className={`relative overflow-hidden p-4 rounded-xl border text-left text-xs font-medium transition-all duration-300 flex flex-col justify-between min-h-[80px] group
                        ${category === group.name
                          ? `${bgTertiary} border-[#DA0037] ${textPrimary} shadow-[0_0_20px_rgba(218,0,55,0.15)] scale-[1.02]`
                          : `${bgTertiary} border-transparent ${textTertiary} ${hoverBg} hover:text-gray-700 dark:hover:text-[#e4e4e7]`}`}
                    >
                      <span className={`relative z-10 transition-transform duration-300 ${category === group.name ? 'translate-x-1' : ''}`}>{group.name}</span>
                      {category === group.name && (
                        <div className="absolute bottom-3 right-3 text-[#DA0037]">
                          <Sparkles size={14} className="animate-spin-slow" />
                        </div>
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-br from-gray-300 dark:from-[#333] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategorías Chips */}
              <div className={`col-span-1 md:col-span-2 transition-all duration-500 ease-in-out overflow-hidden ${category ? 'max-h-[300px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                <div className={`${bgSecondary} ${borderPrimary} border rounded-xl p-5 flex flex-wrap gap-2`}>
                  {category && categoryGroups.find(g => g.name === category)?.subs.map((sub, idx) => (
                    <button
                      key={sub}
                      onClick={() => setSubcategory(sub)}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      className={`px-4 py-2 rounded-lg text-xs transition-all duration-200 border font-medium animate-slide-up-fade
                          ${subcategory === sub
                          ? `bg-gray-800 text-white dark:bg-[#e4e4e7] dark:text-[#18181b] border-[#DA0037] shadow-lg scale-105`
                          : `${bgTertiary} ${textSecondary} ${borderSecondary} hover:text-gray-800 dark:hover:text-white`
                        }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div
                className={`col-span-1 md:col-span-2 flex flex-col gap-2 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '300ms' }}
              >
                <div className="flex justify-between pl-1">
                  <label className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>Descripción</label>
                  <span className={`text-[10px] font-mono transition-colors duration-300 ${description.length > 150 ? 'text-[#DA0037]' : textTertiary}`}>{description.length}/160</span>
                </div>
                <div className={`relative ${bgTertiary} rounded-xl border transition-all duration-300 ${focusedField === 'desc' ? `border-[#DA0037] bg-gray-200 dark:bg-[#2d2d30]` : `border-transparent ${hoverBg}`}`}>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => handleChange('description', e.target.value, setDescription)}
                    onBlur={() => handleBlur('description', description)}
                    onFocus={() => setFocusedField('desc')}
                    placeholder="Describe lo que hace único a tu negocio..."
                    className={`w-full bg-transparent ${textPrimary} text-sm px-4 py-4 focus:outline-none placeholder-gray-400 dark:placeholder-[#52525b] resize-none font-medium leading-relaxed`}
                  ></textarea>
                </div>
                {touched.description && errors.description && (
                  <span className="text-[10px] text-red-500 font-medium pl-1 animate-fade-in">{errors.description}</span>
                )}
              </div>

            </div>
          </section>

          {/* NUEVA SECCIÓN: HORARIOS FLEXIBLES */}
          <section className={`transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '125ms' }}>
            <header className="mb-8 pl-4 border-l-4 border-[#DA0037]">
              <h2 className={`text-2xl font-bold ${textPrimary} mb-1`}>Horarios de Atención</h2>
              <p className={`text-sm ${textSecondary}`}>Selecciona los días que abres y define tu horario.</p>
            </header>

            <div className={`${bgSecondary} ${borderPrimary} border rounded-2xl p-6 md:p-8 space-y-8`}>

              {/* Selector de Días Circular */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className={`text-xs font-bold ${textSecondary} uppercase tracking-wider`}>Días Operativos</span>
                  <span className="text-xs font-medium text-[#DA0037] animate-pulse">{getScheduleSummary()}</span>
                </div>

                <div className="flex flex-wrap justify-between gap-2 md:gap-4">
                  {daysOfWeek.map((day) => {
                    const isSelected = selectedDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        onClick={() => toggleDay(day.id)}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 transform hover:scale-110
                          ${isSelected
                            ? 'bg-[#DA0037] text-white shadow-[0_0_15px_rgba(218,0,55,0.4)] border-2 border-[#DA0037]'
                            : `${bgTertiary} ${textTertiary} border-2 ${borderSecondary} hover:border-[#71717a] hover:text-gray-700 dark:hover:text-[#f4f4f5]`
                          }`}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Inputs de Hora Funcionales */}
              <div className="transition-all duration-500 opacity-100 translate-y-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`h-px ${borderPrimary} flex-1`}></div>
                  <span className={`text-[10px] ${textTertiary} uppercase font-bold tracking-widest`}>Definir Horario</span>
                  <div className={`h-px ${borderPrimary} flex-1`}></div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1 w-full">
                    <TimePicker
                      label="Apertura"
                      value={scheduleTime.start}
                      onChange={(val: string) => setScheduleTime(prev => ({ ...prev, start: val }))}
                    />
                  </div>

                  <div className={`w-8 h-px ${borderSecondary} md:w-px md:h-8`}></div>

                  <div className="flex-1 w-full">
                    <TimePicker
                      label="Cierre"
                      value={scheduleTime.end}
                      onChange={(val: string) => setScheduleTime(prev => ({ ...prev, end: val }))}
                    />
                  </div>
                </div>

                {/* Feedback visual de estado */}
                <div className={`mt-4 flex items-center justify-center gap-2 text-xs ${textTertiary}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${hasSchedule ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-[#3f3f46]'}`}></div>
                  {hasSchedule
                    ? `Horario establecido: ${scheduleTime.start} - ${scheduleTime.end}`
                    : 'Selecciona una hora de apertura y cierre'}
                </div>
              </div>

            </div>
          </section>

          {/* SECCIÓN 4: GALERÍA DE FOTOS */}
          <section className={`transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '150ms' }}>
            <header className="mb-8 pl-4 border-l-4 border-[#DA0037]">
              <h2 className={`text-2xl font-bold ${textPrimary} mb-1`}>Galería del Negocio</h2>
              <p className={`text-sm ${textSecondary}`}>Las fotos de calidad aumentan un 40% las visitas.</p>
            </header>

            <div className={`${bgSecondary} ${borderPrimary} border rounded-2xl p-6`}>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-square rounded-xl border-2 border-dashed ${borderSecondary} hover:border-[#DA0037] bg-gray-100/50 hover:bg-gray-200 dark:bg-[#27272a]/50 dark:hover:bg-[#27272a] transition-all duration-300 flex flex-col items-center justify-center gap-3 group`}
                >
                  <div className={`p-3 bg-gray-300 dark:bg-[#323235] rounded-full group-hover:bg-[#DA0037] transition-colors duration-300`}>
                    <Upload size={20} className={`${textSecondary} group-hover:text-white`} />
                  </div>
                  <span className={`text-xs font-bold ${textTertiary} group-hover:text-white uppercase tracking-wide`}>Subir Fotos</span>
                </button>

                {photos.map((photo) => (
                  <div key={photo.id} className={`relative aspect-square rounded-xl overflow-hidden group animate-fade-in ${bgPrimary}`}>
                    <img src={photo.url} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-[#DA0037] rounded-full text-white opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-white truncate block">{photo.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECCIÓN 5: CONTACTO */}
          <section className={`transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
            <header className="mb-8 pl-4 border-l-4 border-[#DA0037]">
              <h2 className={`text-2xl font-bold ${textPrimary} mb-1`}>Puntos de Contacto</h2>
              <p className={`text-sm ${textSecondary}`}>Conecta tus redes para ganar confianza.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MinimalInput label="Teléfono" placeholder="+56 9 ..." value={phone || '+56 '} onChange={(e: any) => handlePhoneChange('phone', e.target.value, setPhone)} onBlur={() => handleBlur('phone', phone)} error={errors.phone} touched={touched.phone} icon={Phone} delay={400} mounted={mounted} focusedField={focusedField} setFocusedField={setFocusedField} themeColors={themeColors} />
              <MinimalInput label="WhatsApp" placeholder="+56 9 ..." value={whatsapp || '+56 '} onChange={(e: any) => handlePhoneChange('whatsapp', e.target.value, setWhatsapp)} onBlur={() => handleBlur('whatsapp', whatsapp)} error={errors.whatsapp} touched={touched.whatsapp} icon={Smartphone} delay={450} mounted={mounted} focusedField={focusedField} setFocusedField={setFocusedField} themeColors={themeColors} />
              <MinimalInput fullWidth label="Sitio Web" placeholder="www.tunegocio.cl" value={website} onChange={(e: any) => handleChange('website', e.target.value, setWebsite)} onBlur={() => handleBlur('website', website)} error={errors.website} touched={touched.website} icon={Globe} delay={500} mounted={mounted} focusedField={focusedField} setFocusedField={setFocusedField} themeColors={themeColors} />
              <div className="col-span-1 md:col-span-2 pt-4 pb-2">
                <div className={`h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-[#27272a] to-transparent`}></div>
              </div>
              <MinimalInput label="Instagram" placeholder="@usuario" value={instagram} onChange={(e: any) => setInstagram(e.target.value)} icon={Instagram} delay={550} mounted={mounted} focusedField={focusedField} setFocusedField={setFocusedField} themeColors={themeColors} />
              <MinimalInput label="Facebook" placeholder="/pagina" value={facebook} onChange={(e: any) => setFacebook(e.target.value)} icon={Facebook} delay={600} mounted={mounted} focusedField={focusedField} setFocusedField={setFocusedField} themeColors={themeColors} />
              <MinimalInput label="TikTok" placeholder="@usuario" value={tiktok} onChange={(e: any) => setTiktok(e.target.value)} icon={TikTokIcon} delay={650} mounted={mounted} focusedField={focusedField} setFocusedField={setFocusedField} themeColors={themeColors} />
              <MinimalInput label="X" placeholder="@usuario" value={twitter} onChange={(e: any) => setTwitter(e.target.value)} icon={XIcon} delay={700} mounted={mounted} focusedField={focusedField} setFocusedField={setFocusedField} themeColors={themeColors} />
            </div>
          </section>

        </main>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 relative">
          <div className={`sticky top-32 transition-all duration-1000 delay-500 transform ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>

            <div className={`${bgPrimary} ${borderPrimary} border rounded-2xl p-6 shadow-2xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#DA0037] opacity-[0.05] blur-[50px] rounded-full pointer-events-none"></div>

              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 ${bgTertiary} rounded-lg ${borderSecondary} border text-[#DA0037]`}>
                  <CheckCircle2 size={18} />
                </div>
                <h3 className={`text-sm font-bold ${textPrimary} uppercase tracking-widest`}>Estado de Ficha</h3>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  { label: "Identidad", valid: businessName.length > 3 && category },
                  { label: "Ubicación", valid: address.length > 5 },
                  { label: "Horarios", valid: hasSchedule },
                  { label: "Galería", valid: photos.length > 0 },
                  { label: "Contacto", valid: hasContact }
                ].map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${bgTertiary} border border-transparent ${borderSecondary} transition-colors`}>
                    <span className={`text-xs font-medium uppercase tracking-wide transition-colors ${item.valid ? textPrimary : textTertiary}`}>
                      {item.label}
                    </span>
                    {item.valid ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <div className={`w-4 h-4 rounded-full border-2 ${borderSecondary}`}></div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(errors).some(k => errors[k]) || !businessName || !address || !description || !category || !subcategory || selectedDays.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group
                  ${isSubmitting || Object.keys(errors).some(k => errors[k]) || !businessName || !address || !description || !category || !subcategory || selectedDays.length === 0
                    ? `${bgTertiary} ${textTertiary} cursor-not-allowed opacity-50`
                    : 'bg-[#DA0037] hover:bg-[#b3002d] text-white shadow-lg shadow-[#DA0037]/30 hover:shadow-[#DA0037]/50 hover:-translate-y-1'
                  }`}
              >
                {isSubmitting ? 'Enviando...' : 'Continuar'}
                {!isSubmitting && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>

          </div>
        </aside>

      </div>

      <style jsx>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-bounce-in { animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes bounceIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }
        .animate-slide-up-fade { animation: slideUp 0.3s ease-out forwards; opacity: 0; transform: translateY(10px); }
        @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
        .animate-pulse-slow { animation: pulse 6s ease-in-out infinite; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <Footer />
    </div>
  );
}
