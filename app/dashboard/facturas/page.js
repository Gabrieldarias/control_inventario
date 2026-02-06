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
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(perfil?.nombre_local || "Factura", 14, 20);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString("es-VE")}`, 14, 28);
    doc.text(`Moneda usada: ${venta.moneda_usada}`, 14, 34);
    doc.text(`Tasa Bs: ${venta.tasa_bs}`, 14, 40);

    let y = 50;
    venta.sale_items?.forEach((item) => {
      doc.text(
        `${item.inventory?.nombre || "Producto"} x${item.cantidad} - ${formatUsd(
          item.precio_unitario
        )}`,
        14,
        y
      );
      y += 6;
    });

    doc.setFontSize(12);
    doc.text(`Total USD: ${formatUsd(venta.total_usd)}`, 14, y + 10);
    doc.text(`Total Bs: ${formatBs(venta.total_bs)}`, 14, y + 16);

    if (preview) {
      const blobUrl = doc.output("bloburl");
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } else {
      doc.save(`factura-${venta.id}.pdf`);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Facturas</h1>
        <p className="text-sm text-slate-500">
          Genera facturas PDF de tus ventas registradas.
        </p>
      </header>

      <section className="card p-6">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando facturas...</p>
        ) : (
          <div className="space-y-4">
            {ventas.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay facturas generadas todavía.
              </p>
            ) : (
              ventas.map((venta) => (
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
