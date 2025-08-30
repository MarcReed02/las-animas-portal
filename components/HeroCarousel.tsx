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
      Array.from({ length: 5 }, (_, i) => `https://lipsum.app/random/1440x376?i=${i + 1}`),
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
      className={`relative w-full bg-black ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-roledescription="carousel"
    >
      {/* Slides viewport */}
      <div className="relative w-full overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((src, i) => (
            <div key={i} className="w-full shrink-0">
              <img
                src={src}
                alt={`Banner ${i + 1}`}
                className="block w-full h-[376px] object-cover select-none"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Left/Right Controls */}
        <button
          type="button"
          aria-label="Imagen anterior"
          onClick={prev}
          className="group absolute left-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
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
          className="group absolute right-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
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

        {/* Top/Bottom subtle gradient overlays to polish the look */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/20 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </section>
  )
}

export default HeroCarousel
