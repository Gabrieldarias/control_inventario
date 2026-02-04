import { supabase, setCorsHeaders } from '../../utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { estado } = req.query;
    let query = supabase.from('products').select('*, categories(nombre)');

    if (estado === 'true') {
      query = query.eq('estado', true);
    } else if (estado === 'false') {
      query = query.eq('estado', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Error cargando productos', details: error.message });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error en /api/inventory/productos GET:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}

export default handler;
