

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import NewsDetailClient from "@/components/news-detail-client";

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // console.log(`[NewsDetailPage] Start.Slug received: "${slug}"`);

  const supabase = await createClient();

  // Fetch news item by slug
  // console.log(`[NewsDetailPage] Fetching from DB(table: news)...`);
  const { data: newsItem, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .single();

  if (newsItem) {
    // console.log(`[NewsDetailPage] Found in DB: `, newsItem.titulo || newsItem.title);
  } else {
    console.error(`[NewsDetailPage] Not found in DB.Error: `, error?.message);
  }

  // Fallback for Mock Data (Development Mode)
  if (!newsItem) {
    // console.log(`[NewsDetailPage] Attempting Mock Fallback for slug: "${slug}"`);

    const mockData: Record<string, any> = {
      "gran-feria-de-emprendedores": {
        title: "Gran Feria de Emprendedores Animeños",
        published_at: "2025-10-15",
        author: "Cámara de Comercio",
        location: "Plaza Las Ánimas, Valdivia",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Feria_Fluvial%2C_Valdivia%2C_20190216_-_04.jpg",
        content: `La Cámara de Comercio de Las Ánimas se complace en invitar a toda la comunidad a la tercera versión de nuestra Feria de Emprendedores.
        
Este evento busca visibilizar el talento local, ofreciendo un espacio para que artesanos, gastrónomos y pequeños productores puedan mostrar y vender sus productos directamente a los vecinos.

Contaremos con más de 30 stands confirmados, música en vivo y actividades para niños.Es una oportunidad perfecta para redescubrir lo que nuestro barrio tiene para ofrecer y apoyar la economía local.

La seguridad estará garantizada con el apoyo de la junta de vecinos y seguridad ciudadana, para que puedas disfrutar en familia con total tranquilidad.`
      },
      "reunion-abierta-camara-de-comercio": {
        title: "Reunión Abierta Cámara de Comercio",
        published_at: "2025-10-10",
        author: "Directiva",
        location: "Sede Social",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/2/23/R%C3%ADo_Calle_Calle%2C_Valdivia._Sur_de_Chile.jpg",
        content: "Invitamos a todos los comerciantes a participar en la planificación de las actividades de fin de año. Tu opinión es fundamental para el crecimiento del barrio."
      },
      "taller-gratuito-tu-negocio-en-internet": {
        title: 'Taller Gratuito: "Tu Negocio en Internet"',
        published_at: "2025-10-05",
        author: "Municipalidad",
        location: "Online / Zoom",
        image_url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Puente_de_Las_%C3%81nimas_03.jpg",
        content: "Capacitación para aprender a gestionar tu ficha en el portal y mejorar tus redes sociales. No te quedes fuera de la transformación digital."
      }
    };

    const mockItem = mockData[slug];

    if (mockItem) {
      // console.log(`[NewsDetailPage] Using Mock Data.`);
      return <NewsDetailClient newsItem={mockItem} />;
    }

    // If not in DB and not a mock, then 404
    console.error(`[NewsDetailPage] No data found(DB or Mock) for slug: "${slug}".Triggering 404.`);
    // console.error("DB Error details:", error);
    notFound();
  }

  // Map DB fields to Component props
  const mappedItem = {
    title: newsItem.titulo || newsItem.title, // Handle potential Spanish/English col names
    published_at: newsItem.published_at || newsItem.created_at,
    author: newsItem.autor || "Cámara de Comercio", // Fallback if col doesn't exist
    location: newsItem.ubicacion || "Las Ánimas, Valdivia", // Check if this col exists, otherwise undefined
    image_url: newsItem.image_url || newsItem.url_imagen,
    // Add excerpt as a primary source for content since user requested it
    content: newsItem.content || newsItem.body || newsItem.excerpt || "Contenido no disponible.",
  };

  return <NewsDetailClient newsItem={mappedItem} />;
}

