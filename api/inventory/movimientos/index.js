import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    const { id, producto_id, tipo, fecha_inicio, fecha_fin } = req.query;

    if (req.method === 'GET') {
      if (id) {
        // GET movimiento específico
        const { data: movimiento, error } = await supabase
          .from('movimientos')
          .select(`
            id,
            producto_id,
            tipo,
            cantidad,
            lote_id,
            motivo,
            usuario_email,
            referencia_id,
            created_at,
            products (
              id,
              nombre,
              codigo_interno,
              stock_total
            ),
            lotes (
              id,
              numero_lote,
              fecha_vencimiento
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        if (!movimiento) {
          return res.status(404).json({ error: 'Movimiento no encontrado' });
        }

        return res.status(200).json(movimiento);
      } else {
        // GET lista de movimientos con filtros opcionales
        let query = supabase
          .from('movimientos')
          .select(`
            id,
            producto_id,
            tipo,
            cantidad,
            lote_id,
            motivo,
            usuario_email,
            referencia_id,
            created_at,
            products (
              id,
              nombre,
              codigo_interno
            ),
            lotes (
              id,
              numero_lote
            )
          `);

        // Aplicar filtros si se proporcionan
        if (producto_id) {
          query = query.eq('producto_id', producto_id);
        }

        if (tipo) {
          query = query.eq('tipo', tipo);
        }

        if (fecha_inicio) {
          query = query.gte('created_at', fecha_inicio);
        }

        if (fecha_fin) {
          query = query.lte('created_at', fecha_fin);
        }

        const { data: movimientos, error } = await query.order('created_at', { ascending: false });

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json(movimientos || []);
      }
    }

    if (req.method === 'POST') {
      // Insertar movimiento manual
      const { producto_id, tipo, cantidad, lote_id, motivo, usuario_email } = req.body;

      if (!producto_id || !tipo || !cantidad) {
        return res.status(400).json({ 
          error: 'producto_id, tipo y cantidad son requeridos' 
        });
      }

      // Validar que el producto exista
      const { data: producto, error: prodError } = await supabase
        .from('products')
        .select('id, stock_total')
        .eq('id', producto_id)
        .single();

      if (prodError || !producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      // Crear movimiento
      const { data: movimiento, error: movError } = await supabase
        .from('movimientos')
        .insert({
          producto_id,
          tipo,
          cantidad: parseInt(cantidad),
          lote_id: lote_id || null,
          motivo: motivo || '',
          usuario_email: usuario_email || 'sistema',
          referencia_id: null
        })
        .select()
        .single();

      if (movError) {
        return res.status(400).json({ error: movError.message });
      }

      // Actualizar stock si el tipo implica cambio de stock
      if (['entrada', 'compra', 'lote'].includes(tipo)) {
        const nuevoStock = producto.stock_total + parseInt(cantidad);
        await supabase
          .from('products')
          .update({ stock_total: nuevoStock })
          .eq('id', producto_id);
      } else if (['salida', 'venta', 'devolucion_cancelada'].includes(tipo)) {
        const nuevoStock = Math.max(0, producto.stock_total - parseInt(cantidad));
        await supabase
          .from('products')
          .update({ stock_total: nuevoStock })
          .eq('id', producto_id);
      }

      return res.status(201).json(movimiento);
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
