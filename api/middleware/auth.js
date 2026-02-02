import jwt from 'jsonwebtoken';
import { setCorsHeaders } from '../utils';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

export function requireAuth(handler) {
  return async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Token inválido o ausente' });
    }

    req.user = user;
    return handler(req, res);
  };
}

export function requireRole(allowedRoles) {
  return (handler) => {
    return requireAuth(async (req, res) => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden: No tienes permisos' });
      }
      return handler(req, res);
    });
  };
}
