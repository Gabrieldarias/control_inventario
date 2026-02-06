import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseRouteClient } from "../../../../lib/supabaseClient";
import { createSupabaseAdminClient } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";

const ensureAdmin = async () => {
  const supabase = createSupabaseRouteClient(cookies());
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "No autorizado", status: 401 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Sin permisos", status: 403 };
  }

  return { ok: true };
};

export async function GET() {
  const authCheck = await ensureAdmin();
  if (!authCheck.ok) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const admin = createSupabaseAdminClient();
  const { data: usersData, error: usersError } = await admin.auth.admin.listUsers();
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 400 });
  }

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("*");

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 400 });
  }

  const profilesMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const response = usersData.users.map((user) => {
    const profile = profilesMap.get(user.id);
    return {
      id: user.id,
      email: user.email,
      role: profile?.role || "vendedor",
      nombre_local: profile?.nombre_local || "",
      nombre_persona: profile?.nombre_persona || "",
      telefono: profile?.telefono || "",
    };
  });

  return NextResponse.json(response);
}

export async function POST(request) {
  const authCheck = await ensureAdmin();
  if (!authCheck.ok) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const body = await request.json();
  const { email, password, role, nombre_local, nombre_persona, telefono } = body;

  if (!email || !password || !nombre_local || !nombre_persona) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: userData.user.id,
    role: role || "vendedor",
    nombre_local,
    nombre_persona,
    telefono,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ id: userData.user.id });
}

export async function PUT(request) {
  const authCheck = await ensureAdmin();
  if (!authCheck.ok) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const body = await request.json();
  const { id, email, password, role, nombre_local, nombre_persona, telefono } = body;

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  if (email || password) {
    const { error: updateAuthError } = await admin.auth.admin.updateUserById(id, {
      email: email || undefined,
      password: password || undefined,
    });

    if (updateAuthError) {
      return NextResponse.json({ error: updateAuthError.message }, { status: 400 });
    }
  }

  const { error: updateProfileError } = await admin
    .from("profiles")
    .update({
      role: role || "vendedor",
      nombre_local,
      nombre_persona,
      telefono,
    })
    .eq("id", id);

  if (updateProfileError) {
    return NextResponse.json({ error: updateProfileError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const authCheck = await ensureAdmin();
  if (!authCheck.ok) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error: deleteAuthError } = await admin.auth.admin.deleteUser(id);
  if (deleteAuthError) {
    return NextResponse.json({ error: deleteAuthError.message }, { status: 400 });
  }

  await admin.from("profiles").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}
