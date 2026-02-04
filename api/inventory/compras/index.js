import { supabase, setCorsHeaders } from '../../utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    // GET lista de compras o compra específica
    if (req.method === 'GET') {
      // Si tiene ID, obtiene compra específica
      if (id) {
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            *,
            purchase_items(
              *,
              products(nombre, codigo_interno)
            ),
            suppliers(nombre, email)
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching purchase:', error);
          return res.status(404).json({ error: 'Compra no encontrada' });
        }

        return res.status(200).json(data);
      }

      // Si no tiene ID, lista compras
      const { proveedor_id, estado } = req.query;
      
      let query = supabase
        .from('purchases')
        .select(`
          *,
          purchase_items(
            *,
            products(nombre, codigo_interno)
          ),
          suppliers(nombre, email)
        `)
        .order('created_at', { ascending: false });

      if (proveedor_id) {
        query = query.eq('proveedor_id', proveedor_id);
      }
      if (estado) {
        query = query.eq('estado', estado);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching purchases:', error);
        return res.status(500).json({ error: 'Error cargando compras' });
      }

      return res.status(200).json(data || []);
    }

    // POST crear nueva compra
    if (req.method === 'POST') {
      const { proveedor_id, items } = req.body;

      if (!proveedor_id || !items || items.length === 0) {
        return res.status(400).json({ error: 'proveedor_id e items son requeridos' });
      }

      // Calcular total
      const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

      // Crear compra
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert([{
          proveedor_id,
          total,
          estado: 'completada'
        }])
        .select()
        .single();

      if (purchaseError) {
        console.error('Error creating purchase:', purchaseError);
        return res.status(400).json({ error: 'Error creando compra' });
      }

      // Crear items de compra
      const purchaseItems = items.map(item => ({
        compra_id: purchase.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario
      }));

      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(purchaseItems);

      if (itemsError) {
        console.error('Error creating purchase items:', itemsError);
        await supabase.from('purchases').delete().eq('id', purchase.id);
        return res.status(400).json({ error: 'Error creando items de compra' });
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
            .update({ stock_total: product.stock_total + item.cantidad })
            .eq('id', item.producto_id);
        }
      }

      // Registrar movimiento de inventario
      for (const item of items) {
        await supabase
          .from('movimientos')
          .insert([{
            producto_id: item.producto_id,
            tipo: 'entrada',
            cantidad: item.cantidad,
            motivo: 'Compra desde proveedor'
          }]);
      }

      return res.status(201).json(purchase);
    }

    // PUT actualizar compra
    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ error: 'ID requerido para actualizar' });
      }

      const { estado } = req.body;

      const updateData = {};
      if (estado !== undefined) updateData.estado = estado;

      const { data, error } = await supabase
        .from('purchases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating purchase:', error);
        return res.status(400).json({ error: 'Error actualizando compra' });
      }

      return res.status(200).json(data);
    }

    // DELETE compra
    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'ID requerido para eliminar' });
      }

      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting purchase:', error);
        return res.status(400).json({ error: 'Error eliminando compra' });
      }

      return res.status(200).json({ message: 'Compra eliminada' });
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error en /api/inventory/compras:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}

export default handler;
