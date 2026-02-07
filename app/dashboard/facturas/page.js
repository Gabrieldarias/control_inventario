"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "../../../lib/supabaseClient";
import { formatBs, formatUsd } from "../../../utils/currency";
import { jsPDF } from "jspdf";

export default function FacturasPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [ventas, setVentas] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const cargarFacturas = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("nombre_local")
      .eq("id", user.id)
      .single();

    const { data } = await supabase
      .from("sales")
      .select(
        "id, total_usd, total_bs, moneda_usada, tasa_bs, fecha, sale_items(id, cantidad, precio_unitario, inventory:inventory_id(nombre))"
      )
      .order("fecha", { ascending: false });

    setPerfil(profile || null);
    setVentas(data || []);
    setLoading(false);
  };

  useEffect(() => {
    cargarFacturas();
  }, []);

  const generarFactura = (venta, preview = true) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 14;
    const pageWidth = 210;
    const contentWidth = pageWidth - margin * 2;
    const fechaTexto = new Date(venta.fecha).toLocaleString("es-VE");
    const nombreLocal = perfil?.nombre_local || "Factura";
    const vendedor = perfil?.nombre_persona || "Vendedor";
    const cliente = "Consumidor final";
    const pagos = venta.payments || [];
    const totalPagadoUsd = pagos.reduce(
      (acc, pago) => acc + Number(pago.monto_usd || 0),
      0
    );
    const cambioUsd = Math.max(0, totalPagadoUsd - Number(venta.total_usd || 0));

    const addDivider = (y) => {
      doc.setDrawColor(220);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
    };

    let y = 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(nombreLocal, margin, y);
    doc.setFontSize(12);
    doc.text("Factura de venta", margin, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Fecha: ${fechaTexto}`, pageWidth - margin, y, { align: "right" });
    doc.text(`Venta #${venta.id.slice(0, 6)}`, pageWidth - margin, y + 6, {
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
    doc.text(`Vendedor: ${vendedor}`, margin + contentWidth / 2, y);
    y += 5;
    doc.text(`Moneda: ${venta.moneda_usada}`, margin, y);
    doc.text(`Tasa Bs: ${venta.tasa_bs}`, margin + contentWidth / 2, y);

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

    venta.sale_items?.forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 18;
      }
      const nombre = item.inventory?.nombre || "Producto";
      const subtotal = Number(item.precio_unitario || 0) * Number(item.cantidad || 0);
      doc.text(nombre, margin, y);
      doc.text(String(item.cantidad), margin + 90, y);
      doc.text(formatUsd(item.precio_unitario), margin + 115, y);
      doc.text(formatUsd(subtotal), margin + 150, y);
      y += 6;
    });

    y += 4;
    addDivider(y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Total USD: ${formatUsd(venta.total_usd)}`, margin, y);
    doc.text(`Total Bs: ${formatBs(venta.total_bs)}`, margin + 80, y);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Métodos de pago", margin, y);
    doc.setFont("helvetica", "normal");
    y += 6;

    if (pagos.length === 0) {
      doc.text("No registrado", margin, y);
      y += 6;
    } else {
      pagos.forEach((pago) => {
        doc.text(
          `${pago.metodo}: ${formatUsd(pago.monto_usd)}`,
          margin,
          y
        );
        y += 6;
      });
    }

    if (cambioUsd > 0) {
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.text("Cambio a entregar", margin, y);
      doc.setFont("helvetica", "normal");
      y += 6;
      doc.text(`USD: ${formatUsd(cambioUsd)}`, margin, y);
      doc.text(`BS: ${formatBs(cambioUsd * Number(venta.tasa_bs || 0))}`, margin + 60, y);
    }

    if (preview) {
      const blobUrl = doc.output("bloburl");
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } else {
      doc.save(`factura-${venta.id}.pdf`);
    }
  };

  const ventasFiltradas = ventas.filter((venta) => {
    if (!fechaDesde && !fechaHasta) return true;
    const fechaVenta = new Date(venta.fecha);
    if (fechaDesde) {
      const inicio = new Date(fechaDesde);
      inicio.setHours(0, 0, 0, 0);
      if (fechaVenta < inicio) return false;
    }
    if (fechaHasta) {
      const fin = new Date(fechaHasta);
      fin.setHours(23, 59, 59, 999);
      if (fechaVenta > fin) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Facturas</h1>
        <p className="text-sm text-slate-500">
          Genera facturas PDF de tus ventas registradas.
        </p>
      </header>

      <section className="card p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Desde</label>
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={fechaDesde}
              onChange={(event) => setFechaDesde(event.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Hasta</label>
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={fechaHasta}
              onChange={(event) => setFechaHasta(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="card p-6">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando facturas...</p>
        ) : (
          <div className="space-y-4">
            {ventasFiltradas.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay facturas generadas todavía.
              </p>
            ) : (
              ventasFiltradas.map((venta) => (
                <div
                  key={venta.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Venta #{venta.id.slice(0, 6)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(venta.fecha).toLocaleString("es-VE")}
                    </p>
                    <p className="text-sm text-slate-700">
                      Total: {formatUsd(venta.total_usd)} | {formatBs(venta.total_bs)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn-outline"
                      onClick={() => generarFactura(venta, true)}
                    >
                      Vista previa
                    </button>
                    <button
                      className="btn-outline"
                      onClick={() => generarFactura(venta, false)}
                    >
                      Descargar PDF
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
