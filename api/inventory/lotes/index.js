import { supabase, setCorsHeaders } from '../../utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    // GET lista de lotes o lote específico
    if (req.method === 'GET') {
      // Si tiene ID, obtiene lote específico
      if (id) {
        const { data, error } = await supabase
          .from('lotes')
          .select('*, products(nombre)')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching lote:', error);
          return res.status(404).json({ error: 'Lote no encontrado' });
        }

        return res.status(200).json(data);
      }

      // Si no tiene ID, lista lotes por producto
      const { producto_id } = req.query;

      if (!producto_id) {
        return res.status(400).json({ error: 'producto_id requerido' });
      }

      const { data, error } = await supabase
        .from('lotes')
        .select('*')
        .eq('producto_id', producto_id)
        .eq('estado', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lotes:', error);
        return res.status(500).json({ error: 'Error cargando lotes' });
      }

      return res.status(200).json(data || []);
    }

    // POST crear nuevo lote
    if (req.method === 'POST') {
      const { producto_id, numero_lote, cantidad, fecha_vencimiento, precio_costo } = req.body;

      if (!producto_id || !numero_lote || !cantidad) {
        return res.status(400).json({ error: 'producto_id, numero_lote y cantidad son requeridos' });
      }

      // Crear lote
      const { data: lote, error: loteError } = await supabase
        .from('lotes')
        .insert([{
          producto_id,
          numero_lote,
          cantidad,
          fecha_vencimiento: fecha_vencimiento || null,
          precio_costo: precio_costo || null,
          estado: true
        }])
        .select()
        .single();

      if (loteError) {
        console.error('Error creating lote:', loteError);
        return res.status(400).json({ error: 'Error creando lote', details: loteError.message });
      }

      // Actualizar stock del producto
      const { data: product } = await supabase
        .from('products')
        .select('stock_total')
        .eq('id', producto_id)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({ stock_total: product.stock_total + cantidad })
          .eq('id', producto_id);
      }

      // Registrar movimiento de inventario
      await supabase
        .from('movimientos')
        .insert([{
          producto_id,
          tipo: 'entrada',
          cantidad,
          lote_id: lote.id,
          motivo: 'Ingreso de nuevo lote: ' + numero_lote
        }]);

      return res.status(201).json(lote);
    }

    // PUT actualizar lote
    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ error: 'ID requerido para actualizar' });
      }

      const { numero_lote, cantidad, fecha_vencimiento, precio_costo, estado } = req.body;

      const updateData = {};
      if (numero_lote !== undefined) updateData.numero_lote = numero_lote;
      if (cantidad !== undefined) updateData.cantidad = cantidad;
      if (fecha_vencimiento !== undefined) updateData.fecha_vencimiento = fecha_vencimiento;
      if (precio_costo !== undefined) updateData.precio_costo = precio_costo;
      if (estado !== undefined) updateData.estado = estado;

      const { data, error } = await supabase
        .from('lotes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lote:', error);
        return res.status(400).json({ error: 'Error actualizando lote' });
      }

      return res.status(200).json(data);
    }

    // DELETE lote
    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'ID requerido para eliminar' });
      }

      const { error } = await supabase
        .from('lotes')
        .update({ estado: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting lote:', error);
        return res.status(400).json({ error: 'Error eliminando lote' });
      }

      return res.status(200).json({ message: 'Lote eliminado' });
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en /api/inventory/lotes:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}

export default handler;
