'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { FiSun, FiMoon } from 'react-icons/fi'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])

  const nav = [
    { name: 'Contacto', href: '/contacto' },
    { name: 'Nosotros', href: '/nosotros' },
  ]

  const toggleTheme = () => setTheme((resolvedTheme === 'dark' ? 'light' : 'dark'))

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0B0B]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0B0B0B]/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="text-xl font-extrabold tracking-wide"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault()
                setIsOpen(false)
                try {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                } catch {
                  window.scrollTo(0, 0)
                }
              }
            }}
          >
            LAS ÁNIMAS
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {nav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-white/90 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="text-sm px-3 py-1.5 rounded-md border border-white/30 hover:border-white/60 hover:text-white transition-colors"
            >
              Login
            </Link>
            <button
              aria-label="Cambiar tema"
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-white/10"
            >
              {mounted ? (
                resolvedTheme === 'light' ? (
                  <FiSun className="h-5 w-5" />
                ) : (
                  <FiMoon className="h-5 w-5" />
                )
              ) : (
                <span className="block h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              aria-label="Cambiar tema"
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-white/10"
            >
              {mounted ? (
                resolvedTheme === 'light' ? (
                  <FiSun className="h-5 w-5" />
                ) : (
                  <FiMoon className="h-5 w-5" />
                )
              ) : (
                <span className="block h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
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

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0B0B]">
          <div className="px-4 py-3 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-2 py-2 rounded-md text-white/90 hover:text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="block px-2 py-2 rounded-md border border-white/20 text-white/90 hover:text-white hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
