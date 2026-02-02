// Script para inspeccionar tabla configuracion
const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../tienda_mvp.db')
  },
  useNullAsDefault: true
});

async function inspect() {
  try {
    const info = await db('configuracion').columnInfo();
    console.log('Columnas en configuracion:');
    console.log(JSON.stringify(info, null, 2));
    
    const data = await db('configuracion').select('*');
    console.log('\nDatos actuales:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await db.destroy();
  }
}

inspect();
