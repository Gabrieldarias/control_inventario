import { supabase, setCorsHeaders } from '../../utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { data, error } = await supabase.from('categories').select('*').eq('estado', true);

    if (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Error cargando categorías', details: error.message });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error en /api/inventory/categorias GET:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}

export default handler;
