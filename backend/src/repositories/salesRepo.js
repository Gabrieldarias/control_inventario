const db = require('../db/knex');

async function createSale(sale, items, trx) {
  const [s] = await trx('sales').insert(sale).returning('*');
  for (const it of items) {
    const [si] = await trx('sale_items').insert({ sale_id: s.id, producto_id: it.producto_id, cantidad: it.cantidad, precio_unitario: it.precio_unitario }).returning('*');
    // sale_item_lots entries are handled by service
  }
  return s;
}

module.exports = { createSale };
