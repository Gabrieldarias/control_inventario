export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabaseClient";

export default async function Home() {
  const supabase = createSupabaseServerClient(cookies());
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    redirect("/admin/usuarios");
  }

  if (profile?.role === "vendedor") {
    redirect("/dashboard/ventas");
  }

  redirect("/login");
}
