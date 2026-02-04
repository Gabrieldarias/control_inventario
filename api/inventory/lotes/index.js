import { supabase, setCorsHeaders } from '../../utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
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

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en /api/inventory/lotes:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}

export default handler;
