import { supabase, setCorsHeaders } from '../../lib/utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { clave } = req.query;

  try {
    // GET lista de configuración o config específica
    if (req.method === 'GET') {
      // Si tiene clave, obtiene config específica
      if (clave) {
        const { data, error } = await supabase
          .from('configuracion')
          .select('*')
          .eq('clave', clave)
          .single();

        if (error) {
          console.error('Error fetching config:', error);
          return res.status(404).json({ error: 'Configuración no encontrada' });
        }

        return res.status(200).json(data);
      }

      // Si no tiene clave, lista toda la configuración
      const { data, error } = await supabase.from('configuracion').select('*');

      if (error) {
        console.error('Error fetching config:', error);
        return res.status(500).json({ error: 'Error cargando configuración' });
      }

      return res.status(200).json(data || []);
    }

    // PUT actualizar configuración
    if (req.method === 'PUT') {
      if (!clave) {
        return res.status(400).json({ error: 'Clave requerida para actualizar' });
      }

      const { valor, descripcion } = req.body;

      const updateData = {};
      if (valor !== undefined) updateData.valor = valor;
      if (descripcion !== undefined) updateData.descripcion = descripcion;

      const { data, error } = await supabase
        .from('configuracion')
        .update(updateData)
        .eq('clave', clave)
        .select()
        .single();

      if (error) {
        console.error('Error updating config:', error);
        return res.status(400).json({ error: 'Error actualizando configuración' });
      }

      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en /api/configuracion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export default handler;
