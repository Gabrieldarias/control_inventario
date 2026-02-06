"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "../../../lib/supabaseClient";
import { formatUsd } from "../../../utils/currency";
import { jsPDF } from "jspdf";

const emptyForm = {
  id: "",
  nombre: "",
  precio_compra: "",
  precio_venta: "",
  stock: "",
};

export default function InventarioPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const cargarInventario = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("No se pudo cargar el inventario.");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("No se pudo validar el usuario.");
      setSaving(false);
      return;
    }

    const payload = {
      user_id: user.id,
      nombre: form.nombre,
      precio_compra: Number(form.precio_compra || 0),
      precio_venta: Number(form.precio_venta || 0),
      stock: Number(form.stock || 0),
    };

    const result = form.id
      ? await supabase.from("inventory").update(payload).eq("id", form.id)
      : await supabase.from("inventory").insert(payload);

    if (result.error) {
      setError("No se pudo guardar el artículo.");
    } else {
      setForm(emptyForm);
      await cargarInventario();
    }
    setSaving(false);
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      nombre: item.nombre,
      precio_compra: item.precio_compra,
      precio_venta: item.precio_venta,
      stock: item.stock,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar artículo del inventario?")) return;
    const { error: deleteError } = await supabase
      .from("inventory")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError("No se pudo eliminar el artículo.");
    } else {
      await cargarInventario();
    }
  };

  const generarPdf = (preview = true) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Inventario actual", 14, 20);
    doc.setFontSize(10);
    let y = 30;
    items.forEach((item) => {
      doc.text(
        `${item.nombre} | Stock: ${item.stock} | Venta: ${formatUsd(
          item.precio_venta
        )}`,
        14,
        y
      );
      y += 6;
    });
    if (preview) {
      const blobUrl = doc.output("bloburl");
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } else {
      doc.save("inventario.pdf");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
          <p className="text-sm text-slate-500">
            Administra tus productos y existencias.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={() => generarPdf(true)} type="button">
            Vista previa PDF
          </button>
          <button className="btn-outline" onClick={() => generarPdf(false)} type="button">
            Descargar PDF
          </button>
        </div>
      </header>

      <section className="card p-4">
        <input
          type="text"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          placeholder="Buscar producto por nombre..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {form.id ? "Editar artículo" : "Nuevo artículo"}
        </h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">Nombre</label>
            <input
              name="nombre"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Stock</label>
            <input
              name="stock"
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Precio compra</label>
            <input
              name="precio_compra"
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.precio_compra}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Precio venta</label>
            <input
              name="precio_venta"
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={form.precio_venta}
              onChange={handleChange}
              required
            />
          </div>
          {error && (
            <div className="md:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="md:col-span-2 flex gap-3">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Guardando..." : form.id ? "Actualizar" : "Agregar"}
            </button>
            {form.id && (
              <button
                className="btn-outline"
                type="button"
                onClick={() => setForm(emptyForm)}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900">Productos</h2>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Cargando...</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">Producto</th>
                  <th>Stock</th>
                  <th>Compra</th>
                  <th>Venta</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {items
                  .filter((item) =>
                    item.nombre
                      ?.toLowerCase()
                      .includes(search.trim().toLowerCase())
                  )
                  .map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="py-3">{item.nombre}</td>
                    <td>{item.stock}</td>
                    <td>{formatUsd(item.precio_compra)}</td>
                    <td>{formatUsd(item.precio_venta)}</td>
                    <td className="text-right space-x-2">
                      <button className="btn-outline" onClick={() => handleEdit(item)}>
                        Editar
                      </button>
                      <button className="btn-outline" onClick={() => handleDelete(item.id)}>
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
