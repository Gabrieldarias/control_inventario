const fs = require('fs');
const path = require('path');
const db = require('./knex');

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '..', '..', 'db', 'schema.sql'), 'utf8');
  try {
    // Ejecutar cada statement por separado (necesario para SQLite)
    const statements = sql.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      await db.raw(stmt.trim());
    }
    console.log('Esquema aplicado correctamente');
    process.exit(0);
  } catch (err) {
    console.error('Error aplicando esquema:', err.message);
    process.exit(1);
  }
}

run();

