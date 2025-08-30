'use client'

import Link from 'next/link'
import React from 'react'

type NewsCardProps = {
  title: string
  excerpt?: string
  href?: string
  imageUrl?: string
  className?: string
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  excerpt,
  href = '#',
  imageUrl,
  className = '',
}) => {
  const src =
    imageUrl ??
    `https://lipsum.app/random/480x320?i=${Math.floor(Math.random() * 10000)}`

  const text = excerpt ?? title

  return (
    <article className={`w-full ${className}`}>
      {/* Imagen con botón "LEER MÁS" superpuesto */}
      <div className="relative w-full h-56 md:h-64 bg-gray-200 overflow-hidden rounded-md ring-1 ring-white/10">
        <img
          src={src}
          alt="Imagen de la noticia"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {href ? (
          <Link
            href={href}
            className="absolute left-3 bottom-3 inline-block bg-[#F24E6F] hover:bg-[#e54564] active:bg-[#d33e5a] text-white text-xs font-semibold uppercase tracking-wide px-3 py-2 transition-colors"
          >
            LEER MÁS
          </Link>
        ) : (
          <span className="absolute left-3 bottom-3 inline-block bg-[#F24E6F] text-white text-xs font-semibold uppercase tracking-wide px-3 py-2">
            LEER MÁS
          </span>
        )}
      </div>

      {/* Descripción con línea amarilla a la izquierda */}
      <div className="mt-4 border-l-4 border-[#FFC531] pl-4 pb-2">
        <p className="text-white text-sm md:text-base leading-relaxed">{text}</p>
      </div>
    </article>
  )
}

export default NewsCard
