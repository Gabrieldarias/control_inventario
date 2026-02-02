// Script para verificar y ejecutar la migración
const knex = require('knex');
const path = require('path');
const fs = require('fs');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../tienda_mvp.db')
  },
  useNullAsDefault: true
});

async function checkAndMigrate() {
  try {
    // Verificar si existe la tabla configuracion
    const hasConfigTable = await db.schema.hasTable('configuracion');
    console.log('Tabla configuracion existe:', hasConfigTable);
    
    if (!hasConfigTable) {
      console.log('\n❌ La tabla configuracion NO existe. Necesitas ejecutar la migración.');
      console.log('\nOpciones:');
      console.log('1. Reinicializar la BD completa (ADVERTENCIA: perderás todos los datos):');
      console.log('   npm run init-db');
      console.log('\n2. O ejecutar la migración manualmente desde un cliente SQLite');
    } else {
      console.log('\n✅ La tabla configuracion existe correctamente.');
      
      // Verificar datos
      const config = await db('configuracion').select('*');
      console.log('\nConfiguraciones actuales:', config);
    }
    
    // Verificar si existe fecha_vencimiento en lots
    const lotsInfo = await db('lots').columnInfo();
    const hasFechaVencimiento = 'fecha_vencimiento' in lotsInfo;
    console.log('\nTabla lots tiene fecha_vencimiento:', hasFechaVencimiento);
    
    if (hasFechaVencimiento) {
      console.log('❌ La columna fecha_vencimiento aún existe en lots. Necesitas ejecutar la migración.');
    } else {
      console.log('✅ La columna fecha_vencimiento fue eliminada correctamente.');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await db.destroy();
  }
}

checkAndMigrate();
