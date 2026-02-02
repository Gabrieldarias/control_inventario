const knex = require('../db/knex');
const configService = require('./configService');

async function crearCompra(proveedor_id, items, usuario_id) {
  const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
  
  // Obtener porcentaje de ganancia configurado
  const porcentajeGanancia = await configService.getConfig('porcentaje_ganancia') || 30;
  
  const [compraId] = await knex('compras').insert({
    proveedor_id,
    almacen_id: 1,
    usuario_id,
    fecha: new Date().toISOString(),
    total,
    estado: 'recibida'
  });

  for (const item of items) {
    // Calcular precio de venta automáticamente
    const precioCosto = parseFloat(item.precio);
    const precioVenta = precioCosto + (precioCosto * porcentajeGanancia / 100);
    
    // Actualizar precio_costo y precio_venta del producto
    await knex('products')
      .where('id', item.producto_id)
      .update({
        precio_costo: precioCosto,
        precio_venta: precioVenta.toFixed(2),
        updated_at: new Date().toISOString()
      });
    
    const [loteId] = await knex('lots').insert({
      producto_id: item.producto_id,
      cantidad_inicial: item.cantidad,
      cantidad_actual: item.cantidad,
      costo_unitario: precioCosto,
      proveedor_id,
      almacen_id: 1,
      estado: 'activo',
      fecha_ingreso: new Date().toISOString()
    });

    await knex('compra_items').insert({
      compra_id: compraId,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: precioCosto,
      lote_id: loteId
    });

    await knex('stock_movements').insert({
      producto_id: item.producto_id,
      lote_id: loteId,
      tipo: 'compra',
      cantidad: item.cantidad,
      cantidad_anterior: 0,
      cantidad_nueva: item.cantidad,
      referencia: 'compra_' + compraId
    });
  }

  return knex('compras').where('id', compraId).first();
}

async function listarCompras() {
  return knex('compras').orderBy('fecha', 'desc');
}

async function obtenerCompra(id) {
  const compra = await knex('compras').where('id', id).first();
  if (!compra) return null;
  
  const items = await knex('compra_items').where('compra_id', id);
  return Object.assign({}, compra, { items });
}

module.exports = { crearCompra, listarCompras, obtenerCompra };
