import { supabase, setCorsHeaders } from '../utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { from, to } = req.query;
      let query = supabase
        .from('sales')
        .select(`
          *,
          sale_items(
            *,
            products(nombre, codigo_interno)
          ),
          customers(nombre, email)
        `)
        .order('created_at', { ascending: false });

      if (from) {
        query = query.gte('created_at', from);
      }
      if (to) {
        query = query.lte('created_at', to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sales:', error);
        return res.status(500).json({ error: 'Error cargando ventas' });
      }

      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { cliente_id, items, vendedor_email } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Debe incluir al menos un producto' });
      }

      // Calcular total
      const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

      // Crear venta
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          cliente_id,
          vendedor_email,
          total,
          estado: 'completada'
        }])
        .select()
        .single();

      if (saleError) {
        console.error('Error creating sale:', saleError);
        return res.status(400).json({ error: 'Error creando venta' });
      }

      // Crear items de venta
      const saleItems = items.map(item => ({
        venta_id: sale.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) {
        console.error('Error creating sale items:', itemsError);
        // Rollback: eliminar venta
        await supabase.from('sales').delete().eq('id', sale.id);
        return res.status(400).json({ error: 'Error creando items de venta' });
      }

      // Actualizar stock de productos
      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock_total')
          .eq('id', item.producto_id)
          .single();

        if (product) {
          await supabase
            .from('products')
            .update({ stock_total: product.stock_total - item.cantidad })
            .eq('id', item.producto_id);
        }
      }

      return res.status(201).json(sale);
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en /api/sales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export default handler;
