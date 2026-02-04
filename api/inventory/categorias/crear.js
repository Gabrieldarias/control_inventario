import { supabase, setCorsHeaders } from '../../utils';
import { requireAuth, requireRole } from '../../middleware/auth';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { nombre, descripcion, orden } = req.body;

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

      res.status(201).json(data[0]);
    } catch (error) {
      console.error('Error en POST:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}

export default requireRole(['admin'])(handler);
