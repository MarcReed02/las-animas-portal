
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminUsersClient from "@/components/admin-users-client";

export const dynamic = "force-dynamic";

export default async function AdminUsuarios() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const adminClient = createAdminClient(supabaseUrl, serviceKey);

  // Check if current user is admin
  const { data: profile, error: profileError } = await adminClient
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  console.log("[AdminUsersPage] Debug Info:");
  console.log("- User ID:", user.id);
  console.log("- Profile Data:", profile);
  console.log("- Profile Error:", profileError);

  if (profile?.rol !== "admin") {
    console.log("[AdminUsersPage] Access Denied. Redirecting to home. Role found:", profile?.rol);
    redirect("/");
  }

  // Fetch all standard users
  const { data: usersData, error } = await adminClient
    .from("usuarios")
    .select("*")
    .eq("rol", "usuario")
    .order("nombres", { ascending: true });

  if (error) {
    return (
      <div className="text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-400">No se pudieron cargar los usuarios: {error.message}</p>
      </div>
    );
  }

  // Ensure type safety mapping if needed, but the structure matches mostly.
  // Converting nulls to undefined or matching types is good practice.
  // The component expects "UserRow" which matches the DB schema mostly.

  return <AdminUsersClient users={usersData || []} />;
}
