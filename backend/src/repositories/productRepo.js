const db = require('../db/knex');

async function listAll() {
  // Retornar productos con stock_total calculado desde los lotes
  const rows = await db('products as p')
    .leftJoin('lots as l', 'l.producto_id', 'p.id')
    .groupBy('p.id')
    .select('p.*', db.raw('COALESCE(SUM(l.cantidad),0) as stock_total'));
  return rows;
}

async function create(data) {
  const [r] = await db('products').insert(data).returning('*');
  return r;
}

async function update(id, data) {
  const [r] = await db('products').where({ id }).update(data).returning('*');
  return r;
}

function remove(id) {
  return db('products').where({ id }).del();
}

async function getAlerts() {
  const products = await db('products');
  const alerts = [];
  for (const p of products) {
    const [{ total }] = await db('lots').where('producto_id', p.id).sum('cantidad as total');
    const stock_total = parseInt(total || 0, 10);
    if (stock_total <= p.stock_minimo) alerts.push({ type: 'stock_bajo', producto: p, stock_total });
  }
  // próximos a vencer
  const dias = parseInt(process.env.ALERTA_DIAS_VENCIMIENTO || '7', 10);
  const prox = await db('lots').whereNotNull('fecha_vencimiento').andWhere('fecha_vencimiento', '<=', db.raw("current_date + ?::int", [dias]));
  for (const l of prox) alerts.push({ type: 'por_vencer', lote: l });
  return alerts;
}

module.exports = { listAll, create, update, remove, getAlerts };
