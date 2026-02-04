import { supabase, setCorsHeaders } from '../../lib/utils.js';

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

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y password son requeridos' });
      }

      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return res.status(400).json({ error: authError.message || 'Error creando usuario' });
      }

      // Insertar en tabla users
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email,
          role: role || 'vendedor'
        }])
        .select();

      if (error) {
        console.error('Error creating user record:', error);
        return res.status(400).json({ error: 'Error creando registro de usuario' });
      }

      return res.status(201).json(data[0]);
    }

    // PUT: Actualizar usuario
    if (req.method === 'PUT') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID es requerido' });
      }

      const { email, role, password } = req.body;

      // Actualizar password si se proporciona
      if (password) {
        const { error: pwError } = await supabase.auth.admin.updateUserById(id, {
          password
        });
        
        if (pwError) {
          console.error('Error updating password:', pwError);
          return res.status(400).json({ error: 'Error actualizando contraseña' });
        }
      }

      // Actualizar en tabla users
      const updateData = {};
      if (email) updateData.email = email;
      if (role) updateData.role = role;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating user:', error);
        return res.status(400).json({ error: 'Error actualizando usuario' });
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
