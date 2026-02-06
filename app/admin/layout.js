export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabaseClient";

export default async function AdminLayout({ children }) {
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

  if (!profile?.role) {
    redirect("/login?perfil=missing");
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard/ventas");
  }

  return <div className="min-h-screen px-6 py-10">{children}</div>;
}
