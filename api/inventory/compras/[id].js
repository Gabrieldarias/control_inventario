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
        .from('purchases')
        .select(`
          *,
          purchase_items(
            *,
            products(nombre, codigo_interno)
          ),
          suppliers(nombre, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching purchase:', error);
        return res.status(404).json({ error: 'Compra no encontrada' });
      }

      return res.status(200).json(data);
    }

    if (req.method === 'PUT') {
      const { estado } = req.body;

      const updateData = {};
      if (estado !== undefined) updateData.estado = estado;

      const { data, error } = await supabase
        .from('purchases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating purchase:', error);
        return res.status(400).json({ error: 'Error actualizando compra' });
      }

      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting purchase:', error);
        return res.status(400).json({ error: 'Error eliminando compra' });
      }

      return res.status(200).json({ message: 'Compra eliminada' });
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en /api/inventory/compras/[id]:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export default handler;
