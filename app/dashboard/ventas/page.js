"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "../../../lib/supabaseClient";
import { formatBs, formatUsd } from "../../../utils/currency";

const supabase = createSupabaseBrowserClient();

export default function VentasPage() {
  const [inventario, setInventario] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [tasaBs, setTasaBs] = useState(500);
  const [moneda, setMoneda] = useState("USD");
  const [paymentDetails, setPaymentDetails] = useState({
    metodo1: "Pago Movil",
    metodo2: "BS en efectivo",
    pagoDividido: false,
    monto2: 0,
  });
  const [montoRecibido, setMontoRecibido] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const tasaInitRef = useRef(false);

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
    if (!tasaInitRef.current) {
      tasaInitRef.current = true;
      const stored = localStorage.getItem("tasa_bs");
      if (stored) {
        setTasaBs(Number(stored));
        return;
      }
    }

    if (tasaBs === "" || Number.isNaN(Number(tasaBs))) return;
    localStorage.setItem("tasa_bs", String(tasaBs));
  }, [tasaBs]);

  const agregarProducto = (producto) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === producto.id);
      if (existente) {
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
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.max(1, Number(cantidad)) }
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
  const getMetodoAlterno = (actual) =>
    metodosPago.find((m) => m.label !== actual) || metodosPago[0];
  const monedaMetodo1 =
    metodosPago.find((m) => m.label === paymentDetails.metodo1)?.moneda ||
    "USD";
  const monedaMetodo2 =
    metodosPago.find((m) => m.label === paymentDetails.metodo2)?.moneda ||
    "USD";
  const monto1Usd = paymentDetails.pagoDividido
    ? Math.max(0, totalUsd - Number(paymentDetails.monto2 || 0))
    : totalUsd;
  const montoRecibidoUsd = (() => {
    const value = Number(montoRecibido || 0);
    if (!value || Number.isNaN(value)) return 0;
    if (monedaMetodo1 === "BS") {
      const rate = Number(tasaBs || 0);
      return rate > 0 ? value / rate : 0;
    }
    return value;
  })();
  const totalPagadoUsd = paymentDetails.pagoDividido
    ? montoRecibidoUsd
    : montoRecibidoUsd > 0
      ? montoRecibidoUsd
      : totalUsd;
  const cambioUsd = Math.max(0, totalPagadoUsd - totalUsd);

  useEffect(() => {
    if (!paymentDetails.pagoDividido) {
      setPaymentDetails((prev) => ({
        ...prev,
        monto2: 0,
      }));
      return;
    }

    const clamped = Math.min(
      Math.max(Number(paymentDetails.monto2 || 0), 0),
      totalUsd
    );
    if (clamped !== paymentDetails.monto2) {
      setPaymentDetails((prev) => ({ ...prev, monto2: clamped }));
      return;
    }
    // monto1 es derivado
  }, [paymentDetails.pagoDividido, paymentDetails.monto2, totalUsd]);

  useEffect(() => {
    if (paymentDetails.pagoDividido && paymentDetails.metodo1 === paymentDetails.metodo2) {
      setPaymentDetails((prev) => ({
        ...prev,
        metodo2: getMetodoAlterno(prev.metodo1).label,
      }));
    }
  }, [paymentDetails.pagoDividido, paymentDetails.metodo1, paymentDetails.metodo2]);

  const guardarVenta = async () => {
    if (carrito.length === 0) return;
    setSaving(true);
    setError("");

    if (totalUsd <= 0) {
      setError("El total debe ser mayor a 0.");
      setSaving(false);
      return;
    }

    if (paymentDetails.pagoDividido) {
      if (paymentDetails.metodo1 === paymentDetails.metodo2) {
        setError("Los métodos de pago deben ser distintos.");
        setSaving(false);
        return;
      }
      if (paymentDetails.monto2 <= 0 || monto1Usd <= 0) {
        setError("Los montos deben ser mayores a 0.");
        setSaving(false);
        return;
      }
      if (paymentDetails.monto2 > totalUsd) {
        setError("El monto del segundo método no puede superar el total.");
        setSaving(false);
        return;
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("No se pudo validar el usuario.");
      setSaving(false);
      return;
    }

    const { data: venta, error: insertError } = await supabase
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

    if (insertError || !venta) {
      setError(
        `No se pudo guardar la venta: ${insertError?.message || "error"}`
      );
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
      setError(
        `No se pudieron guardar los productos de la venta: ${itemsError.message}`
      );
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
    setPaymentDetails({
      metodo1: "Pago Movil",
      metodo2: "BS en efectivo",
      pagoDividido: false,
      monto2: 0,
    });
    setMontoRecibido("");
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
            <h3 className="text-sm font-semibold text-slate-700">Pago</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Método de pago 1
                </label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={paymentDetails.metodo1}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPaymentDetails((prev) => ({
                      ...prev,
                      metodo1: value,
                      metodo2:
                        prev.pagoDividido && value === prev.metodo2
                          ? getMetodoAlterno(value).label
                          : prev.metodo2,
                    }));
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
                  Monto método 1 ({monedaMetodo1})
                </label>
                {paymentDetails.pagoDividido ? (
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-slate-100"
                    value={
                      monedaMetodo1 === "BS"
                        ? (monto1Usd * Number(tasaBs || 0)).toFixed(2)
                        : monto1Usd.toFixed(2)
                    }
                    readOnly
                  />
                ) : (
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    value={
                      monedaMetodo1 === "BS"
                        ? (totalUsd * Number(tasaBs || 0)).toFixed(2)
                        : totalUsd
                    }
                    readOnly
                  />
                )}
                {monedaMetodo1 === "BS" ? (
                  <p className="mt-1 text-xs text-slate-500">
                    ≈ {formatUsd(monto1Usd)}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">
                    ≈ {formatBs(monto1Usd * Number(tasaBs || 0))}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  id="pago-dividido"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={paymentDetails.pagoDividido}
                  onChange={(event) =>
                    setPaymentDetails((prev) => ({
                      ...prev,
                      pagoDividido: event.target.checked,
                    }))
                  }
                />
                <label htmlFor="pago-dividido" className="text-sm text-slate-700">
                  Pagar con dos métodos
                </label>
              </div>
            </div>

            {paymentDetails.pagoDividido && (
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Método de pago 2
                  </label>
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    value={paymentDetails.metodo2}
                    onChange={(event) => {
                      const value = event.target.value;
                      setPaymentDetails((prev) => ({
                        ...prev,
                        metodo2: value,
                        metodo1:
                          value === prev.metodo1
                            ? getMetodoAlterno(value).label
                            : prev.metodo1,
                      }));
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
                    Monto método 2 ({monedaMetodo2})
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    value={
                      monedaMetodo2 === "BS"
                        ? (Number(paymentDetails.monto2 || 0) * Number(tasaBs || 0)).toFixed(2)
                        : paymentDetails.monto2
                    }
                    onChange={(event) => {
                      const value = Number(event.target.value || 0);
                      const rate = Number(tasaBs || 0);
                      const usdValue =
                        monedaMetodo2 === "BS" && rate > 0
                          ? value / rate
                          : value;
                      const clamped = Math.min(Math.max(usdValue, 0), totalUsd);
                      setPaymentDetails((prev) => ({
                        ...prev,
                        monto2: clamped,
                      }));
                    }}
                  />
                  {monedaMetodo2 === "BS" ? (
                    <p className="mt-1 text-xs text-slate-500">
                      ≈ {formatUsd(Number(paymentDetails.monto2 || 0))}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">
                      ≈ {formatBs(Number(paymentDetails.monto2 || 0) * Number(tasaBs || 0))}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700">
                Monto recibido ({monedaMetodo1})
              </label>
              <input
                type="number"
                min="0"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                value={montoRecibido}
                onChange={(event) => setMontoRecibido(event.target.value)}
                placeholder={`Ej: ${monedaMetodo1 === "BS" ? "500" : "20"}`}
              />
              {montoRecibido && (
                <p className="mt-1 text-xs text-slate-500">
                  {monedaMetodo1 === "BS"
                    ? `≈ ${formatUsd(montoRecibidoUsd)}`
                    : `≈ ${formatBs(montoRecibidoUsd * Number(tasaBs || 0))}`}
                </p>
              )}
            </div>

            <p className="text-xs text-slate-500">
              Total: {formatUsd(totalUsd)}
            </p>
            {cambioUsd > 0 && (
              <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <p className="font-semibold">Cambio a entregar:</p>
                <p>USD: {formatUsd(cambioUsd)}</p>
                <p>BS: {formatBs(cambioUsd * Number(tasaBs || 0))}</p>
              </div>
            )}
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
