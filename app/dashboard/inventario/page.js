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
  const [compraItems, setCompraItems] = useState([]);
  const [compraSearch, setCompraSearch] = useState("");

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
      stock: 0,
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
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 14;
    const pageWidth = 210;
    const fechaTexto = new Date().toLocaleString("es-VE");

    const addDivider = (y) => {
      doc.setDrawColor(220);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
    };

    let y = 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Inventario", margin, y);
    doc.setFontSize(12);
    doc.text("Reporte de existencias", margin, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Fecha: ${fechaTexto}`, pageWidth - margin, y, { align: "right" });

    y += 16;
    addDivider(y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("Producto", margin, y);
    doc.text("Stock", margin + 95, y);
    doc.text("Compra", margin + 120, y);
    doc.text("Venta", margin + 155, y);
    doc.setFont("helvetica", "normal");
    y += 4;
    addDivider(y);
    y += 6;

    items.forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 18;
      }
      doc.text(String(item.nombre || "Producto"), margin, y);
      doc.text(String(item.stock ?? 0), margin + 95, y);
      doc.text(formatUsd(item.precio_compra), margin + 120, y);
      doc.text(formatUsd(item.precio_venta), margin + 155, y);
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

    if (compraItems.length === 0) {
      setError("Agrega al menos un producto.");
      setSaving(false);
      return;
    }

    const updates = compraItems.map((linea) => {
      const cantidad = Number(linea.cantidad || 0);
      const compra = Number(linea.precio_compra || 0);
      const venta = Number(linea.precio_venta || 0);
      const nuevoStock = Number(linea.stock_actual || 0) + cantidad;

      return supabase
        .from("inventory")
        .update({
          stock: nuevoStock,
          precio_compra: compra,
          precio_venta: venta,
        })
        .eq("id", linea.id);
    });

    const results = await Promise.all(updates);
    const updateError = results.find((result) => result.error)?.error;

    if (updateError) {
      setError("No se pudo actualizar el stock.");
    } else {
      setShowCompraModal(false);
      setCompraItems([]);
      setCompraSearch("");
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
          <div className="card w-full max-w-4xl p-6">
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
                <label className="text-sm font-medium text-slate-700">Buscar producto</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Escribe para buscar..."
                  value={compraSearch}
                  onChange={(event) => setCompraSearch(event.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <div className="text-sm font-semibold text-slate-700">Selecciona productos</div>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200">
                  {items
                    .filter((item) =>
                      item.nombre
                        ?.toLowerCase()
                        .includes(compraSearch.trim().toLowerCase())
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                        onClick={() => {
                          setCompraItems((prev) =>
                            prev.some((linea) => linea.id === item.id)
                              ? prev
                              : [
                                  ...prev,
                                  {
                                    id: item.id,
                                    nombre: item.nombre,
                                    stock_actual: item.stock,
                                    cantidad: "",
                                    precio_compra: item.precio_compra ?? "",
                                    precio_venta: item.precio_venta ?? "",
                                  },
                                ]
                          );
                        }}
                      >
                        <span>{item.nombre}</span>
                        <span className="text-xs text-slate-500">
                          Stock: {item.stock}
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              {compraItems.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500">
                      <tr>
                        <th className="py-2">Producto</th>
                        <th>Stock actual</th>
                        <th>Cantidad</th>
                        <th>Precio compra</th>
                        <th>Precio venta</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      {compraItems.map((linea) => (
                        <tr key={linea.id} className="border-t border-slate-100">
                          <td className="py-3">{linea.nombre}</td>
                          <td>{linea.stock_actual}</td>
                          <td>
                            <input
                              type="number"
                              className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                              value={linea.cantidad}
                              onChange={(event) =>
                                setCompraItems((prev) =>
                                  prev.map((item) =>
                                    item.id === linea.id
                                      ? { ...item, cantidad: event.target.value }
                                      : item
                                  )
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                              value={linea.precio_compra}
                              onChange={(event) =>
                                setCompraItems((prev) =>
                                  prev.map((item) =>
                                    item.id === linea.id
                                      ? { ...item, precio_compra: event.target.value }
                                      : item
                                  )
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                              value={linea.precio_venta}
                              onChange={(event) =>
                                setCompraItems((prev) =>
                                  prev.map((item) =>
                                    item.id === linea.id
                                      ? { ...item, precio_venta: event.target.value }
                                      : item
                                  )
                                )
                              }
                            />
                          </td>
                          <td className="text-right">
                            <button
                              className="btn-outline"
                              type="button"
                              onClick={() =>
                                setCompraItems((prev) =>
                                  prev.filter((item) => item.id !== linea.id)
                                )
                              }
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
