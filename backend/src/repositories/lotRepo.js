const db = require('../db/knex');

async function create(data) {
  const [r] = await db('lots').insert(data).returning('*');
  return r;
}

function listByProduct(producto_id) {
  return db('lots').where({ producto_id }).andWhere('cantidad', '>', 0).orderBy('fecha_vencimiento', 'asc');
}

module.exports = { create, listByProduct };
