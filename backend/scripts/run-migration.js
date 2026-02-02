// Script para ejecutar la migración de base de datos
const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../tienda_mvp.db')
  },
  useNullAsDefault: true
});

async function runMigration() {
  try {
    console.log('🔄 Iniciando migración...\n');
    
    // 1. Crear tabla configuracion
    console.log('📋 Paso 1: Creando tabla configuracion...');
    await db.schema.createTable('configuracion', (table) => {
      table.increments('id').primary();
      table.string('clave', 100).unique().notNullable();
      table.text('valor');
      table.text('descripcion');
      table.string('tipo', 50).defaultTo('string');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.integer('updated_by').references('id').inTable('users');
    });
    console.log('✅ Tabla configuracion creada\n');
    
    // 2. Insertar configuración por defecto
    console.log('📋 Paso 2: Insertando configuración por defecto...');
    await db('configuracion').insert({
      clave: 'porcentaje_ganancia',
      valor: '30',
      descripcion: 'Porcentaje de ganancia aplicado sobre el precio de compra',
      tipo: 'number'
    });
    console.log('✅ Configuración por defecto insertada\n');
    
    // 3. Recrear tabla lots sin fecha_vencimiento
    console.log('📋 Paso 3: Reconstruyendo tabla lots...');
    
    // 3.1 Obtener todos los datos actuales
    const lotsData = await db('lots').select('*');
    console.log(`   → ${lotsData.length} lotes encontrados para migrar`);
    
    // 3.2 Renombrar tabla actual
    await db.schema.renameTable('lots', 'lots_old');
    console.log('   → Tabla original renombrada a lots_old');
    
    // 3.3 Crear nueva tabla lots sin fecha_vencimiento
    await db.schema.createTable('lots', (table) => {
      table.increments('id').primary();
      table.integer('producto_id').notNullable()
        .references('id').inTable('products').onDelete('CASCADE');
      table.string('numero_referencia', 100);
      table.integer('cantidad_inicial').notNullable();
      table.integer('cantidad_actual').notNullable();
      table.datetime('fecha_ingreso').defaultTo(db.fn.now());
      table.decimal('costo_unitario', 12, 2);
      table.integer('proveedor_id').references('id').inTable('proveedores');
      table.integer('almacen_id').references('id').inTable('almacenes');
      table.string('estado', 20).defaultTo('activo');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('   → Nueva tabla lots creada sin fecha_vencimiento');
    
    // 3.4 Copiar datos (sin la columna fecha_vencimiento)
    if (lotsData.length > 0) {
      for (const lot of lotsData) {
        const { fecha_vencimiento, ...lotSinVencimiento } = lot;
        await db('lots').insert(lotSinVencimiento);
      }
      console.log(`   → ${lotsData.length} lotes migrados exitosamente`);
    }
    
    // 3.5 Eliminar tabla antigua
    await db.schema.dropTable('lots_old');
    console.log('   → Tabla antigua eliminada');
    console.log('✅ Tabla lots reconstruida correctamente\n');
    
    // 4. Verificación final
    console.log('📋 Paso 4: Verificando migración...');
    const hasConfigTable = await db.schema.hasTable('configuracion');
    const configCount = await db('configuracion').count('* as count').first();
    const lotsCount = await db('lots').count('* as count').first();
    const lotsInfo = await db('lots').columnInfo();
    
    console.log('   → Tabla configuracion existe:', hasConfigTable ? '✅' : '❌');
    console.log('   → Registros en configuracion:', configCount.count);
    console.log('   → Registros en lots:', lotsCount.count);
    console.log('   → Columna fecha_vencimiento eliminada:', !('fecha_vencimiento' in lotsInfo) ? '✅' : '❌');
    
    console.log('\n✅ ¡Migración completada exitosamente!');
    
  } catch (err) {
    console.error('\n❌ Error durante la migración:', err.message);
    console.error('\nStack:', err.stack);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigration();
