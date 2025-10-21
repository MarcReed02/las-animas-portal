'use client'

import React, { useEffect, useMemo, useState } from 'react'
import NewsCard from './NewsCard'

type NewsItem = {
  id?: string | number
  title: string
  excerpt?: string
  href?: string
  image_url?: string
  slug?: string
  published_at?: string
}

const mockNews: NewsItem[] = [
  {
    title:
      'Durante la Semana Animeña, el barrio histórico de Valdivia festejará su 364° aniversario con un desfile, coordinado por la Corporación de Juntas de Vecinos Urbanas y Rurales y respaldado por la Municipalidad de Valdivia.',
    href: '#',
    image_url: 'https://lipsum.app/random/480x320?i=1',
  },
  {
    title:
      'Las Ánimas celebra su aniversario con un desfile cívico. Fernanda Ibáñez, estudiante de kinesiología y residente de El Arenal, fue coronada reina animeña y representante de la tercera edad, del Club Arcoíris de la villa El Progreso, Haty Flaig.',
    href: '#',
    image_url: 'https://lipsum.app/random/480x320?i=2',
  },
  {
    title:
      'Este viernes 29 habrá boxeo amateur y profesional en una nueva versión de la velada pugilística Gladiadores al nocaut, evento que organiza la productora Benbru Promotions, la misma productora de Daniela “La Leona” Asenjo.',
    href: '#',
    image_url: 'https://lipsum.app/random/480x320?i=3',
  },
  {
    title:
      'Luego de cinco años, el puente Las Ánimas ubicado en el municipio de Yecapixtla, será rehabilitado a través del Programa Nacional de Reconstrucción (PNR).',
    href: '#',
    image_url: 'https://lipsum.app/random/480x320?i=4',
  },
  {
    title:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent varius, nibh non ultrices gravida, nisl lorem blandit justo, sed vestibulum lacus est at sapien.',
    href: '#',
    image_url: 'https://lipsum.app/random/480x320?i=5',
  },
]

export default function NewsSection({
  items,
  fetchUrl = '/api/news',
  limit = mockNews.length,
  className = '',
}: {
  items?: NewsItem[]
  fetchUrl?: string
  limit?: number
  className?: string
}) {
  const [data, setData] = useState<NewsItem[] | null>(items ?? null)
  const [loading, setLoading] = useState<boolean>(!items && !!fetchUrl)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    if (fetchUrl && !items) {
      setLoading(true)
      fetch(fetchUrl)
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json = await res.json()
          if (!isMounted) return
          // Se espera un array o un objeto con { items: NewsItem[] }
          setData(Array.isArray(json) ? json : json?.items ?? [])
        })
        .catch((e) => {
          if (!isMounted) return
          setError(e.message || 'Error al cargar noticias')
          setData(null)
        })
        .finally(() => {
          if (!isMounted) return
          setLoading(false)
        })
    }
    return () => {
      isMounted = false
    }
  }, [fetchUrl, items])

  const resolvedItems = useMemo(() => {
    const source = data ?? items ?? []
    const subset = source.slice(0, limit)
    // Fallback visual con mock si no hay datos
    return subset.length > 0 ? subset : mockNews.slice(0, limit)
  }, [data, items, limit])

  return (
    <section className={`w-full bg-[#0B0B0B] py-12 md:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Grid de noticias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-12">
          {loading
            ? Array.from({ length: limit }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="animate-pulse">
                  <div className="w-full h-56 md:h-64 bg-white/10" />
                  <div className="mt-4 border-l-4 border-[#FFC531] pl-4">
                    <div className="h-4 bg-white/20 rounded w-11/12 mb-2" />
                    <div className="h-4 bg-white/20 rounded w-9/12" />
                  </div>
                </div>
              ))
            : resolvedItems.map((n, idx) => (
                <NewsCard
                  key={n?.id ?? n?.slug ?? idx}
                  title={n.title}
                  excerpt={n.excerpt}
                  href={n.href ?? (n.slug ? `/news/${n.slug}` : '#')}
                  imageUrl={n.image_url ?? `https://lipsum.app/random/480x320?i=${idx + 1}`}
                />
              ))}
          {!loading && (items ?? data)?.length === 0 && (
            <div className="col-span-full text-center text-white/80">
              No hay noticias para mostrar por ahora.
            </div>
          )}
          {error && (
            <div className="col-span-full text-center text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
