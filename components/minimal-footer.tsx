"use client";

import React from 'react';

export default function MinimalFooter() {
  return (
    <footer className="border-t bg-gray-100 border-gray-200 dark:bg-[#171717] dark:border-[#444444] h-[69px] flex items-center mt-auto transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-[#EDEDED]/40">
          <p>&copy; 2025 Portal Las Ánimas. Proyecto de Título INACAP.</p>
          <p>Desarrollado con Next.js + Tailwind.</p>
        </div>
      </div>
    </footer>
  );
}
