"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../lib/supabaseClient";

const items = [
  { href: "/dashboard/ventas", label: "Ventas" },
  { href: "/dashboard/inventario", label: "Inventario" },
  { href: "/dashboard/facturas", label: "Facturas" },
  { href: "/dashboard/perfil", label: "Perfil" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <aside className="w-full md:w-64">
      <div className="card p-6 h-full flex flex-col">
        <div className="mb-8">
          <p className="text-xs font-semibold text-slate-500">Gestion Comercial</p>
          <h2 className="text-lg font-bold text-slate-900">Panel vendedor</h2>
        </div>
        <nav className="flex-1 space-y-2">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button className="btn-outline mt-6" onClick={handleLogout} type="button">
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
