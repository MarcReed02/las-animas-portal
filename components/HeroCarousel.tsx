'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type HeroCarouselProps = {
  images?: string[]
  intervalMs?: number // default 10s
  className?: string
}

const DEFAULT_INTERVAL = 10000

/**
 * HeroCarousel
 * - Full-width banner carousel with autoplay (10s) and manual controls.
 * - Uses Tailwind transitions for a smooth, professional slide animation.
 * - Defaults to random images from lipsum.app with 1440x376 dimensions.
 * - No Next/Image needed, so no domain whitelisting required.
 */
const HeroCarousel: React.FC<HeroCarouselProps> = ({
  images,
  intervalMs = DEFAULT_INTERVAL,
  className = '',
}) => {
  // Provide 5 default images from lipsum.app with cache-busting query
  const defaultImages = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => `https://lipsum.app/random/1440x376?i=${i + 1}`),
    []
  )

  const slides = images && images.length > 0 ? images : defaultImages

  const [index, setIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef<number | null>(null)

  const goTo = (i: number) => {
    const len = slides.length
    if (len === 0) return
    const normalized = ((i % len) + len) % len
    setIndex(normalized)
  }

  const next = () => goTo(index + 1)
  const prev = () => goTo(index - 1)

  // Autoplay
  useEffect(() => {
    if (isHovered || slides.length <= 1) return
    timerRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, Math.max(2000, intervalMs))
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [isHovered, slides.length, intervalMs])

  return (
    <section
      className={`relative w-full px-4 md:px-16 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-roledescription="carousel"
    >
      {/* Slides viewport with side spacing from md */}
      <div className="relative w-full overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((src, i) => (
            <div key={i} className="w-full shrink-0">
              <img
                src={src}
                alt={`Banner ${i + 1}`}
                className="block w-full h-[500px] object-cover select-none"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Overlay content (title + CTA) */}
        <div className="absolute inset-0 flex items-center z-20 pointer-events-none">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-xl pointer-events-auto">
              <h2 className="text-white text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-md">
                VISITA
                <br />
                NUESTROS
                <br />
                FUTUROS PLANES
              </h2>
              <a
                href="/planes-futuros"
                className="mt-6 inline-block bg-[#AC2734] hover:bg-[#C92F3F] text-white font-semibold uppercase tracking-wide px-5 py-3 rounded-md shadow transition-colors"
              >
                Ver ahora
              </a>
            </div>
          </div>
        </div>

        {/* Left/Right Controls */}
        <button
          type="button"
          aria-label="Imagen anterior"
          onClick={prev}
          className="group absolute left-2 top-1/2 -translate-y-1/2 z-30 inline-flex items-center justify-center h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 transition-transform group-active:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Siguiente imagen"
          onClick={next}
          className="group absolute right-2 top-1/2 -translate-y-1/2 z-30 inline-flex items-center justify-center h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 transition-transform group-active:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Indicators */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 z-10">
          {slides.map((_, i) => {
            const active = i === index
            return (
              <button
                key={i}
                aria-label={`Ir a la imagen ${i + 1}`}
                aria-current={active}
                onClick={() => goTo(i)}
                className={
                  'h-2.5 w-2.5 rounded-full transition-all ' +
                  (active ? 'bg-white scale-100' : 'bg-white/50 hover:bg-white/70 scale-90')
                }
              />
            )
          })}
        </div>

        {/* Fade overlays: global dim, bottom strong fade, side vignettes */}
        <div className="pointer-events-none absolute inset-0 bg-black/30 rounded-xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 md:h-48 bg-gradient-to-t from-black/80 via-black/50 to-transparent rounded-b-xl" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/40 to-transparent rounded-l-xl" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/40 to-transparent rounded-r-xl" />
      </div>
    </section>
  )
}

export default HeroCarousel
