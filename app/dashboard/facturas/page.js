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
        "id, total_usd, total_bs, moneda_usada, tasa_bs, fecha, cliente_nombre, cliente_documento, cliente_telefono, observaciones, sale_items(id, cantidad, precio_unitario, inventory:inventory_id(nombre))"
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
    const cliente = venta.cliente_nombre || "Consumidor final";
    const pagos = venta.payments || [];
    const totalPagadoUsd = pagos.reduce(
      (acc, pago) => acc + Number(pago.monto_usd || 0),
      0
    );
    const cambioUsd = Math.max(0, totalPagadoUsd - Number(venta.total_usd || 0));

    // Colores del tema azul/gris profesional
    const colorPrimario = [41, 98, 255]; // Azul
    const colorHeader = [30, 58, 138]; // Azul oscuro
    const colorFondoAlt = [248, 250, 252]; // Gris claro
    const colorFondoTotal = [219, 234, 254]; // Azul claro

    const addDivider = (y, color = [220, 220, 220]) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
    };

    // Encabezado con fondo azul
    let y = 10;
    doc.setFillColor(...colorHeader);
    doc.rect(0, 0, pageWidth, 35, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(nombreLocal, margin, y + 8);
    doc.setFontSize(11);
    doc.text("Factura de venta", margin, y + 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Fecha: ${fechaTexto}`, pageWidth - margin, y + 8, { align: "right" });
    doc.text(`Venta #${venta.id.slice(0, 6)}`, pageWidth - margin, y + 14, {
      align: "right",
    });

    // Volver a color negro para el contenido
    doc.setTextColor(0, 0, 0);
    y = 42;

    // Sección Detalles con título en azul
    doc.setTextColor(...colorPrimario);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Detalles del Cliente", margin, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    y += 6;
    doc.text(`Cliente: ${cliente}`, margin, y);
    doc.text(`Vendedor: ${vendedor}`, margin + contentWidth / 2, y);
    y += 5;
    if (venta.cliente_documento) {
      doc.text(`RIF/CI: ${venta.cliente_documento}`, margin, y);
      y += 5;
    }
    if (venta.cliente_telefono) {
      doc.text(`Teléfono: ${venta.cliente_telefono}`, margin, y);
      y += 5;
    }
    doc.text(`Moneda: ${venta.moneda_usada}`, margin, y);
    doc.text(`Tasa Bs: ${venta.tasa_bs}`, margin + contentWidth / 2, y);
    if (venta.observaciones) {
      y += 5;
      doc.text(`Obs: ${venta.observaciones}`, margin, y);
    }

    y += 8;
    addDivider(y, [200, 200, 200]);
    y += 8;

    // Tabla de productos con encabezado azul
    doc.setTextColor(...colorPrimario);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Productos", margin, y);
    y += 6;

    // Encabezado de tabla con fondo azul claro
    doc.setFillColor(...colorFondoTotal);
    doc.rect(margin, y - 4, contentWidth, 7, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Producto", margin + 2, y);
    doc.text("Cant.", margin + 92, y);
    doc.text("P. Unit", margin + 117, y);
    doc.text("Subtotal", margin + 152, y);
    doc.setFont("helvetica", "normal");
    y += 6;

    // Productos con filas alternadas
    let isAlt = false;
    venta.sale_items?.forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        isAlt = false;
      }
      
      if (isAlt) {
        doc.setFillColor(...colorFondoAlt);
        doc.rect(margin, y - 4, contentWidth, 6, "F");
      }
      
      const nombre = item.inventory?.nombre || "Producto";
      const subtotal = Number(item.precio_unitario || 0) * Number(item.cantidad || 0);
      doc.setTextColor(0, 0, 0);
      doc.text(nombre, margin + 2, y);
      doc.text(String(item.cantidad), margin + 92, y);
      doc.text(formatUsd(item.precio_unitario), margin + 117, y);
      doc.text(formatUsd(subtotal), margin + 152, y);
      y += 6;
      isAlt = !isAlt;
    });

    y += 4;
    addDivider(y, colorPrimario);
    y += 8;

    // Totales con fondo azul claro
    doc.setFillColor(...colorFondoTotal);
    doc.rect(margin, y - 5, contentWidth, 10, "F");
    doc.setTextColor(...colorHeader);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Total USD: ${formatUsd(venta.total_usd)}`, margin + 2, y);
    doc.text(`Total Bs: ${formatBs(venta.total_bs)}`, margin + 82, y);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    y += 12;
    doc.setTextColor(...colorPrimario);
    doc.setFont("helvetica", "bold");
    doc.text("Métodos de pago", margin, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 6;

    if (pagos.length === 0) {
      doc.text("No registrado", margin, y);
      y += 5;
    } else {
      pagos.forEach((pago) => {
        doc.text(
          `${pago.metodo}: ${formatUsd(pago.monto_usd)}`,
          margin,
          y
        );
        y += 5;
      });
    }

    if (cambioUsd > 0) {
      y += 4;
      doc.setFillColor(220, 252, 231); // Verde claro
      doc.rect(margin, y - 4, contentWidth, 12, "F");
      doc.setTextColor(21, 128, 61); // Verde oscuro
      doc.setFont("helvetica", "bold");
      doc.text("Cambio a entregar", margin + 2, y);
      doc.setFont("helvetica", "normal");
      y += 6;
      doc.text(`USD: ${formatUsd(cambioUsd)}`, margin + 2, y);
      doc.text(`BS: ${formatBs(cambioUsd * Number(venta.tasa_bs || 0))}`, margin + 62, y);
      doc.setTextColor(0, 0, 0);
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
