// Script para revertir migración parcial
const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../tienda_mvp.db')
  },
  useNullAsDefault: true
});

async function rollback() {
  try {
    console.log('🔄 Revirtiendo migración parcial...\n');
    
    // Verificar si existe lots_old
    const hasLotsOld = await db.schema.hasTable('lots_old');
    const hasLots = await db.schema.hasTable('lots');
    
    if (hasLotsOld) {
      console.log('📋 Restaurando tabla lots desde lots_old...');
      
      if (hasLots) {
        await db.schema.dropTable('lots');
        console.log('   → Tabla lots (nueva) eliminada');
      }
      
      await db.schema.renameTable('lots_old', 'lots');
      console.log('   → Tabla lots_old renombrada a lots');
      console.log('✅ Tabla lots restaurada\n');
    } else {
      console.log('ℹ️ No hay nada que revertir (lots_old no existe)\n');
    }
    
    // Eliminar tabla configuracion si existe
    const hasConfig = await db.schema.hasTable('configuracion');
    if (hasConfig) {
      await db.schema.dropTable('configuracion');
      console.log('✅ Tabla configuracion eliminada\n');
    }
    
    console.log('✅ Rollback completado. Puedes volver a ejecutar la migración.');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await db.destroy();
  }
}

rollback();
