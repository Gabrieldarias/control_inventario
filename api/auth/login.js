import jwt from 'jsonwebtoken';
import { setCorsHeaders } from './utils';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Verificar credenciales (ejemplo con usuarios hardcodeados para demo)
    const usuarios = {
      'admin@example.com': {
        id: 1,
        nombre: 'Admin',
        email: 'admin@example.com',
        role: 'admin',
        passwordHash: '$2b$10$zOOrULdVFF32EsosUytXTOan/59a4CnalhdnewzdGcdnJIGtFLD0.' // adminpass
      },
      'vendedor@example.com': {
        id: 2,
        nombre: 'Vendedor',
        email: 'vendedor@example.com',
        role: 'vendedor',
        passwordHash: '$2b$10$0Su6RrJNLRr0auJ7NmT.EOSGk.86xKZBUtTWr0hYyO.XTxyH7MUKi' // vendedorpass
      },
      'gabo@gmail.com': {
        id: 3,
        nombre: 'Gabriel',
        email: 'gabo@gmail.com',
        role: 'admin',
        passwordHash: '$2b$10$c2PKCyohMabkoP9otOdtYe/4RzmloTJxd0gtQ/fDHBNkJs7hCecJm' // gabo
      }
    };

    const usuario = usuarios[email];
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Comparar contraseña (en producción usar bcrypt)
    // Por ahora validación simplificada
    const isValidPassword = password === 'adminpass' || 
                           password === 'vendedorpass' || 
                           password === 'gabo';

    if (!isValidPassword || (email === 'admin@example.com' && password !== 'adminpass') ||
        (email === 'vendedor@example.com' && password !== 'vendedorpass') ||
        (email === 'gabo@gmail.com' && password !== 'gabo')) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        role: usuario.role 
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        role: usuario.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
