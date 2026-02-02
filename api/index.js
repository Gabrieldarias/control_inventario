import { setCorsHeaders } from '../utils';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({ 
    message: 'API funciona correctamente',
    version: '2.0',
    timestamp: new Date().toISOString()
  });
}
