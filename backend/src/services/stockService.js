const db = require('../db/knex');

/**
 * Descontar stock usando FIFO por fecha_ingreso (lote más antiguo primero).
 * - producto_id: id del producto
 * - cantidad: cantidad a descontar
 * - trx: transaction de knex
 * Retorna arreglo de { lote_id, cantidad } consumidos.
 */
async function deductFIFO(producto_id, cantidad, trx) {
  let remaining = cantidad;
  const consumed = [];
  const lots = await trx('lots')
    .where({ producto_id })
    .andWhere('cantidad_actual', '>', 0)
    .orderBy('fecha_ingreso', 'asc')
    .forUpdate();
    
  for (const lote of lots) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, lote.cantidad_actual);
    // actualizar lote
    await trx('lots').where({ id: lote.id }).update({ cantidad_actual: lote.cantidad_actual - take });
    // registrar movimiento
    await trx('stock_movements').insert({ 
      producto_id, 
      lote_id: lote.id, 
      tipo: 'venta', 
      cantidad: -take,
      cantidad_anterior: lote.cantidad_actual,
      cantidad_nueva: lote.cantidad_actual - take,
      referencia: 'venta_pos' 
    });
    consumed.push({ lote_id: lote.id, cantidad: take });
    remaining -= take;
  }
  if (remaining > 0) throw new Error('Stock insuficiente');
  return consumed;
}

module.exports = { deductFIFO };
