// Script para exportar datos de SQLite a formato SQL PostgreSQL
const sqlite = require('knex')({
  client: 'sqlite3',
  connection: { filename: './tienda_mvp.db' },
  useNullAsDefault: true
});

const fs = require('fs');

async function exportToSQL() {
  try {
    console.log('📦 Exportando base de datos SQLite a SQL PostgreSQL...\n');
    
    let sqlOutput = '-- Exportación de tienda_mvp.db a PostgreSQL\n';
    sqlOutput += '-- Fecha: ' + new Date().toISOString() + '\n\n';
    
    const tables = [
      'users',
      'configuracion',
      'categorias',
      'proveedores',
      'almacenes',
      'products',
      'lots',
      'sales',
      'sales_items',
      'stock_movements',
      'devoluciones',
      'producto_proveedor',
      'precio_historial'
    ];
    
    for (const table of tables) {
      try {
        const hasTable = await sqlite.schema.hasTable(table);
        if (!hasTable) {
          console.log(`   ⚠️ Tabla ${table} no existe, saltando...`);
          continue;
        }
        
        const data = await sqlite(table).select('*');
        
        if (data.length > 0) {
          sqlOutput += `\n-- Datos de tabla: ${table}\n`;
          
          for (const row of data) {
            const columns = Object.keys(row);
            const values = columns.map(col => {
              const val = row[col];
              if (val === null) return 'NULL';
              if (typeof val === 'number') return val;
              if (typeof val === 'boolean') return val ? 'true' : 'false';
              return `'${String(val).replace(/'/g, "''")}'`;
            });
            
            sqlOutput += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
          }
          
          console.log(`   ✅ ${table}: ${data.length} registros exportados`);
        } else {
          console.log(`   ℹ️ ${table}: sin datos`);
        }
      } catch (err) {
        console.error(`   ❌ Error exportando ${table}:`, err.message);
      }
    }
    
    // Guardar archivo SQL
    const outputPath = './export-supabase.sql';
    fs.writeFileSync(outputPath, sqlOutput);
    
    console.log(`\n✅ Exportación completada: ${outputPath}`);
    console.log('\n📋 Instrucciones:');
    console.log('1. Ve a Supabase → SQL Editor');
    console.log('2. Abre el archivo export-supabase.sql');
    console.log('3. Copia y pega el contenido en el SQL Editor');
    console.log('4. Ejecuta el script\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sqlite.destroy();
  }
}

exportToSQL();
