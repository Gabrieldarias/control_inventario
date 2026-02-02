const db = require('../db/knex');
const stockService = require('./stockService');

/**
 * items: [{ producto_id, cantidad, precio_unitario }]
 */
async function createSale(vendedor_id, items, total) {
  return await db.transaction(async trx => {
    // Validar stock disponible para cada producto
    for (const it of items) {
      const result = await trx('lots').where('producto_id', it.producto_id).sum('cantidad_actual as total');
      const stock_total = result[0] ? result[0].total : 0;
      const available = parseInt(stock_total || 0, 10);
      if (available < it.cantidad) throw new Error(`Stock insuficiente para producto ${it.producto_id}`);
    }

    // Crear venta (SQLite no soporta .returning, usar lastID)
    const [sale_id] = await trx('sales').insert({ vendedor_id, total, fecha: new Date().toISOString() });
    const sale = await trx('sales').where('id', sale_id).first();

    // Por cada item, descontar FIFO y registrar sale_items y sale_item_lots
    for (const it of items) {
      const subtotal = it.precio_unitario * it.cantidad;
      const [sale_item_id] = await trx('sale_items').insert({ 
        sale_id: sale.id, 
        producto_id: it.producto_id, 
        cantidad: it.cantidad, 
        precio_unitario: it.precio_unitario,
        subtotal: subtotal
      });
      
      const consumed = await stockService.deductFIFO(it.producto_id, it.cantidad, trx);
      for (const c of consumed) {
        await trx('sale_item_lots').insert({ 
          sale_item_id: sale_item_id, 
          lote_id: c.lote_id, 
          cantidad: c.cantidad 
        });
      }
    }

    return sale;
  });
}

async function salesReport({ from, to }) {
  const q = db('sales').select('*');
  if (from) q.where('fecha', '>=', from);
  if (to) q.where('fecha', '<=', to);
  const rows = await q;
  return rows;
}

async function getSaleDetails(saleId) {
  const sale = await db('sales').where('id', saleId).first();
  if (!sale) throw new Error('Venta no encontrada');
  
  const items = await db('sale_items')
    .join('products', 'sale_items.producto_id', 'products.id')
    .where('sale_items.sale_id', saleId)
    .select(
      'sale_items.*',
      'products.nombre as nombre',
      'products.codigo_interno'
    );
  
  return {
    ...sale,
    detalles: items
  };
}

module.exports = { createSale, salesReport, getSaleDetails };
