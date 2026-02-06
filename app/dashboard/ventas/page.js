"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "../../../lib/supabaseClient";
import { formatBs, formatUsd } from "../../../utils/currency";

export default function VentasPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [inventario, setInventario] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [tasaBs, setTasaBs] = useState(36.5);
  const [moneda, setMoneda] = useState("USD");
  const [metodo1, setMetodo1] = useState("Pago Movil");
  const [metodo2, setMetodo2] = useState("BS en efectivo");
  const [monto1, setMonto1] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const metodosPago = [
    { label: "Pago Movil", moneda: "BS" },
    { label: "BS en efectivo", moneda: "BS" },
    { label: "$ en efectivo", moneda: "USD" },
    { label: "Transferencia", moneda: "BS" },
  ];

  const cargarInventario = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("inventory")
      .select("*")
      .order("nombre", { ascending: true });

    if (fetchError) {
      setError("No se pudo cargar el inventario.");
    } else {
      setInventario(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("tasa_bs");
    if (stored) {
      setTasaBs(Number(stored));
    }
  }, []);

  useEffect(() => {
    if (tasaBs === "" || Number.isNaN(Number(tasaBs))) return;
    localStorage.setItem("tasa_bs", String(tasaBs));
  }, [tasaBs]);

  const agregarProducto = (producto) => {
    if (producto.stock <= 0) return;
    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === producto.id);
      if (existente) {
        if (existente.cantidad + 1 > producto.stock) return prev;
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [
        ...prev,
        { ...producto, cantidad: 1, precio_unitario: producto.precio_venta },
      ];
    });
  };

  const actualizarCantidad = (id, cantidad) => {
    const item = carrito.find((entry) => entry.id === id);
    const max = item?.stock || 1;
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.max(1, Math.min(max, Number(cantidad))) }
          : item
      )
    );
  };

  const eliminarItem = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const totalUsd = carrito.reduce(
    (acc, item) => acc + item.precio_unitario * item.cantidad,
    0
  );
  const totalBs = totalUsd * Number(tasaBs || 0);
  const monedaMetodo1 = metodosPago.find((m) => m.label === metodo1)?.moneda;
  const monto2 = Math.max(0, totalUsd - Number(monto1 || 0));

  const getMetodoAlterno = (actual) =>
    metodosPago.find((m) => m.label !== actual) || metodosPago[0];

  useEffect(() => {
    if (totalUsd <= 0) {
      setMonto1(0);
      return;
    }
    if (monto1 > totalUsd) {
      setMonto1(totalUsd);
    }
  }, [totalUsd]);

  const guardarVenta = async () => {
    if (carrito.length === 0) return;
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

    const pagos = [
      {
        metodo: metodo1,
        monto_usd: monto1,
        moneda: monedaMetodo1,
      },
      {
        metodo: metodo2,
        monto_usd: monto2,
        moneda: metodosPago.find((m) => m.label === metodo2)?.moneda,
      },
    ];

    const { data: venta, error: ventaError } = await supabase
      .from("sales")
      .insert({
        user_id: user.id,
        total_usd: totalUsd,
        total_bs: totalBs,
        moneda_usada: moneda,
        tasa_bs: Number(tasaBs || 0),
        fecha: new Date().toISOString(),
      })
      .select()
      .single();

    if (ventaError) {
      setError("No se pudo guardar la venta.");
      setSaving(false);
      return;
    }

    await supabase.from("invoices").insert({
      sale_id: venta.id,
      user_id: user.id,
    });

    const itemsPayload = carrito.map((item) => ({
      sale_id: venta.id,
      inventory_id: item.id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
    }));

    const { error: itemsError } = await supabase
      .from("sale_items")
      .insert(itemsPayload);

    if (itemsError) {
      setError("No se pudieron guardar los productos de la venta.");
      setSaving(false);
      return;
    }

    for (const item of carrito) {
      const nuevoStock = Math.max(0, item.stock - item.cantidad);
      await supabase
        .from("inventory")
        .update({ stock: nuevoStock })
        .eq("id", item.id);
    }

    setCarrito([]);
    await cargarInventario();
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ventas</h1>
          <p className="text-sm text-slate-500">
            Registra ventas y controla el stock automáticamente.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">
            Precio del dólar en Bs
          </label>
          <input
            type="number"
            className="w-32 rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={tasaBs}
            onChange={(event) => setTasaBs(event.target.value)}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900">Productos</h2>
          <div className="mt-4">
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Buscar producto por nombre..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Cargando inventario...</p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {inventario
                .filter((producto) =>
                  producto.nombre
                    ?.toLowerCase()
                    .includes(search.trim().toLowerCase())
                )
                .map((producto) => (
                <button
                  key={producto.id}
                  type="button"
                  className="rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                  onClick={() => agregarProducto(producto)}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {producto.nombre}
                  </p>
                  <p className="text-xs text-slate-500">
                    Stock: {producto.stock}
                  </p>
                  <p className="text-sm text-slate-700">
                    {formatUsd(producto.precio_venta)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900">Carrito</h2>
          <div className="mt-4 space-y-3">
            {carrito.length === 0 ? (
              <p className="text-sm text-slate-500">
                Agrega productos desde la lista.
              </p>
            ) : (
              carrito.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.nombre}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatUsd(item.precio_unitario)}
                    </p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                    value={item.cantidad}
                    onChange={(event) =>
                      actualizarCantidad(item.id, event.target.value)
                    }
                  />
                  <button
                    className="text-xs text-red-500"
                    onClick={() => eliminarItem(item.id)}
                  >
                    Quitar
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total USD</span>
              <span className="font-semibold">{formatUsd(totalUsd)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Bs</span>
              <span className="font-semibold">{formatBs(totalBs)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Pago dividido</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Método de pago 1
                </label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={metodo1}
                  onChange={(event) => {
                    const value = event.target.value;
                    setMetodo1(value);
                    if (value === metodo2) {
                      setMetodo2(getMetodoAlterno(value).label);
                    }
                  }}
                >
                  {metodosPago.map((m) => (
                    <option key={m.label} value={m.label}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Monto método 1 (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={monto1}
                  onChange={(event) => {
                    const value = Number(event.target.value || 0);
                    const clamped = Math.min(Math.max(value, 0), totalUsd);
                    setMonto1(clamped);
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Método de pago 2
                </label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={metodo2}
                  onChange={(event) => {
                    const value = event.target.value;
                    setMetodo2(value);
                    if (value === metodo1) {
                      setMetodo1(getMetodoAlterno(value).label);
                    }
                  }}
                >
                  {metodosPago.map((m) => (
                    <option key={m.label} value={m.label}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Monto método 2 (USD)
                </label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-slate-100"
                  value={monto2.toFixed(2)}
                  readOnly
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Total: {formatUsd(totalUsd)} (método 1 + método 2)
            </p>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700">Moneda usada</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={moneda}
              onChange={(event) => setMoneda(event.target.value)}
            >
              <option value="USD">USD</option>
              <option value="BS">BS</option>
            </select>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            className="btn-primary mt-6 w-full"
            onClick={guardarVenta}
            disabled={saving || carrito.length === 0}
          >
            {saving ? "Procesando..." : "Registrar venta"}
          </button>
        </section>
      </div>
    </div>
  );
}
