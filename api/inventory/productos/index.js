import { supabase, setCorsHeaders } from '../../utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { estado } = req.query;
      let query = supabase.from('products').select('*, categories(nombre)');

      if (estado === 'true') {
        query = query.eq('estado', true);
      } else if (estado === 'false') {
        query = query.eq('estado', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: 'Error cargando productos', details: error.message });
      }

      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
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

      return res.status(201).json(data[0]);
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en /api/inventory/productos:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}

export default handler;
