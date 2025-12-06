import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

type SolicitudRow = {
  id: string;
  nombres: string | null;
  apellidos: string | null;
  rut: string | null;
  correo: string;
  telefono: string | null;
  direccion: string | null;
  password_hash: string | null;
  estado: "pendiente" | "aprobado" | "rechazado" | null;
};

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const serverClient = await createServerClient();
    const { data: session } = await serverClient.auth.getUser();
    const adminId = session?.user?.id;
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: perfil, error: perfilError } = await serverClient.from("usuarios").select("rol").eq("id", adminId).single();
    if (perfilError || perfil?.rol !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const solicitudId = body?.solicitudId as string | undefined;
    if (!solicitudId) {
      return NextResponse.json({ error: "Missing solicitudId" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      console.error("[api/create-user] missing service configuration");
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const adminClient = createAdminClient(supabaseUrl, serviceKey);
    console.log("[admin] METODOS DISPONIBLES EN admin.auth:", {
      auth: Object.keys((adminClient as any).auth || {}),
      admin: Object.keys((adminClient as any).auth?.admin || {}),
      todos_los_metodos: JSON.stringify((adminClient as any).auth?.admin || {}, null, 2),
    });
    console.log("[api/create-user] buscando solicitud", solicitudId);
    const { data: solicitud, error: solicitudError } = await adminClient
      .from("solicitudes_registro")
      .select("id,nombres,apellidos,rut,correo,telefono,direccion,password_hash,estado")
      .eq("id", solicitudId)
      .single<SolicitudRow>();

    if (solicitudError || !solicitud) {
      console.error("[api/create-user] solicitud no encontrada", solicitudError);
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    if (solicitud.estado !== "pendiente") {
      console.warn("[api/create-user] solicitud con estado invalido", { estado: solicitud.estado });
      return NextResponse.json({ error: "La solicitud ya fue gestionada" }, { status: 400 });
    }

    let resolvedFirstNames = solicitud.nombres?.trim() ?? "";
    let resolvedLastNames = solicitud.apellidos?.trim() ?? "";
    const finalFullName = [resolvedFirstNames, resolvedLastNames].filter(Boolean).join(" ").trim();

    const metadataPayload = {
      nombre: finalFullName,
      nombres: resolvedFirstNames || null,
      apellidos: resolvedLastNames || null,
      rut: solicitud.rut,
      telefono: solicitud.telefono,
      direccion: solicitud.direccion,
    };
    console.log("[admin] DATOS QUE SE ENVIAN A AUTH:", {
      email: solicitud.correo,
      password: solicitud.password_hash,
      metadata: metadataPayload,
      longitud_password: solicitud.password_hash?.length,
    });

    // 1. Buscamos si ya existe alguien con este RUT en la tabla usuarios (identidad fuerte)
    const { data: profileByRut } = await adminClient
      .from("usuarios")
      .select("id, correo")
      .eq("rut", solicitud.rut)
      .single();

    let userId = profileByRut?.id ?? null;
    let existingUser: any = null;

    if (userId) {
      console.log(`[admin] RUT ${solicitud.rut} ya existe en usuarios (ID: ${userId}). Reutilizando identidad.`);

      // SAFEGUARD: Check if the existing user is an admin
      const { data: targetProfile } = await adminClient
        .from("usuarios")
        .select("rol")
        .eq("id", userId)
        .single();

      if (targetProfile?.rol === "admin") {
        console.error(`[admin] INTENTO DE SOBREESCRIBIR UNA CUENTA DE ADMIN (ID: ${userId}). ABORTANDO.`);
        return NextResponse.json(
          { error: "Conflicto: El RUT pertenece a un administrador existente. No se puede sobrescribir." },
          { status: 409 }
        );
      }

      // Verificamos si existe el usuario en Auth con este ID
      const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId);

      if (authUser && authUser.user) {
        existingUser = authUser.user;
        // Si el correo es diferente, intentamos actualizarlo
        if (existingUser.email?.toLowerCase() !== solicitud.correo.toLowerCase()) {
          console.log(`[admin] Actualizando correo de usuario existente: ${existingUser.email} -> ${solicitud.correo}`);
          const { error: updateEmailError } = await adminClient.auth.admin.updateUserById(userId, {
            email: solicitud.correo,
            user_metadata: metadataPayload
          });
          if (updateEmailError) {
            console.warn("[admin] No se pudo actualizar el correo (posiblemente en uso):", updateEmailError);
            // Opcional: Si el correo está en uso por OTRO usuario, decidir si eliminar ese otro o fallar.
            // Por ahora, lanzamos error para manual intervention si falla cambio email
            if (updateEmailError.message.includes("already registered")) {
              // Intento agresivo: Borrar el usuario que ocupa el correo email B (si no es el mismo ID)
              const { data: userWithEmail } = await getAuthUserByEmail({ adminClient, email: solicitud.correo, supabaseUrl, serviceKey });
              if (userWithEmail?.user && userWithEmail.user.id !== userId) {
                console.warn(`[admin] Eliminando usuario fantasma ${userWithEmail.user.id} que ocupa el correo ${solicitud.correo}`);
                await adminClient.auth.admin.deleteUser(userWithEmail.user.id);
                // Reintentar update
                const { error: retryError } = await adminClient.auth.admin.updateUserById(userId, { email: solicitud.correo });
                if (retryError) throw retryError;
              }
            } else {
              throw updateEmailError;
            }
          }
        }
      } else {
        console.warn(`[admin] Perfil existe (ID ${userId}) pero Usuario Auth no se encontró. IGNORANDO perfil existente para evitar conflictos y creando uno nuevo.`);
        // NO BORRAMOS el perfil existente para evitar borrar al admin por error si hay desincronización.
        // Simplemente procedemos como si no existiera (userId = null) para que cree uno nuevo.
        // Si el RUT es unique en la DB, fallará mas adelante, lo cual es preferible a borrar datos.
        userId = null;
        existingUser = null;
      }
    }

    // 2. Si no encontramos por RUT, buscamos por Email (Logic Original)
    if (!userId) {
      const { data: existingUserData, error: checkError } = await getAuthUserByEmail({
        adminClient,
        email: solicitud.correo,
        supabaseUrl,
        serviceKey,
      });
      existingUser = existingUserData?.user ?? null;
      console.log("[admin] VERIFICACION POR EMAIL:", {
        email: solicitud.correo,
        usuario_existe: Boolean(existingUser),
        id: existingUser?.id
      });

      // Si existe usuario por email pero NO por RUT (porque userId era null), 
      // podría ser que el usuario Auth existe pero no tiene perfil en 'usuarios' todavía 
      // O tiene perfil con OTRO rut (lo cual sería conflicto si el RUT viene en solitud).

      // Sin embargo, si llegamos aquí, NO hay perfil con ese RUT. 
      // Así que es seguro usar este Auth User.

      if (existingUser) {
        userId = existingUser.id;
      }
    }

    if (userId) {
      // GLOBAL SAFEGUARD: Check if the existing user is an admin
      // This protects against both RUT and Email collisions
      const { data: targetProfile } = await adminClient
        .from("usuarios")
        .select("rol")
        .eq("id", userId)
        .single();

      if (targetProfile?.rol === "admin") {
        console.error(`[admin] INTENTO DE SOBREESCRIBIR UNA CUENTA DE ADMIN (ID: ${userId}). ABORTANDO.`);
        return NextResponse.json(
          { error: "Conflicto: La cuenta destino es de un administrador. No se puede sobrescribir." },
          { status: 409 }
        );
      }

      console.log("[admin] USUARIO YA EXISTE - USANDO USUARIO EXISTENTE");
      const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: metadataPayload,
      });
      if (updateError) {
        console.error("[admin] Error actualizando metadata:", updateError);
      }
      logPasswordUsage({
        client: adminClient,
        email: solicitud.correo,
        passwordHash: solicitud.password_hash || null,
        passwordFinal: solicitud.password_hash || "EXISTING_USER",
        usingProvidedHash: true,
        nota: "usuario ya existia",
      }).catch((logError) => console.warn("[admin] no se pudo registrar log de password", logError));
    } else {
      if (!solicitud.password_hash) {
        console.error("[api/create-user] solicitud sin password_hash y no existe usuario previo");
        return NextResponse.json({ error: "Solicitud sin contrasena asociada" }, { status: 400 });
      }

      console.log("[admin] CREANDO NUEVO USUARIO");
      const usingProvidedHash = Boolean(solicitud.password_hash && solicitud.password_hash.length >= 6);
      const passwordForCreation = usingProvidedHash ? solicitud.password_hash! : generarPasswordFuerte();
      if (!usingProvidedHash) {
        console.warn("[admin] password hash ausente o corto, se usa password generado");
      }
      console.log("[admin] origen de password para createUser", {
        usingProvidedHash,
        hashLength: solicitud.password_hash?.length ?? 0,
      });
      logPasswordUsage({
        client: adminClient,
        email: solicitud.correo,
        passwordHash: solicitud.password_hash || null,
        passwordFinal: passwordForCreation,
        usingProvidedHash,
      }).catch((logError) => console.warn("[admin] no se pudo registrar log de password", logError));

      console.log("[api/create-user] creando usuario en Supabase Auth");
      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email: solicitud.correo,
        password: passwordForCreation,
        email_confirm: true,
        user_metadata: metadataPayload,
      });

      if (createError) {
        console.error("[api/create-user] error creando usuario", createError);
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      userId = created.user?.id ?? null;
      if (!userId) {
        console.error("[api/create-user] createUser sin id");
        return NextResponse.json({ error: "No se obtuvo el ID del usuario creado" }, { status: 500 });
      }
      logPasswordUsage({
        client: adminClient,
        email: solicitud.correo,
        passwordHash: solicitud.password_hash || null,
        passwordFinal: passwordForCreation,
        usingProvidedHash,
        nota: "usuario nuevo creado",
      }).catch((logError) => console.warn("[admin] no se pudo registrar log de password", logError));
    }

    console.log("[api/create-user] guardando perfil en usuarios", { userId });
    const profilePayload = {
      id: userId,
      nombres: resolvedFirstNames || null,
      apellidos: resolvedLastNames || null,
      correo: solicitud.correo,
      rut: solicitud.rut,
      telefono: solicitud.telefono,
      direccion: solicitud.direccion,
      rol: "usuario",
      estado: "activo",
    };

    const { error: profileError } = await adminClient.from("usuarios").upsert(profilePayload, { onConflict: "id" });
    if (profileError) {
      console.error("[api/create-user] error guardando perfil", profileError);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    console.log("[api/create-user] usuario creado correctamente");
    return NextResponse.json({ userId });
  } catch (error: any) {
    console.error("[api/create-user] unexpected error", error);
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}

function generarPasswordFuerte(length = 12) {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[]<>?,.";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return password;
}

async function getAuthUserByEmail({
  adminClient,
  email,
  supabaseUrl,
  serviceKey,
}: {
  adminClient: ReturnType<typeof createAdminClient>;
  email: string;
  supabaseUrl: string;
  serviceKey: string;
}) {
  const directFn = (adminClient as any)?.auth?.admin?.getUserByEmail;
  if (typeof directFn === "function") {
    return directFn(email);
  }

  const endpoint = `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`;
  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        data: null,
        error: { message: `HTTP ${response.status} ${response.statusText}` },
      };
    }

    const raw = await response.json();

    // API returns a list of users, possibly ignoring the email filter.
    // We MUST filter manually to be sure.
    let user = null;
    if (Array.isArray(raw?.users)) {
      user = raw.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase()) || null;
    } else if (raw?.user && raw.user.email?.toLowerCase() === email.toLowerCase()) {
      // Fallback for some API versions that return single object
      user = raw.user;
    }

    return { data: user ? { user } : null, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error?.message || "Fallback getUserByEmail failed" } };
  }
}

async function logPasswordUsage({
  client,
  email,
  passwordHash,
  passwordFinal,
  usingProvidedHash,
  nota,
}: {
  client: ReturnType<typeof createAdminClient>;
  email: string;
  passwordHash: string | null;
  passwordFinal: string;
  usingProvidedHash: boolean;
  nota?: string;
}) {
  try {
    const info = {
      email,
      hash_proporcionado: passwordHash,
      password_usado_preview: passwordFinal ? passwordFinal.slice(0, 8) : null,
      password_usado_length: passwordFinal?.length ?? 0,
      origen: usingProvidedHash ? "hash_proporcionado" : "generado_aleatorio",
      nota: nota || null,
      fecha_registro: new Date().toISOString(),
    };
    console.log("[admin] ORIGEN DE PASSWORD - VERIFICACION:", info);
    const { error } = await client.from("logs_creacion_usuarios").insert(info);
    if (error) {
      console.warn("[admin] logPasswordUsage fallo insertando log", error);
    }
  } catch (error) {
    console.warn("[admin] logPasswordUsage fallo inesperado", error);
  }
}
