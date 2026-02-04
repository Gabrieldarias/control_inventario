import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    const { id } = req.query;

    if (req.method === 'GET') {
      if (id) {
        // GET una devolución específica con sus items y datos relacionados
        const { data: devolucion, error } = await supabase
          .from('returns')
          .select(`
            id,
            venta_id,
            motivo,
            total,
            estado,
            created_at,
            updated_at,
            return_items (
              id,
              producto_id,
              cantidad,
              precio_unitario,
              subtotal,
              products (
                id,
                nombre,
                codigo_interno,
                stock_total
              )
            ),
            sales (
              id,
              cliente_id,
              customers (
                id,
                nombre,
                email,
                telefono
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        if (!devolucion) {
          return res.status(404).json({ error: 'Devolución no encontrada' });
        }

        return res.status(200).json(devolucion);
      } else {
        // GET lista de devoluciones
        const { data: devoluciones, error } = await supabase
          .from('returns')
          .select(`
            id,
            venta_id,
            motivo,
            total,
            estado,
            created_at,
            updated_at,
            return_items (
              id,
              producto_id,
              cantidad,
              precio_unitario,
              subtotal
            ),
            sales (
              id,
              cliente_id,
              customers (
                id,
                nombre,
                email
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          return res.status(400).json({ error: error.message });
        }

        return res.status(200).json(devoluciones || []);
      }
    }

    if (req.method === 'POST') {
      const { venta_id, motivo, items } = req.body;

      if (!venta_id || !items || items.length === 0) {
        return res.status(400).json({ 
          error: 'venta_id y items son requeridos' 
        });
      }

      // Validar que la venta exista
      const { data: venta, error: ventaError } = await supabase
        .from('sales')
        .select('id, total')
        .eq('id', venta_id)
        .single();

      if (ventaError || !venta) {
        return res.status(404).json({ error: 'Venta no encontrada' });
      }

      // Calcular total de devolución
      const totalDevolucion = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

      // Crear devolución
      const { data: devolucion, error: devError } = await supabase
        .from('returns')
        .insert({
          venta_id,
          motivo: motivo || '',
          total: totalDevolucion,
          estado: 'completada'
        })
        .select()
        .single();

      if (devError) {
        return res.status(400).json({ error: devError.message });
      }

      // Insertar items de devolución
      const itemsData = items.map(item => ({
        devolucion_id: devolucion.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal
      }));

      const { error: itemsError } = await supabase
        .from('return_items')
        .insert(itemsData);

      if (itemsError) {
        // Eliminar devolución si falla inserción de items
        await supabase.from('returns').delete().eq('id', devolucion.id);
        return res.status(400).json({ error: itemsError.message });
      }

      // Incrementar stock de productos devueltos
      for (const item of items) {
        const { data: producto } = await supabase
          .from('products')
          .select('stock_total')
          .eq('id', item.producto_id)
          .single();

        if (producto) {
          const nuevoStock = producto.stock_total + item.cantidad;
          await supabase
            .from('products')
            .update({ stock_total: nuevoStock })
            .eq('id', item.producto_id);

          // Registrar movimiento de inventario
          await supabase
            .from('movimientos')
            .insert({
              producto_id: item.producto_id,
              tipo: 'devolucion',
              cantidad: item.cantidad,
              motivo: `Devolución de venta ${venta_id}`,
              referencia_id: devolucion.id,
              usuario_email: 'sistema'
            });
        }
      }

      return res.status(201).json(devolucion);
    }

    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ error: 'id es requerido para actualizar' });
      }

      const { motivo, estado } = req.body;

      const updateData = {};
      if (motivo !== undefined) updateData.motivo = motivo;
      if (estado !== undefined) updateData.estado = estado;

      const { data: devolucion, error } = await supabase
        .from('returns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(devolucion);
    }

    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'id es requerido para eliminar' });
      }

      // Obtener items antes de eliminar
      const { data: items, error: itemsError } = await supabase
        .from('return_items')
        .select('producto_id, cantidad')
        .eq('devolucion_id', id);

      if (itemsError) {
        return res.status(400).json({ error: itemsError.message });
      }

      // Revertir stock
      if (items && items.length > 0) {
        for (const item of items) {
          const { data: producto } = await supabase
            .from('products')
            .select('stock_total')
            .eq('id', item.producto_id)
            .single();

          if (producto) {
            const nuevoStock = Math.max(0, producto.stock_total - item.cantidad);
            await supabase
              .from('products')
              .update({ stock_total: nuevoStock })
              .eq('id', item.producto_id);

            // Registrar movimiento de reversión
            await supabase
              .from('movimientos')
              .insert({
                producto_id: item.producto_id,
                tipo: 'devolucion_cancelada',
                cantidad: -item.cantidad,
                motivo: `Cancelación de devolución ${id}`,
                referencia_id: id,
                usuario_email: 'sistema'
              });
          }
        }
      }

      // Eliminar items primero (por constraint)
      await supabase.from('return_items').delete().eq('devolucion_id', id);

      // Eliminar devolución
      const { error } = await supabase
        .from('returns')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Devolución eliminada correctamente' });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
