import { supabase, setCorsHeaders } from '../../utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID requerido' });
  }

  try {
    if (req.method === 'GET') {
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

    if (req.method === 'PUT') {
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

    if (req.method === 'DELETE') {
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
    console.error('Error en /api/inventory/lotes/[id]:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export default handler;
