"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile?.role === "admin") {
          router.replace("/admin/usuarios");
        } else if (profile?.role === "vendedor") {
          router.replace("/dashboard/ventas");
        }
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Credenciales inválidas.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      setError("No se pudo obtener el perfil del usuario.");
      setLoading(false);
      return;
    }

    if (!profile?.role) {
      setError("Tu usuario no tiene perfil. Contacta al administrador.");
      setLoading(false);
      return;
    }

    if (profile.role === "admin") {
      router.replace("/admin/usuarios");
    } else {
      router.replace("/dashboard/ventas");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md card p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-500">Gestion Comercial</p>
          <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
          <p className="text-sm text-slate-500">
            Accede con tu correo y contraseña.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error && (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
