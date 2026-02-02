const db = require('./knex');
const bcrypt = require('bcrypt');

async function run() {
  try {
    console.log('🌱 Insertando datos de semilla...');
    
    // Verificar si ya hay usuarios
    const existentes = await db('users').count('* as count').first();
    if (existentes.count > 0) {
      console.log('⚠️ La base de datos ya tiene datos. Saltando seeds.');
      return;
    }

    // Usuarios
    const hashAdmin = await bcrypt.hash('adminpass', 10);
    const hashVend = await bcrypt.hash('vendedorpass', 10);
    
    await db('users').insert([
      { 
        nombre: 'Admin', 
        email: 'admin@example.com', 
        password_hash: hashAdmin, 
        role: 'admin',
        estado: true
      },
      { 
        nombre: 'Vendedor', 
        email: 'vendedor@example.com', 
        password_hash: hashVend, 
        role: 'vendedor',
        estado: true
      }
    ]);
    console.log('✅ Usuarios creados');

    // Categorías
    await db('categorias').insert([
      { nombre: 'Electrónica', descripcion: 'Productos electrónicos', estado: true },
      { nombre: 'Lubricantes', descripcion: 'Aceites y lubricantes', estado: true },
      { nombre: 'Filtros', descripcion: 'Filtros varios', estado: true }
    ]);
    console.log('✅ Categorías creadas');

    // Productos
    await db('products').insert([
      { 
        nombre: 'Laptop HP', 
        codigo_interno: 'LAPTOP001', 
        categoria_id: 1,
        descripcion: 'Laptop HP 15.6 pulgadas',
        precio_costo: 400,
        precio_venta: 599,
        stock_minimo: 5, 
        stock_maximo: 20,
        unidad_medida: 'ud',
        estado: true 
      },
      { 
        nombre: 'Aceite Motor 1L', 
        codigo_interno: 'AM001', 
        categoria_id: 2,
        descripcion: 'Aceite sintético premium',
        precio_costo: 8,
        precio_venta: 12,
        stock_minimo: 3,
        stock_maximo: 50,
        unidad_medida: 'litro',
        estado: true 
      },
      { 
        nombre: 'Filtro de Aire', 
        codigo_interno: 'FA001', 
        categoria_id: 3,
        descripcion: 'Filtro universal',
        precio_costo: 3,
        precio_venta: 4.5,
        stock_minimo: 5,
        stock_maximo: 30,
        unidad_medida: 'ud',
        estado: true 
      }
    ]);
    console.log('✅ Productos creados');

    // Lotes
    const fechaFutura = new Date();
    fechaFutura.setMonth(fechaFutura.getMonth() + 6);
    const fechaStr = fechaFutura.toISOString().split('T')[0];

    await db('lots').insert([
      { 
        producto_id: 1, 
        numero_referencia: 'LOTE-001',
        cantidad_inicial: 10,
        cantidad_actual: 10,
        costo_unitario: 400,
        fecha_vencimiento: null,
        estado: 'activo'
      },
      { 
        producto_id: 2, 
        numero_referencia: 'LOTE-002',
        cantidad_inicial: 20,
        cantidad_actual: 20,
        costo_unitario: 8,
        fecha_vencimiento: fechaStr,
        estado: 'activo'
      },
      { 
        producto_id: 3, 
        numero_referencia: 'LOTE-003',
        cantidad_inicial: 15,
        cantidad_actual: 15,
        costo_unitario: 3,
        fecha_vencimiento: fechaStr,
        estado: 'activo'
      }
    ]);
    console.log('✅ Lotes creados');

    // Movimientos
    await db('stock_movements').insert([
      { producto_id: 1, lote_id: 1, tipo: 'ingreso', cantidad: 10, referencia: 'SEED' },
      { producto_id: 2, lote_id: 2, tipo: 'ingreso', cantidad: 20, referencia: 'SEED' },
      { producto_id: 3, lote_id: 3, tipo: 'ingreso', cantidad: 15, referencia: 'SEED' }
    ]);
    console.log('✅ Movimientos creados');

    console.log('✅ Seeds completados exitosamente');
    console.log('📧 Login: admin@example.com / adminpass');
    console.log('📧 Login: vendedor@example.com / vendedorpass');
    
  } catch (err) {
    console.error('❌ Error aplicando seeds:', err.message);
    throw err;
  }
}

module.exports = { run };
