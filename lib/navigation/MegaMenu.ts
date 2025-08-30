export type MegaMenuItem = {
  label: string
  href: string
}

export type MegaMenuSection = {
  title: string
  items: MegaMenuItem[]
}

export const megaSections: MegaMenuSection[] = [
  {
    title: 'ALIMENTACIÓN',
    items: [
      { label: 'Fruterías', href: '/comercios/alimentacion/fruterias' },
      { label: 'Panaderías', href: '/comercios/alimentacion/panaderias' },
      { label: 'Carnicerías', href: '/comercios/alimentacion/carnicerias' },
      { label: 'Rostiserias', href: '/comercios/alimentacion/rostiserias' },
      { label: 'Botillerias', href: '/comercios/alimentacion/botillerias' },
      { label: 'Supermercados', href: '/comercios/alimentacion/supermercados' },
    ],
  },
  {
    title: 'SALUD',
    items: [{ label: 'Farmacias', href: '/comercios/salud/farmacias' }],
  },
  {
    title: 'MASCOTAS',
    items: [
      { label: 'Alimento para mascotas', href: '/comercios/mascotas/alimento' },
      { label: 'Veterinarias', href: '/comercios/mascotas/veterinarias' },
    ],
  },
  {
    title: 'MODA, MUEBLES Y HOGAR',
    items: [
      { label: 'Ropa', href: '/comercios/moda-hogar/ropa' },
      { label: 'Mueblerías', href: '/comercios/moda-hogar/mueblerias' },
      { label: 'Retail', href: '/comercios/moda-hogar/retail' },
    ],
  },
  {
    title: 'DEPORTES',
    items: [
      { label: 'Gimnasio', href: '/comercios/deportes/gimnasio' },
      { label: 'Golf', href: '/comercios/deportes/golf' },
      { label: 'Futbol', href: '/comercios/deportes/futbol' },
      { label: 'Baloncesto', href: '/comercios/deportes/baloncesto' },
      { label: 'Remo', href: '/comercios/deportes/remo' },
      { label: 'Pádel', href: '/comercios/deportes/padel' },
    ],
  },
  {
    title: 'SERVICIOS',
    items: [
      { label: 'Mecánicos', href: '/comercios/servicios/mecanicos' },
      { label: 'Vulcanizadora', href: '/comercios/servicios/vulcanizadora' },
      { label: 'Ferretería', href: '/comercios/servicios/ferreteria' },
      { label: 'Hoteles', href: '/comercios/servicios/hoteles' },
      { label: 'Servicentro', href: '/comercios/servicios/servicentro' },
      { label: 'Aeródromo', href: '/comercios/servicios/aerodromo' },
      { label: 'Barberías', href: '/comercios/servicios/barberias' },
    ],
  },
]
