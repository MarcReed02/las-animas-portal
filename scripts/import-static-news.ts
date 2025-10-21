import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: './.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is not set in environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const staticNews = [
  {
    title: 'El barrio histórico de Valdivia celebra su 364° aniversario con un desfile durante la Semana Animeña.',
    excerpt:
      'Durante la Semana Animeña, el barrio histórico de Valdivia festejará su 364° aniversario con un desfile, coordinado por la Corporación de Juntas de Vecinos Urbanas y Rurales y respaldado por la Municipalidad de Valdivia.',
    image_url: 'https://lipsum.app/random/480x320?i=1',
    slug: 'semana-animea-valdivia-364-aniversario',
    published_at: new Date().toISOString(),
  },
  {
    title: 'Las Ánimas festeja su aniversario con desfile cívico y coronación de reina animeña.',
    excerpt:
      'Las Ánimas celebra su aniversario con un desfile cívico. Fernanda Ibáñez, estudiante de kinesiología y residente de El Arenal, fue coronada reina animeña y representante de la tercera edad, del Club Arcoíris de la villa El Progreso, Haty Flaig.',
    image_url: 'https://lipsum.app/random/480x320?i=2',
    slug: 'animas-celebra-aniversario-desfile-civico',
    published_at: new Date().toISOString(),
  },
  {
    title: 'Nueva velada pugilística Gladiadores al nocaut con boxeo amateur y profesional este viernes.',
    excerpt:
      'Este viernes 29 habrá boxeo amateur y profesional en una nueva versión de la velada pugilística Gladiadores al nocaut, evento que organiza la productora Benbru Promotions, la misma productora de Daniela “La Leona” Asenjo.',
    image_url: 'https://lipsum.app/random/480x320?i=3',
    slug: 'velada-pugilistica-gladiadores-nocaut',
    published_at: new Date().toISOString(),
  },
  {
    title: 'El puente Las Ánimas en Yecapixtla será rehabilitado tras cinco años, vía Programa Nacional de Reconstrucción.',
    excerpt:
      'Luego de cinco años, el puente Las Ánimas ubicado en el municipio de Yecapixtla, será rehabilitado a través del Programa Nacional de Reconstrucción (PNR).',
    image_url: 'https://lipsum.app/random/480x320?i=4',
    slug: 'rehabilitacion-puente-las-animas-yecapixtla',
    published_at: new Date().toISOString(),
  },
  {
    title: 'Texto de ejemplo para la noticia lorem ipsum dolor sit amet.',
    excerpt:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent varius, nibh non ultrices gravida, nisl lorem blandit justo, sed vestibulum lacus est at sapien.',
    image_url: 'https://lipsum.app/random/480x320?i=5',
    slug: 'lorem-ipsum-dolor-sit-amet',
    published_at: new Date().toISOString(),
  },
]

async function importStaticNews() {
  // Delete existing news
  const { error: deleteError } = await supabase
    .from('news')
    .delete()
    .neq('id', 0) // delete all

  if (deleteError) {
    console.error('Error deleting existing news:', deleteError)
    return
  }

  for (const news of staticNews) {
    const { data, error } = await supabase
      .from('news')
      .insert(news)

    if (error) {
      console.error('Error importing news:', news.title, error)
    } else {
      console.log('Imported news:', news.title)
    }
  }
}

importStaticNews()
  .then(() => {
    console.log('Import completed')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Import failed', err)
    process.exit(1)
  })
