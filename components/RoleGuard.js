"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../lib/supabaseClient";

export default function RoleGuard({ requiredRole }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const validate = async () => {
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

      if (!profile?.role) {
        router.replace("/login?perfil=missing");
        return;
      }

      if (requiredRole === "admin" && profile.role !== "admin") {
        router.replace("/dashboard/ventas");
        return;
      }

      if (requiredRole === "vendedor" && profile.role !== "vendedor") {
        router.replace("/admin/usuarios");
        return;
      }

      if (pathname === "/login") {
        router.replace(
          profile.role === "admin" ? "/admin/usuarios" : "/dashboard/ventas"
        );
        return;
      }

      setChecking(false);
    };

    validate();
  }, [pathname, requiredRole, router]);

  if (checking) {
    return (
      <div className="px-6 py-10 text-sm text-slate-500">Validando acceso...</div>
    );
  }

  return null;
}
