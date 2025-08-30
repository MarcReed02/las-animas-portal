'use client'

import { useState } from 'react'
import Link from 'next/link'
import MegaMenu from './MegaMenu'
import { megaSections } from '../lib/navigation/MegaMenu'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isComerciosOpen, setIsComerciosOpen] = useState(false)
  const [isComerciosMobileOpen, setIsComerciosMobileOpen] = useState(false)

  const navigation = [
    { name: 'Comercios', href: '/comercios' },
    { name: 'Planes Futuros', href: '/planes-futuros' },
    { name: 'Comunidad', href: '/comunidad' },
    { name: 'Contacto', href: '/contacto' },
  ]

  const comerciosLinks = [
    { name: 'Comercio 1', href: '/comercios/1' },
    { name: 'Comercio 2', href: '/comercios/2' },
    { name: 'Comercio 3', href: '/comercios/3' },
    { name: 'Comercio 4', href: '/comercios/4' },
    { name: 'Comercio 5', href: '/comercios/5' },
  ]

  const otherNav = navigation.filter((item) => item.name !== 'Comercios')

  return (
    <nav className="bg-[#0174BE] shadow-lg sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-white hover:text-white/80 transition-colors">
              Logo
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {/* Comercios Dropdown (Desktop) */}
              <div
                className="relative"
              >
                <button
                  type="button"
                  aria-expanded={isComerciosOpen}
                  aria-controls="mega-menu-comercios"
                  className="text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium uppercase transition-colors duration-200 hover:bg-white/10 inline-flex items-center"
                  onMouseEnter={() => setIsComerciosOpen(true)}
                  onFocus={() => setIsComerciosOpen(true)}
                >
                  Comercios
                  <svg
                    className={`ml-2 h-4 w-4 transition-transform duration-200 ${isComerciosOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
              </div>

              {/* Other links */}
              {otherNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium uppercase transition-colors duration-200 hover:bg-white/10"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Abrir menú principal</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
      </div>
      </div>

      {/* Desktop MegaMenu for Comercios */}
      <div
        className={`hidden md:block absolute left-0 right-0 top-full z-50 transform transition-all duration-200 ease-out ${isComerciosOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
        onMouseEnter={() => setIsComerciosOpen(true)}
        onMouseLeave={() => setIsComerciosOpen(false)}
      >
        <MegaMenu
          id="mega-menu-comercios"
          sections={megaSections}
          onNavigate={() => setIsComerciosOpen(false)}
        />
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#0174BE] border-t border-[#0174BE]">
            {/* Comercios collapsible (Mobile) */}
            <button
              type="button"
              onClick={() => setIsComerciosMobileOpen((prev) => !prev)}
              className="w-full text-left text-white hover:text-white/90 block px-3 py-2 rounded-md text-base font-medium uppercase hover:bg-white/10 transition-colors duration-200 flex items-center justify-between"
            >
              <span>Comercios</span>
              <svg
                className={`h-5 w-5 transition-transform ${isComerciosMobileOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isComerciosMobileOpen && (
              <div className="ml-4 space-y-1">
                {comerciosLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-white hover:text-white/90 block px-3 py-2 rounded-md text-base font-medium uppercase hover:bg-white/10 transition-colors duration-200"
                    onClick={() => {
                      setIsComerciosMobileOpen(false);
                      setIsOpen(false);
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Other links */}
            {otherNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-white/90 block px-3 py-2 rounded-md text-base font-medium uppercase hover:bg-white/10 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar