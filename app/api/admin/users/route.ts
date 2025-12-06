
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    const serverClient = await createServerClient();
    const { data: session } = await serverClient.auth.getUser();
    const adminId = session?.user?.id;

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: perfil, error: perfilError } = await serverClient
      .from("usuarios")
      .select("rol")
      .eq("id", adminId)
      .single();

    if (perfilError || perfil?.rol !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, estado } = body;

    if (!userId || !estado) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validStates = ["activo", "suspendido"];
    if (!validStates.includes(estado)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const adminClient = createAdminClient(supabaseUrl, serviceKey);

    // Update 'usuarios' table
    const { error: updateError } = await adminClient
      .from("usuarios")
      .update({ estado })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user status:", updateError);
      return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const serverClient = await createServerClient();
    const { data: session } = await serverClient.auth.getUser();
    const adminId = session?.user?.id;

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: perfil, error: perfilError } = await serverClient
      .from("usuarios")
      .select("rol")
      .eq("id", adminId)
      .single();

    if (perfilError || perfil?.rol !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const adminClient = createAdminClient(supabaseUrl, serviceKey);

    // Delete from Supabase Auth
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      // We continue to try delete from public table even if auth fails, or maybe strict?
      // Usually if auth delete fails it might be critical, but sometimes user is not in auth.
      // Let's return error for safety.
      return NextResponse.json({ error: "Failed to delete auth user: " + deleteAuthError.message }, { status: 500 });
    }

    // Delete associated business requests/listings first
    const { error: deleteAnunciosError } = await adminClient
      .from('anuncio_solicitudes')
      .delete()
      .eq('user_id', userId);

    if (deleteAnunciosError) {
      console.warn("Error deleting user announcements:", deleteAnunciosError);
      // We proceed even if this fails, as strict DB constraints might handle it or it's not critical enough to block auth deletion
    }

    // Delete from public 'usuarios' table (should cascade typically, but explicit delete is safer if no cascade)
    const { error: deleteProfileError } = await adminClient
      .from('usuarios')
      .delete()
      .eq('id', userId);

    if (deleteProfileError) {
      console.warn("Error deleting public profile (might have cascaded):", deleteProfileError);
    }

    // Also delete any existing ad request or data related?
    // Assuming cascade on delete takes care of it, or we leave it orphan?
    // Best effort cleanup can be added here if needed.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
