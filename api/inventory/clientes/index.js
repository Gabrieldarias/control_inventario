import { supabase, setCorsHeaders } from '../../utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('estado', true)
        .order('nombre');

      if (error) {
        console.error('Error fetching customers:', error);
        return res.status(500).json({ error: 'Error cargando clientes' });
      }

      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { nombre, email, telefono, direccion } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'Nombre es requerido' });
      }

      const { data, error } = await supabase.from('customers').insert([{
        nombre,
        email,
        telefono,
        direccion,
        estado: true
      }]).select();

      if (error) {
        console.error('Error creating customer:', error);
        return res.status(400).json({ error: 'Error creando cliente' });
      }

      return res.status(201).json(data[0]);
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en /api/inventory/clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export default handler;
