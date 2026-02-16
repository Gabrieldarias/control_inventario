"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "../../../lib/supabaseClient";
import { formatBs, formatUsd } from "../../../utils/currency";
import { jsPDF } from "jspdf";

const supabase = createSupabaseBrowserClient();

export default function VentasPage() {
  const [inventario, setInventario] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [tasaBs, setTasaBs] = useState(450);
  const [moneda, setMoneda] = useState("USD");
  const [paymentDetails, setPaymentDetails] = useState({
    metodo1: "Pago Movil",
    metodo2: "BS en efectivo",
    pagoDividido: false,
    monto1: 0,
  });
  const [montoRecibido, setMontoRecibido] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showVentaModal, setShowVentaModal] = useState(false);
  const [ventaPdfData, setVentaPdfData] = useState(null);
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
  const tasa = Number(tasaBs || 0);
  const monto1Input = Number(paymentDetails.monto1 || 0);
  const monto1Usd =
    monedaMetodo1 === "BS" && tasa > 0 ? monto1Input / tasa : monto1Input;
  const monto2Usd = paymentDetails.pagoDividido
    ? Math.max(0, totalUsd - monto1Usd)
    : 0;
  const monto2Display =
    monedaMetodo2 === "BS" ? monto2Usd * tasa : monto2Usd;
  const totalPagadoUsd = paymentDetails.pagoDividido
    ? monto1Usd + monto2Usd
    : monto1Usd;
  const cambioUsd = Math.max(0, totalPagadoUsd - totalUsd);
  const cambioDisplay = monedaMetodo1 === "BS" ? cambioUsd * tasa : cambioUsd;

  useEffect(() => {
    const numeric = Number(montoRecibido || 0);
    setPaymentDetails((prev) => ({ ...prev, monto1: numeric }));
  }, [montoRecibido]);

  useEffect(() => {
    if (monto1Input < 0 || Number.isNaN(monto1Input)) {
      setPaymentDetails((prev) => ({ ...prev, monto1: 0 }));
      setMontoRecibido("0");
    }
  }, [monto1Input]);

  useEffect(() => {
    if (paymentDetails.pagoDividido && paymentDetails.metodo1 === paymentDetails.metodo2) {
      setPaymentDetails((prev) => ({
        ...prev,
        metodo2: getMetodoAlterno(prev.metodo1).label,
      }));
    }
  }, [paymentDetails.pagoDividido, paymentDetails.metodo1, paymentDetails.metodo2]);

  const generarPdfVenta = ({
    ventaId,
    fecha,
    totalUsd,
    totalBs,
    tasaBs,
    monedaUsada,
    items,
    pagos,
    nombreLocal,
    vendedor,
  }) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 14;
    const pageWidth = 210;
    const contentWidth = pageWidth - margin * 2;
    const fechaTexto = new Date(fecha).toLocaleString("es-VE");
    const cliente = "Consumidor final";
    const totalPagadoUsd = pagos.reduce(
      (acc, pago) => acc + Number(pago.monto_usd || 0),
      0
    );
    const cambioUsd = Math.max(0, totalPagadoUsd - Number(totalUsd || 0));

    const addDivider = (y) => {
      doc.setDrawColor(220);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
    };

    let y = 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(nombreLocal || "Factura", margin, y);
    doc.setFontSize(12);
    doc.text("Factura de venta", margin, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Fecha: ${fechaTexto}`, pageWidth - margin, y, { align: "right" });
    doc.text(`Venta #${ventaId.slice(0, 6)}`, pageWidth - margin, y + 6, {
      align: "right",
    });

    y += 16;
    addDivider(y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Detalles", margin, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(`Cliente: ${cliente}`, margin, y);
    doc.text(`Vendedor: ${vendedor || "Vendedor"}`, margin + contentWidth / 2, y);
    y += 5;
    doc.text(`Moneda: ${monedaUsada}`, margin, y);
    doc.text(`Tasa Bs: ${tasaBs}`, margin + contentWidth / 2, y);

    y += 8;
    addDivider(y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Productos", margin, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Producto", margin, y);
    doc.text("Cant.", margin + 90, y);
    doc.text("P. Unit", margin + 115, y);
    doc.text("Subtotal", margin + 150, y);
    doc.setFont("helvetica", "normal");
    y += 4;
    addDivider(y);
    y += 6;

    items.forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 18;
      }
      const subtotal = Number(item.precio_unitario || 0) * Number(item.cantidad || 0);
      doc.text(String(item.nombre || "Producto"), margin, y);
      doc.text(String(item.cantidad || 0), margin + 90, y);
      doc.text(formatUsd(item.precio_unitario), margin + 115, y);
      doc.text(formatUsd(subtotal), margin + 150, y);
      y += 6;
    });

    y += 4;
    addDivider(y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Total USD: ${formatUsd(totalUsd)}`, margin, y);
    doc.text(`Total Bs: ${formatBs(totalBs)}`, margin + 80, y);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Métodos de pago", margin, y);
    doc.setFont("helvetica", "normal");
    y += 6;

    pagos.forEach((pago) => {
      doc.text(`${pago.metodo}: ${formatUsd(pago.monto_usd)}`, margin, y);
      y += 6;
    });

    if (cambioUsd > 0) {
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.text("Cambio a entregar", margin, y);
      doc.setFont("helvetica", "normal");
      y += 6;
      doc.text(`USD: ${formatUsd(cambioUsd)}`, margin, y);
      doc.text(`BS: ${formatBs(cambioUsd * Number(tasaBs || 0))}`, margin + 60, y);
    }

    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank", "noopener,noreferrer");
  };

  const guardarVenta = async () => {
    if (carrito.length === 0) return;
    setSaving(true);
    setError("");

    const tasa = Number(tasaBs || 0);
    const monto1Number = Number(paymentDetails.monto1 || 0);
    const monto1UsdBase =
      monedaMetodo1 === "BS" && tasa > 0 ? monto1Number / tasa : monto1Number;
    const monto1UsdCalc = monto1UsdBase > 0 ? monto1UsdBase : totalUsd;
    const monto2Number = paymentDetails.pagoDividido
      ? Math.max(0, totalUsd - monto1UsdCalc)
      : 0;

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
      if (monto1UsdCalc <= 0) {
        setError("El monto del método 1 debe ser mayor a 0.");
        setSaving(false);
        return;
      }
      if (monto1UsdCalc < totalUsd && monto2Number <= 0) {
        setError("El monto del método 2 debe ser mayor a 0.");
        setSaving(false);
        return;
      }
      if (monto2Number > totalUsd) {
        setError("El monto del segundo método no puede superar el total.");
        setSaving(false);
        return;
      }
      if (monto1UsdCalc + monto2Number < totalUsd) {
        setError("El monto total no cubre la venta.");
        setSaving(false);
        return;
      }
    } else if (monto1UsdCalc < totalUsd) {
      setError("El monto total no cubre la venta.");
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("No se pudo validar el usuario.");
      setSaving(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("nombre_local, nombre_persona")
      .eq("id", user.id)
      .single();

    const { data: venta, error: insertError } = await supabase
      .from("sales")
      .insert({
        user_id: user.id,
        total_usd: totalUsd,
        total_bs: totalBs,
        moneda_usada: moneda,
        tasa_bs: tasa,
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

    const { error: invoiceError } = await supabase.from("invoices").insert({
      sale_id: venta.id,
      user_id: user.id,
    });

    if (invoiceError) {
      setError(`No se pudo generar la factura: ${invoiceError.message}`);
      setSaving(false);
      return;
    }

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

    const stockUpdates = await Promise.all(
      carrito.map((item) =>
        supabase
          .from("inventory")
          .update({ stock: item.stock - item.cantidad })
          .eq("id", item.id)
      )
    );

    const stockError = stockUpdates.find((result) => result.error)?.error;
    if (stockError) {
      setError(`No se pudo actualizar el stock: ${stockError.message}`);
      setSaving(false);
      return;
    }

    const pagos = paymentDetails.pagoDividido
      ? [
          { metodo: paymentDetails.metodo1, monto_usd: monto1UsdCalc },
          { metodo: paymentDetails.metodo2, monto_usd: monto2Number },
        ]
      : [{ metodo: paymentDetails.metodo1, monto_usd: monto1UsdCalc }];

    setVentaPdfData({
      ventaId: venta.id,
      fecha: venta.fecha,
      totalUsd,
      totalBs,
      tasaBs: tasa,
      monedaUsada: moneda,
      items: carrito,
      pagos,
      nombreLocal: profile?.nombre_local,
      vendedor: profile?.nombre_persona,
    });
    setShowVentaModal(true);

    setCarrito([]);
    setPaymentDetails({
      metodo1: "Pago Movil",
      metodo2: "BS en efectivo",
      pagoDividido: false,
      monto1: 0,
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
                  Monto en {monedaMetodo1 === "BS" ? "Bs" : "$"}
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={montoRecibido}
                  onChange={(event) => setMontoRecibido(event.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">
                  {monedaMetodo1 === "BS"
                    ? `≈ ${formatUsd(monto1Usd)}`
                    : `≈ ${formatBs(monto1Usd * Number(tasaBs || 0))}`}
                </p>
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
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-slate-100"
                    value={monto2Display.toFixed(2)}
                    readOnly
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {monedaMetodo2 === "BS"
                      ? "Equivalente en Bs"
                      : "Equivalente en USD"}
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500">
              Total: {formatUsd(totalUsd)}
            </p>
            {cambioUsd > 0 && (
              <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <p className="font-semibold">Cambio a entregar:</p>
                <p>
                  {monedaMetodo1 === "BS" ? "BS" : "USD"}: {cambioDisplay.toFixed(2)}
                </p>
                <p className="text-xs text-emerald-700">
                  {monedaMetodo1 === "BS"
                    ? `≈ ${formatUsd(cambioUsd)}`
                    : `≈ ${formatBs(cambioUsd * Number(tasaBs || 0))}`}
                </p>
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

      {showVentaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="card w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900">Venta registrada</h3>
            <p className="mt-2 text-sm text-slate-600">
              ¿Qué deseas hacer?
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                className="btn-primary"
                type="button"
                onClick={() => {
                  if (ventaPdfData) generarPdfVenta(ventaPdfData);
                }}
              >
                Imprimir PDF
              </button>
              <button
                className="btn-outline"
                type="button"
                onClick={() => {
                  setShowVentaModal(false);
                  setVentaPdfData(null);
                }}
              >
                Nueva venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
