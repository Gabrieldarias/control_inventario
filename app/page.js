"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../lib/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const redirectUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.role === "admin") {
        router.replace("/admin/usuarios");
        return;
      }

      if (profile?.role === "vendedor") {
        router.replace("/dashboard/ventas");
        return;
      }

      router.replace("/login");
    };

    redirectUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
      Cargando...
    </div>
  );
}
