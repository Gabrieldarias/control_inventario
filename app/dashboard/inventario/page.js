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
  const [newForm, setNewForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCompraModal, setShowCompraModal] = useState(false);
  const [compraProductoId, setCompraProductoId] = useState("");
  const [compraCantidad, setCompraCantidad] = useState("");

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

  const handleNewChange = (event) => {
    const { name, value } = event.target;
    setNewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
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
      nombre: newForm.nombre,
      precio_compra: Number(newForm.precio_compra || 0),
      precio_venta: Number(newForm.precio_venta || 0),
      stock: Number(newForm.stock || 0),
    };

    const result = await supabase.from("inventory").insert(payload);

    if (result.error) {
      setError("No se pudo guardar el artículo.");
    } else {
      setNewForm(emptyForm);
      setShowNewForm(false);
      await cargarInventario();
    }
    setSaving(false);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      nombre: editForm.nombre,
      precio_compra: Number(editForm.precio_compra || 0),
      precio_venta: Number(editForm.precio_venta || 0),
      stock: Number(editForm.stock || 0),
    };

    const result = await supabase
      .from("inventory")
      .update(payload)
      .eq("id", editForm.id);

    if (result.error) {
      setError("No se pudo actualizar el artículo.");
    } else {
      setEditForm(emptyForm);
      setShowEditForm(false);
      await cargarInventario();
    }
    setSaving(false);
  };

  const handleEdit = (item) => {
    setEditForm({
      id: item.id,
      nombre: item.nombre,
      precio_compra: item.precio_compra,
      precio_venta: item.precio_venta,
      stock: item.stock,
    });
    setShowEditForm(true);
    setShowNewForm(false);
  };

  const closeEditForm = () => {
    setEditForm(emptyForm);
    setShowEditForm(false);
  };

  const openNewForm = () => {
    setNewForm(emptyForm);
    setShowNewForm(true);
    setShowEditForm(false);
  };

  const closeNewForm = () => {
    setNewForm(emptyForm);
    setShowNewForm(false);
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

  const handleCompraSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const producto = items.find((item) => item.id === compraProductoId);
    if (!producto) {
      setError("Selecciona un producto válido.");
      setSaving(false);
      return;
    }

    const cantidad = Number(compraCantidad || 0);
    const nuevoStock = producto.stock + cantidad;

    const { error: updateError } = await supabase
      .from("inventory")
      .update({ stock: nuevoStock })
      .eq("id", producto.id);

    if (updateError) {
      setError("No se pudo actualizar el stock.");
    } else {
      setShowCompraModal(false);
      setCompraProductoId("");
      setCompraCantidad("");
      await cargarInventario();
    }
    setSaving(false);
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
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={openNewForm} type="button">
            + Nuevo artículo
          </button>
          <button
            className="btn-outline"
            onClick={() => setShowCompraModal(true)}
            type="button"
          >
            + Agregar compra
          </button>
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

      {showNewForm && (
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Nuevo artículo</h2>
            <button className="btn-outline" type="button" onClick={closeNewForm}>
              Cerrar
            </button>
          </div>
          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <div>
            <label className="text-sm font-medium text-slate-700">Nombre</label>
            <input
              name="nombre"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={newForm.nombre}
              onChange={handleNewChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Stock</label>
            <input
              name="stock"
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={newForm.stock}
              onChange={handleNewChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Precio compra</label>
            <input
              name="precio_compra"
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={newForm.precio_compra}
              onChange={handleNewChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Precio venta</label>
            <input
              name="precio_venta"
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={newForm.precio_venta}
              onChange={handleNewChange}
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
              {saving ? "Guardando..." : "Agregar"}
            </button>
            <button className="btn-outline" type="button" onClick={closeNewForm}>
              Cancelar
            </button>
          </div>
          </form>
        </section>
      )}

      {showEditForm && (
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Editar artículo</h2>
            <button className="btn-outline" type="button" onClick={closeEditForm}>
              Cerrar
            </button>
          </div>
          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleUpdate}>
            <div>
              <label className="text-sm font-medium text-slate-700">Nombre</label>
              <input
                name="nombre"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={editForm.nombre}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Stock</label>
              <input
                name="stock"
                type="number"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={editForm.stock}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Precio compra</label>
              <input
                name="precio_compra"
                type="number"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={editForm.precio_compra}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Precio venta</label>
              <input
                name="precio_venta"
                type="number"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={editForm.precio_venta}
                onChange={handleEditChange}
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
                {saving ? "Guardando..." : "Actualizar"}
              </button>
              <button className="btn-outline" type="button" onClick={closeEditForm}>
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

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

      {showCompraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Agregar compra</h3>
              <button
                className="btn-outline"
                type="button"
                onClick={() => setShowCompraModal(false)}
              >
                Cerrar
              </button>
            </div>
            <form className="mt-4 grid gap-4" onSubmit={handleCompraSubmit}>
              <div>
                <label className="text-sm font-medium text-slate-700">Producto</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={compraProductoId}
                  onChange={(event) => setCompraProductoId(event.target.value)}
                  required
                >
                  <option value="">Selecciona un producto</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Cantidad</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={compraCantidad}
                  onChange={(event) => setCompraCantidad(event.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button className="btn-primary" type="submit" disabled={saving}>
                  {saving ? "Guardando..." : "Actualizar stock"}
                </button>
                <button
                  className="btn-outline"
                  type="button"
                  onClick={() => setShowCompraModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
