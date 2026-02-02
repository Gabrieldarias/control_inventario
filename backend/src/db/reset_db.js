const fs = require('fs');
const path = require('path');
const knex = require('./knex');

async function resetDatabase() {
  console.log('🔄 Reseteando base de datos...');
  
  try {
    // Leer el schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Eliminar la base de datos anterior si existe
    const dbPath = path.join(__dirname, '../../tienda_mvp.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✅ Base de datos anterior eliminada');
    }
    
    // Dividir las sentencias SQL y ejecutarlas
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await knex.raw(statement);
        } catch (error) {
          console.warn('⚠️ Error ejecutando:', statement.substring(0, 50), '...', error.message);
        }
      }
    }
    
    console.log('✅ Schema aplicado correctamente');
    
    // Cargar datos de semilla
    console.log('🌱 Cargando datos de semilla...');
    const seedsPath = path.join(__dirname, 'seeds.js');
    if (fs.existsSync(seedsPath)) {
      const seedsModule = require(seedsPath);
      const seedFunction = seedsModule.run || seedsModule;
      if (typeof seedFunction === 'function') {
        await seedFunction();
        console.log('✅ Datos de semilla cargados');
      }
    }
    
    console.log('✅ Base de datos reiniciada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetDatabase();
