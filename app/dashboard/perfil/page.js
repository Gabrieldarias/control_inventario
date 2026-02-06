"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "../../../lib/supabaseClient";

const emptyProfile = {
  nombre_local: "",
  nombre_persona: "",
  telefono: "",
};

export default function PerfilPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState(emptyProfile);
  const [passwords, setPasswords] = useState({
    nueva: "",
    confirmar: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const cargarPerfil = async () => {
    setLoading(true);
    setError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("No se pudo obtener el usuario.");
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("nombre_local, nombre_persona, telefono")
      .eq("id", user.id)
      .single();

    if (fetchError) {
      setError("No se pudo cargar el perfil.");
    } else {
      setProfile({
        nombre_local: data?.nombre_local || "",
        nombre_persona: data?.nombre_persona || "",
        telefono: data?.telefono || "",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("No se pudo obtener el usuario.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        nombre_local: profile.nombre_local,
        nombre_persona: profile.nombre_persona,
        telefono: profile.telefono,
      })
      .eq("id", user.id);

    if (updateError) {
      setError("No se pudo actualizar el perfil.");
      setSaving(false);
      return;
    } else {
      setSuccess("Perfil actualizado correctamente.");
    }

    if (passwords.nueva || passwords.confirmar) {
      if (passwords.nueva !== passwords.confirmar) {
        setError("Las contraseñas no coinciden.");
        setSaving(false);
        return;
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password: passwords.nueva,
      });

      if (passwordError) {
        setError("No se pudo actualizar la contraseña.");
        setSaving(false);
        return;
      }

      setPasswords({ nueva: "", confirmar: "" });
      setSuccess("Perfil y contraseña actualizados correctamente.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Perfil</h1>
        <p className="text-sm text-slate-500">
          Actualiza la información de tu negocio y contacto.
        </p>
      </header>

      <section className="card p-6">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando perfil...</p>
        ) : (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-700">Nombre del local</label>
              <input
                name="nombre_local"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={profile.nombre_local}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Nombre de la persona</label>
              <input
                name="nombre_persona"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={profile.nombre_persona}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Teléfono</label>
              <input
                name="telefono"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={profile.telefono}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Nueva contraseña</label>
              <input
                name="nueva"
                type="password"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={passwords.nueva}
                onChange={handlePasswordChange}
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Confirmar contraseña</label>
              <input
                name="confirmar"
                type="password"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={passwords.confirmar}
                onChange={handlePasswordChange}
                placeholder="Repite la nueva contraseña"
              />
            </div>
            {error && (
              <div className="md:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="md:col-span-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </div>
            )}
            <div className="md:col-span-2">
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
