import { supabase, setCorsHeaders } from '../utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { data, error } = await supabase.from('configuracion').select('*');

    if (error) {
      console.error('Error fetching config:', error);
      return res.status(500).json({ error: 'Error cargando configuración' });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error en /api/configuracion GET:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export default handler;
