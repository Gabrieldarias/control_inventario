import { supabase, setCorsHeaders } from '../../utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const {
        nombre,
        codigo_interno,
        categoria_id,
        descripcion,
        precio_costo,
        precio_venta,
        stock_minimo,
        stock_maximo,
        requiere_lote,
        unidad_medida
      } = req.body;

      if (!nombre || !precio_venta) {
        return res.status(400).json({ error: 'Nombre y precio_venta requeridos' });
      }

      const { data, error } = await supabase.from('products').insert([{
        nombre,
        codigo_interno,
        categoria_id,
        descripcion,
        precio_costo,
        precio_venta,
        stock_minimo: stock_minimo || 5,
        stock_maximo: stock_maximo || 1000,
        stock_total: 0,
        requiere_lote: requiere_lote !== false,
        unidad_medida: unidad_medida || 'ud',
        estado: true
      }]).select();

      if (error) {
        console.error('Error creating product:', error);
        return res.status(400).json({ error: 'Error creando producto' });
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

export default handler;
