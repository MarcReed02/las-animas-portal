import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CategoryGroup = {
  name: string;
  subs: string[];
};

export async function GET() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categorias")
    .select("id, nombre, parent_id")
    .order("orden");

  if (error || !categories) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ data: [] }, { status: 500 });
  }

  const groups: CategoryGroup[] = [];
  const parentMap = new Map<string, CategoryGroup>();

  // First pass: Create groups for parents
  categories.forEach((cat) => {
    if (!cat.parent_id) {
      const group = { name: cat.nombre, subs: [] };
      groups.push(group);
      parentMap.set(cat.id, group);
    }
  });

  // Second pass: Add children to parents
  categories.forEach((cat) => {
    if (cat.parent_id) {
      const parent = parentMap.get(cat.parent_id);
      if (parent) {
        parent.subs.push(cat.nombre);
      }
    }
  });

  return NextResponse.json({ data: groups });
}
