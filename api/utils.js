import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY environment variables are required');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware de CORS
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Manejo de OPTIONS
export function handleOptionsRequest(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}

// Verificar JWT
export async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    // Aquí verificarías con JWT real. Por ahora, validación básica
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return data.user;
  } catch (err) {
    return null;
  }
}

// Respuesta de error
export function errorResponse(res, statusCode, message) {
  setCorsHeaders(res);
  res.status(statusCode).json({ error: message });
}

// Respuesta exitosa
export function successResponse(res, statusCode, data) {
  setCorsHeaders(res);
  res.status(statusCode).json(data);
}
