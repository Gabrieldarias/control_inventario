import { supabase, setCorsHeaders } from '../../utils';
import { requireAuth } from '../../middleware/auth';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { data, error } = await supabase.from('categorias').select('*').eq('estado', true);

    if (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Error cargando categorías' });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error en /api/inventory/categorias GET:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export default requireAuth(handler);
