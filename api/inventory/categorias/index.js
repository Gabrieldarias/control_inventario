import { supabase, setCorsHeaders } from '../../utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('categories').select('*').eq('estado', true);

      if (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({ error: 'Error cargando categorías', details: error.message });
      }

      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { nombre, descripcion } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'Nombre requerido' });
      }

      const { data, error } = await supabase.from('categories').insert([{
        nombre,
        descripcion,
        estado: true
      }]).select();

      if (error) {
        console.error('Error creating category:', error);
        return res.status(400).json({ error: 'Error creando categoría' });
      }

      return res.status(201).json(data[0]);
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en /api/inventory/categorias:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}

export default handler;
