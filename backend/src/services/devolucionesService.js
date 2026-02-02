const knex = require('../db/knex');

async function crearDevolucion({ tipo, referencia_original, motivo, items, usuario_id }) {
  const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
  
  const [devolucionId] = await knex('devoluciones').insert({
    tipo,
    referencia_original,
    almacen_id: 1,
    usuario_id,
    fecha: new Date().toISOString(),
    motivo,
    total
  });

  for (const item of items) {
    await knex('devolucion_items').insert({
      devolucion_id: devolucionId,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio
    });

    // Registrar movimiento
    await knex('stock_movements').insert({
      producto_id: item.producto_id,
      tipo: tipo === 'cliente' ? 'devolucion_cliente' : 'devolucion_proveedor',
      cantidad: item.cantidad,
      referencia: 'devolucion_' + devolucionId,
      motivo
    });
  }

  return knex('devoluciones').where('id', devolucionId).first();
}

async function listarDevoluciones() {
  return knex('devoluciones').orderBy('fecha', 'desc');
}

module.exports = { crearDevolucion, listarDevoluciones };
