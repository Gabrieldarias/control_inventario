// Script para migrar de SQLite a PostgreSQL (Supabase)
const sqlite = require('knex')({
  client: 'sqlite3',
  connection: { filename: './tienda_mvp.db' },
  useNullAsDefault: true
});

const postgres = require('knex')({
  client: 'pg',
  connection: {
    host: 'db.rsujclfftqfbudbirsxj.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'laquizanda.',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    // Forzar IPv4
    lookup: 'ipv4'
  },
  pool: { min: 0, max: 10 },
  acquireConnectionTimeout: 30000
});

async function migrate() {
  try {
    console.log('🚀 Iniciando migración de SQLite a Supabase...\n');
    
    // 1. Crear esquema en PostgreSQL
    console.log('📋 Paso 1: Creando esquema en PostgreSQL...');
    await createSchema();
    console.log('✅ Esquema creado\n');
    
    // 2. Migrar datos
    console.log('📋 Paso 2: Migrando datos...');
    await migrateData();
    console.log('✅ Datos migrados\n');
    
    console.log('🎉 ¡Migración completada exitosamente!');
    
  } catch (err) {
    console.error('❌ Error durante la migración:', err.message);
    console.error(err.stack);
  } finally {
    await sqlite.destroy();
    await postgres.destroy();
  }
}

async function createSchema() {
  // Usuarios
  await postgres.schema.dropTableIfExists('stock_movements');
  await postgres.schema.dropTableIfExists('sales_items');
  await postgres.schema.dropTableIfExists('sales');
  await postgres.schema.dropTableIfExists('devoluciones');
  await postgres.schema.dropTableIfExists('precio_historial');
  await postgres.schema.dropTableIfExists('lots');
  await postgres.schema.dropTableIfExists('producto_proveedor');
  await postgres.schema.dropTableIfExists('products');
  await postgres.schema.dropTableIfExists('categorias');
  await postgres.schema.dropTableIfExists('proveedores');
  await postgres.schema.dropTableIfExists('almacenes');
  await postgres.schema.dropTableIfExists('configuracion');
  await postgres.schema.dropTableIfExists('users');
  
  // Users
  await postgres.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('nombre', 100).notNullable();
    table.string('email', 100).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('role', 20).notNullable();
    table.boolean('estado').defaultTo(true);
    table.timestamp('created_at').defaultTo(postgres.fn.now());
  });
  
  // Configuracion
  await postgres.schema.createTable('configuracion', (table) => {
    table.increments('id').primary();
    table.string('clave', 100).unique().notNullable();
    table.text('valor');
    table.text('descripcion');
    table.string('tipo', 50).defaultTo('string');
    table.timestamp('created_at').defaultTo(postgres.fn.now());
    table.integer('updated_by').references('id').inTable('users');
  });
  
  // Categorias
  await postgres.schema.createTable('categorias', (table) => {
    table.increments('id').primary();
    table.string('nombre', 100).notNullable();
    table.text('descripcion');
    table.boolean('estado').defaultTo(true);
    table.timestamp('created_at').defaultTo(postgres.fn.now());
  });
  
  // Proveedores
  await postgres.schema.createTable('proveedores', (table) => {
    table.increments('id').primary();
    table.string('nombre', 200).notNullable();
    table.string('contacto', 100);
    table.string('telefono', 20);
    table.string('email', 100);
    table.text('direccion');
    table.boolean('estado').defaultTo(true);
    table.timestamp('created_at').defaultTo(postgres.fn.now());
  });
  
  // Almacenes
  await postgres.schema.createTable('almacenes', (table) => {
    table.increments('id').primary();
    table.string('nombre', 100).notNullable();
    table.text('ubicacion');
    table.boolean('estado').defaultTo(true);
    table.timestamp('created_at').defaultTo(postgres.fn.now());
  });
  
  // Products
  await postgres.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('nombre', 200).notNullable();
    table.string('codigo_interno', 50).unique();
    table.string('codigo_barras', 50);
    table.integer('categoria_id').references('id').inTable('categorias');
    table.text('descripcion');
    table.decimal('precio_costo', 12, 2);
    table.decimal('precio_venta', 12, 2).notNullable();
    table.integer('stock_actual').defaultTo(0);
    table.integer('stock_minimo').defaultTo(0);
    table.boolean('requiere_lote').defaultTo(true);
    table.string('unidad_medida', 20).defaultTo('ud');
    table.boolean('estado').defaultTo(true);
    table.timestamp('created_at').defaultTo(postgres.fn.now());
    table.timestamp('updated_at').defaultTo(postgres.fn.now());
  });
  
  // Lots
  await postgres.schema.createTable('lots', (table) => {
    table.increments('id').primary();
    table.integer('producto_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.string('numero_referencia', 100);
    table.integer('cantidad_inicial').notNullable();
    table.integer('cantidad_actual').notNullable();
    table.timestamp('fecha_ingreso').defaultTo(postgres.fn.now());
    table.decimal('costo_unitario', 12, 2);
    table.integer('proveedor_id').references('id').inTable('proveedores');
    table.integer('almacen_id').references('id').inTable('almacenes');
    table.string('estado', 20).defaultTo('activo');
    table.timestamp('created_at').defaultTo(postgres.fn.now());
  });
  
  // Sales
  await postgres.schema.createTable('sales', (table) => {
    table.increments('id').primary();
    table.integer('usuario_id').notNullable().references('id').inTable('users');
    table.decimal('total', 12, 2).notNullable();
    table.string('metodo_pago', 50);
    table.timestamp('fecha').defaultTo(postgres.fn.now());
    table.text('observaciones');
  });
  
  // Sales items
  await postgres.schema.createTable('sales_items', (table) => {
    table.increments('id').primary();
    table.integer('sale_id').notNullable().references('id').inTable('sales').onDelete('CASCADE');
    table.integer('producto_id').notNullable().references('id').inTable('products');
    table.integer('cantidad').notNullable();
    table.decimal('precio_unitario', 12, 2).notNullable();
    table.decimal('subtotal', 12, 2).notNullable();
  });
  
  // Stock movements
  await postgres.schema.createTable('stock_movements', (table) => {
    table.increments('id').primary();
    table.integer('producto_id').notNullable().references('id').inTable('products');
    table.integer('lote_id').references('id').inTable('lots');
    table.integer('almacen_id').references('id').inTable('almacenes');
    table.string('tipo', 30).notNullable();
    table.integer('cantidad').notNullable();
    table.integer('cantidad_anterior');
    table.integer('cantidad_nueva');
    table.integer('usuario_id').references('id').inTable('users');
    table.text('motivo');
    table.string('referencia', 200);
    table.string('documento_adjunto', 255);
    table.timestamp('fecha').defaultTo(postgres.fn.now());
  });
  
  // Devoluciones
  await postgres.schema.createTable('devoluciones', (table) => {
    table.increments('id').primary();
    table.integer('venta_id').references('id').inTable('sales');
    table.integer('producto_id').notNullable().references('id').inTable('products');
    table.integer('cantidad').notNullable();
    table.text('motivo');
    table.integer('usuario_id').notNullable().references('id').inTable('users');
    table.timestamp('fecha').defaultTo(postgres.fn.now());
  });
  
  // Producto-Proveedor
  await postgres.schema.createTable('producto_proveedor', (table) => {
    table.increments('id').primary();
    table.integer('producto_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.integer('proveedor_id').notNullable().references('id').inTable('proveedores').onDelete('CASCADE');
    table.decimal('precio_compra', 12, 2);
    table.integer('cantidad_minima').defaultTo(1);
    table.integer('plazo_entrega');
    table.timestamp('created_at').defaultTo(postgres.fn.now());
  });
  
  // Precio historial
  await postgres.schema.createTable('precio_historial', (table) => {
    table.increments('id').primary();
    table.integer('producto_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    table.decimal('precio_costo_anterior', 12, 2);
    table.decimal('precio_costo_nuevo', 12, 2);
    table.decimal('precio_venta_anterior', 12, 2);
    table.decimal('precio_venta_nuevo', 12, 2);
    table.integer('usuario_id').references('id').inTable('users');
    table.timestamp('fecha').defaultTo(postgres.fn.now());
  });
}

async function migrateData() {
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
        console.log(`   ⚠️ Tabla ${table} no existe en SQLite, saltando...`);
        continue;
      }
      
      const data = await sqlite(table).select('*');
      if (data.length > 0) {
        await postgres(table).insert(data);
        console.log(`   ✅ ${table}: ${data.length} registros migrados`);
      } else {
        console.log(`   ℹ️ ${table}: sin datos`);
      }
    } catch (err) {
      console.error(`   ❌ Error migrando ${table}:`, err.message);
    }
  }
}

migrate();
