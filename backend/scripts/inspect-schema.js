// Script para inspeccionar el esquema actual de lots
const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../tienda_mvp.db')
  },
  useNullAsDefault: true
});

async function inspectSchema() {
  try {
    const lotsInfo = await db('lots_old').columnInfo();
    console.log('Columnas en lots_old:');
    console.log(JSON.stringify(lotsInfo, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await db.destroy();
  }
}

inspectSchema();
