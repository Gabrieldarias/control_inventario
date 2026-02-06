export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { createSupabaseServerClient } from "../../lib/supabaseClient";

export default async function DashboardLayout({ children }) {
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

  if (profile?.role !== "vendedor") {
    redirect("/admin/usuarios");
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
