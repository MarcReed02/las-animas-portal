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

  const text = excerpt ?? ''

  return (
    <article
      className={`max-w-7xl border border-transparent p-4 flex flex-col gap-6 ${className}`}
    >
      <div className="relative overflow-hidden rounded-[10px]">
        <img
          src={src}
          alt="Imagen de la noticia"
          className="w-full aspect-square object-cover"
          draggable={false}
        />
        {href ? (
          <Link
            href={href}
            className="absolute left-4 bottom-4 inline-block bg-[#c21e1e] text-white text-base font-semibold uppercase tracking-wide px-4 py-2 rounded-[5px] shadow-md transition-opacity hover:opacity-95 active:opacity-90 [color:rgb(255,255,255)!important]"
          >
            LEER MAS
          </Link>
        ) : (
          <span className="absolute left-4 bottom-4 inline-block bg-[#c21e1e] text-white text-sm font-semibold uppercase tracking-wide px-4 py-2 rounded-md shadow-md [color:rgb(255,255,255)!important]">
            LEER MAS
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-white text-xl font-semibold leading-tight">{title}</h3>
        {text && (
          <p className="text-white/75 text-lg leading-relaxed">{text}</p>
        )}
      </div>
    </article>
  )
}

export default NewsCard
