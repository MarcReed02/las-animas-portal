import { createClient } from "@/lib/supabase/server";
import HomeClient from "@/components/home-client";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();

  // Fetch news for the agenda section
  const { data: news } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(3);

  const bucket = process.env.NEXT_PUBLIC_SUPABASE_NEWS_BUCKET || 'noticias_portadas';

  // Process images (similar to the API route logic)
  const newsItems = await Promise.all((news || []).map(async (row: any) => {
    const img = row.image_url as string | null
    if (img && !/^https?:\/\//i.test(img)) {
      try {
        const signed = await supabase.storage.from(bucket).createSignedUrl(img, 60 * 60)
        if (signed.data?.signedUrl) {
          return { ...row, image_url: signed.data.signedUrl }
        }
      } catch { }
    }
    return row
  }));

  return <HomeClient newsItems={newsItems} />;
}
