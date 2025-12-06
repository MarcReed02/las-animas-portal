"use client";

import React, { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

interface ProfileMenuProps {
  user: {
    name: string;
    email?: string;
  };
  role: string; // 'admin', 'merchant', 'neighbor'
  onClose: () => void;
  onSignOut: () => void;
}

export default function ProfileMenu({ user, role, onClose, onSignOut }: ProfileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!mounted) return null;

  const isDarkMode = resolvedTheme === 'dark';
  const isAdminOrMerchant = role === 'admin' || role === 'merchant';

  // Dynamic Colors
  const colors = {
    bg: isDarkMode ? '#121212' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#171717',
    subtext: isDarkMode ? '#B3B3B3' : '#666666',
    buttonBg: isDarkMode ? '#1E1E1E' : '#F5F5F5',
    buttonHoverBg: isDarkMode ? '#2C2C2C' : '#E5E5E5',
    border: isDarkMode ? 'transparent' : '#E5E5E5',
    shadow: isDarkMode ? '0 30px 60px rgba(0,0,0,0.4)' : '0 30px 60px rgba(0,0,0,0.15)',
  };

  // Badge Config
  const badgeConfig = isAdminOrMerchant ? {
    text: role === 'admin' ? 'SUPER ADMIN' : 'ADMINISTRADOR',
    bg: 'rgba(220, 20, 60, 0.15)',
    border: '#DC143C',
    textCol: '#DC143C'
  } : {
    text: 'CUENTA VECINO',
    bg: 'rgba(34, 197, 94, 0.15)', // Green-500/15
    border: '#22c55e', // Green-500
    textCol: '#22c55e'
  };

  return (
    <>
      {/* Backdrop for click outside */}
      <div className="fixed inset-0 z-40 bg-transparent" aria-hidden="true" />

      {/* Menu Container */}
      <div
        ref={menuRef}
        className="absolute right-0 top-16 z-50 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200"
        style={{
          width: '290px',
          height: '410px',
          backgroundColor: colors.bg,
          borderRadius: '30px',
          boxShadow: colors.shadow,
          border: `1px solid ${colors.border}`
        }}
      >
        {/* 1. Header (Name, Email, Badge) */}
        <div className="flex flex-col items-center mt-10 mb-6 w-full">
          <h2
            className="font-bold text-xl text-center leading-tight transition-colors"
            style={{ color: colors.text }}
          >
            {user.name}
          </h2>
          <p
            className="text-xs mt-1 text-center transition-colors"
            style={{ color: colors.subtext }}
          >
            {user.email || 'usuario@animas.cl'}
          </p>

          {/* Role Badge */}
          <div className="mt-5 relative">
            <div
              className="flex items-center justify-center px-4 py-1 rounded-full border"
              style={{
                backgroundColor: badgeConfig.bg,
                borderColor: badgeConfig.border,
                borderWidth: '1px',
                width: '120px', // Slightly wider to fit "CUENTA VECINO"
                height: '24px'
              }}
            >
              <span
                className="text-[9px] font-bold tracking-wider"
                style={{ color: badgeConfig.textCol }}
              >
                {badgeConfig.text}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Menu Items */}
        <div className="flex flex-col gap-4 w-full items-center">

          {/* Panel de Control (Only for Admins/Merchants) */}
          {isAdminOrMerchant && (
            <Link
              href={role === 'admin' ? "/admin" : "/dashboard"}
              className="group relative flex items-center w-[220px] h-[50px] rounded-full transition-all duration-200"
              style={{ backgroundColor: colors.buttonBg }}
              onClick={onClose}
            >
              <style jsx>{`
                .group:hover { background-color: ${colors.buttonHoverBg} !important; }
              `}</style>

              <div className="relative z-10 flex items-center w-full px-5">
                <div className="text-[#DC143C] transition-colors">
                  <LayoutDashboard size={18} style={{ color: isDarkMode ? '#FFF' : '#171717' }} className="group-hover:text-[#DC143C] transition-colors" />
                </div>
                <span
                  className="ml-5 font-medium text-sm transition-colors group-hover:text-[#DC143C]"
                  style={{ color: isDarkMode ? '#DDD' : '#333' }}
                >
                  Panel de Control
                </span>
              </div>
            </Link>
          )}

          {/* Editar Perfil */}
          <button
            className="group relative flex items-center w-[220px] h-[50px] rounded-full transition-all duration-200"
            style={{ backgroundColor: colors.buttonBg }}
          >
            <style jsx>{`
               .group:hover { background-color: ${colors.buttonHoverBg} !important; }
             `}</style>

            <div className="relative z-10 flex items-center w-full px-5">
              <div className="transition-colors">
                <User size={18} style={{ color: isDarkMode ? '#FFF' : '#171717' }} className="group-hover:text-[#DC143C] transition-colors" />
              </div>
              <span
                className="ml-5 font-medium text-sm transition-colors group-hover:text-[#DC143C]"
                style={{ color: isDarkMode ? '#DDD' : '#333' }}
              >
                Editar Perfil
              </span>
            </div>
          </button>


        </div>

        {/* 3. Logout Button */}
        <div className="mt-auto mb-10">
          <button
            onClick={onSignOut}
            className="group flex items-center justify-center gap-2 px-6 py-2 rounded-full transition-all hover:bg-[rgba(255,77,77,0.1)]"
          >
            <LogOut size={18} className="text-[#DC143C]" />
            <span className="text-[#DC143C] font-bold text-sm tracking-wide">
              CERRAR SESIÓN
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
