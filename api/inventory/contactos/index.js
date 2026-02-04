import { supabase, setCorsHeaders } from '../../../lib/utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const tipo = req.query.tipo || 'cliente'; // 'cliente' o 'proveedor'
    const tabla = tipo === 'proveedor' ? 'suppliers' : 'customers';

    // GET: Listar contactos o obtener específico
    if (req.method === 'GET') {
      const { id } = req.query;

      if (id) {
        // Obtener contacto específico
        const { data, error } = await supabase
          .from(tabla)
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error(`Error fetching ${tipo}:`, error);
          return res.status(404).json({ error: `${tipo} no encontrado` });
        }

        return res.status(200).json(data);
      }

      // Listar todos los contactos
      const { data, error } = await supabase
        .from(tabla)
        .select('*')
        .eq('estado', true)
        .order('nombre');

      if (error) {
        console.error(`Error fetching ${tabla}:`, error);
        return res.status(500).json({ error: `Error cargando ${tipo}s` });
      }

      return res.status(200).json(data || []);
    }

    // POST: Crear contacto
    if (req.method === 'POST') {
      const { nombre, email, telefono, direccion, contacto } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'Nombre es requerido' });
      }

      const payload = {
        nombre,
        email,
        telefono,
        direccion,
        estado: true
      };

      // Agregar campo contacto solo para proveedores
      if (tipo === 'proveedor') {
        payload.contacto = contacto;
      }

      const { data, error } = await supabase
        .from(tabla)
        .insert([payload])
        .select();

      if (error) {
        console.error(`Error creating ${tipo}:`, error);
        return res.status(400).json({ error: `Error creando ${tipo}` });
      }

      return res.status(201).json(data[0]);
    }

    // PUT: Actualizar contacto
    if (req.method === 'PUT') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID es requerido' });
      }

      const { nombre, email, telefono, direccion, contacto, estado } = req.body;

      const payload = {
        ...(nombre && { nombre }),
        ...(email && { email }),
        ...(telefono && { telefono }),
        ...(direccion && { direccion }),
        ...(estado !== undefined && { estado }),
        ...(tipo === 'proveedor' && contacto && { contacto })
      };

      const { data, error } = await supabase
        .from(tabla)
        .update(payload)
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error updating ${tipo}:`, error);
        return res.status(400).json({ error: `Error actualizando ${tipo}` });
      }

      return res.status(200).json(data[0]);
    }

    // DELETE: Eliminar contacto (soft delete)
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID es requerido' });
      }

      const { data, error } = await supabase
        .from(tabla)
        .update({ estado: false })
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Error deleting ${tipo}:`, error);
        return res.status(400).json({ error: `Error eliminando ${tipo}` });
      }

      return res.status(200).json({ message: `${tipo} eliminado correctamente` });
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en /api/inventory/contactos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export default handler;
