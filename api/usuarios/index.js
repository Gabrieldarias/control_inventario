import { supabase, setCorsHeaders } from '../../lib/utils.js';
import { randomUUID } from 'crypto';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET: Listar usuarios
    if (req.method === 'GET') {
      const { id } = req.query;

      if (id) {
        // Obtener usuario específico
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching user:', error);
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        return res.status(200).json(data);
      }

      // Listar todos los usuarios
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('email');

      if (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Error cargando usuarios' });
      }

      return res.status(200).json(data || []);
    }

    // POST: Crear usuario
    if (req.method === 'POST') {
      const { email, password, role } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
      }

      // Generar UUID para el usuario
      const userId = randomUUID();

      // Insertar usuario directamente en la tabla users
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email,
          role: role || 'vendedor'
        }])
        .select();

      if (error) {
        console.error('Error creating user:', error);
        if (error.code === '23505') {
          return res.status(400).json({ error: 'El email ya está registrado' });
        }
        return res.status(400).json({ error: 'Error creando usuario: ' + error.message });
      }

      return res.status(201).json(data[0]);
    }

    // PUT: Actualizar usuario
    if (req.method === 'PUT') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID es requerido' });
      }

      const { email, role } = req.body;

      // Actualizar en tabla users
      // Nota: La contraseña debería actualizarse en Supabase Auth con service_role key
      const updateData = {};
      if (email) updateData.email = email;
      if (role) updateData.role = role;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No hay datos para actualizar' });
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating user:', error);
        return res.status(400).json({ error: 'Error actualizando usuario: ' + error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      return res.status(200).json(data[0]);
    }

    // DELETE: Eliminar usuario (soft delete - desactivar)
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID es requerido' });
      }

      // Actualizar estado a inactivo
      const { data, error } = await supabase
        .from('users')
        .update({ estado: false })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error deleting user:', error);
        return res.status(400).json({ error: 'Error desactivando usuario' });
      }

      return res.status(200).json({ message: 'Usuario desactivado correctamente' });
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en /api/usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export default handler;
