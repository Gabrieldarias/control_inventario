import { supabase, setCorsHeaders } from '../utils';
import { requireAuth } from '../middleware/auth';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const clave = req.url.split('/').pop();
    
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .eq('clave', clave)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export default requireAuth(handler);
