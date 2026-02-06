"use client";

import { useEffect, useMemo, useState } from "react";
import AdminHeader from "../../../components/AdminHeader";

const emptyForm = {
  id: "",
  email: "",
  password: "",
  role: "vendedor",
  nombre_local: "",
  nombre_persona: "",
  telefono: "",
};

export default function AdminUsuariosPage() {
  const [form, setForm] = useState(emptyForm);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const isEdit = useMemo(() => Boolean(form.id), [form.id]);

  const getAuthHeaders = async () => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return {};
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  };

  const cargarUsuarios = async () => {
    setLoading(true);
    setError("");
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/admin/users", {
        headers: authHeaders,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudieron cargar los usuarios.");
      }
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/admin/users", {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo guardar.");
      }
      setForm(emptyForm);
      setEditing(false);
      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (usuario) => {
    setForm({
      id: usuario.id,
      email: usuario.email,
      password: "",
      role: usuario.role,
      nombre_local: usuario.nombre_local || "",
      nombre_persona: usuario.nombre_persona || "",
      telefono: usuario.telefono || "",
    });
    setEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar vendedor?")) return;
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo eliminar.");
      }
      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(false);
  };

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Administración de vendedores"
        subtitle="Gestiona cuentas y perfiles del equipo de ventas."
      />

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? "Editar vendedor" : "Crear vendedor"}
        </h2>
        <p className="text-sm text-slate-500">
          Completa la información del vendedor. El rol define el acceso.
        </p>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Contraseña {isEdit && "(opcional)"}
            </label>
            <input
              name="password"
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.password}
              onChange={handleChange}
              placeholder={isEdit ? "Dejar vacío para mantener" : ""}
              required={!isEdit}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Rol</label>
            <select
              name="role"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.role}
              onChange={handleChange}
            >
              <option value="vendedor">Vendedor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Nombre del local</label>
            <input
              name="nombre_local"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.nombre_local}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Nombre de la persona</label>
            <input
              name="nombre_persona"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.nombre_persona}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Teléfono</label>
            <input
              name="telefono"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.telefono}
              onChange={handleChange}
            />
          </div>
          {error && (
            <div className="md:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </button>
            {editing && (
              <button className="btn-outline" type="button" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900">Vendedores registrados</h2>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Cargando usuarios...</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">Email</th>
                  <th>Nombre</th>
                  <th>Local</th>
                  <th>Rol</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="border-t border-slate-100">
                    <td className="py-3">{usuario.email}</td>
                    <td>{usuario.nombre_persona || "-"}</td>
                    <td>{usuario.nombre_local || "-"}</td>
                    <td className="capitalize">{usuario.role}</td>
                    <td className="text-right space-x-2">
                      <button
                        className="btn-outline"
                        type="button"
                        onClick={() => handleEdit(usuario)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-outline"
                        type="button"
                        onClick={() => handleDelete(usuario.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
