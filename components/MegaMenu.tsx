'use client'

import Link from 'next/link'
import React from 'react'

export type MegaMenuItem = {
  label: string
  href: string
}

export type MegaMenuSection = {
  title: string
  items: MegaMenuItem[]
}

type MegaMenuProps = {
  sections: MegaMenuSection[]
  onNavigate?: () => void
  className?: string
  id?: string
}

/**
 * MegaMenu
 * - Full-width dropdown panel intended to be placed directly under the Navbar.
 * - Uses Tailwind for styling. Defaults to a dark-blue background with white text.
 * - Pass `sections` to control the columns/links shown.
 */
const MegaMenu: React.FC<MegaMenuProps> = ({ sections, onNavigate, className = '', id }) => {
  return (
    <div
      id={id}
      className={
        'w-full bg-[#0A5A8A] text-white shadow-lg border-t border-white/10 ' + className
      }
      role="menu"
      aria-label="Comercios - Mega Menu"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold tracking-wider text-white/90 uppercase mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="block text-sm text-white/90 hover:text-white transition-colors"
                      onClick={onNavigate}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MegaMenu
