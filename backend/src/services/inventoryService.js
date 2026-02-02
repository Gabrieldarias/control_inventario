const knex = require('../db/knex');

// ===== GESTIÓN DE PRODUCTOS =====

async function crearProducto(datos) {
  const { nombre, codigo_interno, categoria_id, descripcion, precio_costo, precio_venta, stock_minimo, stock_maximo, unidad_medida } = datos;
  
  const [id] = await knex('products').insert({
    nombre,
    codigo_interno,
    categoria_id,
    descripcion,
    precio_costo: precio_costo || 0,
    precio_venta: precio_venta || 0,
    stock_minimo: stock_minimo || 5,
    stock_maximo: stock_maximo || null,
    unidad_medida: unidad_medida || 'ud',
    estado: true
  });
  
  return knex('products').where('id', id).first();
}

async function actualizarProducto(id, datos) {
  const productoAnterior = await knex('products').where('id', id).first();
  
  if (!productoAnterior) {
    throw new Error('Producto no encontrado');
  }
  
  // Limpiar datos para actualización
  const datosActualizacion = {};
  
  // Campos que siempre se pueden actualizar
  if (datos.nombre !== undefined) datosActualizacion.nombre = datos.nombre;
  if (datos.codigo_interno !== undefined) datosActualizacion.codigo_interno = datos.codigo_interno;
  if (datos.descripcion !== undefined) datosActualizacion.descripcion = datos.descripcion;
  if (datos.unidad_medida !== undefined) datosActualizacion.unidad_medida = datos.unidad_medida;
  
  // Campos numéricos
  if (datos.precio_costo !== undefined) datosActualizacion.precio_costo = parseFloat(datos.precio_costo) || 0;
  if (datos.precio_venta !== undefined) datosActualizacion.precio_venta = parseFloat(datos.precio_venta) || 0;
  if (datos.stock_minimo !== undefined) datosActualizacion.stock_minimo = parseInt(datos.stock_minimo) || 5;
  
  // Campos que pueden ser null
  if (datos.categoria_id !== undefined) {
    datosActualizacion.categoria_id = datos.categoria_id === '' || datos.categoria_id === null ? null : parseInt(datos.categoria_id);
  }
  if (datos.stock_maximo !== undefined) {
    datosActualizacion.stock_maximo = datos.stock_maximo === '' || datos.stock_maximo === null ? null : parseInt(datos.stock_maximo);
  }
  
  // Registrar cambio de precios si corresponde
  if ((datosActualizacion.precio_costo && datosActualizacion.precio_costo !== productoAnterior.precio_costo) || 
      (datosActualizacion.precio_venta && datosActualizacion.precio_venta !== productoAnterior.precio_venta)) {
    await knex('precio_historial').insert({
      producto_id: id,
      precio_costo_anterior: productoAnterior.precio_costo,
      precio_costo_nuevo: datosActualizacion.precio_costo || productoAnterior.precio_costo,
      precio_venta_anterior: productoAnterior.precio_venta,
      precio_venta_nuevo: datosActualizacion.precio_venta || productoAnterior.precio_venta,
      usuario_id: datos.usuario_id || null,
      fecha: new Date()
    });
  }
  
  // Actualizar producto
  datosActualizacion.updated_at = new Date();
  
  await knex('products').where('id', id).update(datosActualizacion);
  
  return knex('products').where('id', id).first();
}

async function eliminarProducto(id) {
  // Soft delete
  await knex('products').where('id', id).update({ estado: false });
  return true;
}

async function obtenerProducto(id) {
  return knex('products').where('id', id).first();
}

async function listarProductos(filtros = {}) {
  let query = knex('products').select('*');
  
  if (filtros.categoria_id) query = query.where('categoria_id', filtros.categoria_id);
  if (filtros.estado !== undefined) {
    // SQLite guarda booleanos como 0/1, convertir explícitamente
    const estadoValor = filtros.estado ? 1 : 0;
    query = query.where('estado', estadoValor);
  }
  if (filtros.nombre) query = query.whereLike('nombre', `%${filtros.nombre}%`);
  if (filtros.codigo) query = query.whereLike('codigo_interno', `%${filtros.codigo}%`);
  if (filtros.solo_stock_bajo) {
    query = query.whereRaw('(SELECT SUM(cantidad_actual) FROM lots WHERE producto_id = products.id) <= stock_minimo');
  }
  
  return query.orderBy('nombre');
}

// ===== GESTIÓN DE CATEGORÍAS =====

async function crearCategoria(nombre, categoria_padre_id = null, descripcion = '') {
  const [id] = await knex('categorias').insert({
    nombre,
    categoria_padre_id,
    descripcion,
    estado: true
  });
  return knex('categorias').where('id', id).first();
}

async function actualizarCategoria(id, nombre, categoria_padre_id, descripcion) {
  await knex('categorias').where('id', id).update({
    nombre,
    categoria_padre_id,
    descripcion,
    updated_at: new Date()
  });
  return knex('categorias').where('id', id).first();
}

async function eliminarCategoria(id) {
  const tieneProductos = await knex('products').where('categoria_id', id).first();
  if (tieneProductos) throw new Error('No se puede eliminar categoría con productos asociados');
  
  await knex('categorias').where('id', id).update({ estado: false });
  return true;
}

async function listarCategorias() {
  return knex('categorias').where('estado', true).orderBy('nombre');
}

// ===== GESTIÓN DE LOTES =====

async function crearLote(datos) {
  const { producto_id, numero_referencia, cantidad, costo_unitario, proveedor_id, almacen_id } = datos;
  
  // Registrar movimiento de entrada
  const [loteId] = await knex('lots').insert({
    producto_id,
    numero_referencia,
    cantidad_inicial: cantidad,
    cantidad_actual: cantidad,
    costo_unitario,
    proveedor_id,
    almacen_id: almacen_id || 1,
    estado: 'activo'
  });
  
  // Registrar movimiento
  await knex('stock_movements').insert({
    producto_id,
    lote_id: loteId,
    almacen_id: almacen_id || 1,
    tipo: 'entrada',
    cantidad,
    cantidad_anterior: 0,
    cantidad_nueva: cantidad,
    motivo: `Entrada lote ${numero_referencia}`
  });
  
  return knex('lots').where('id', loteId).first();
}

async function listarLotes(producto_id) {
  return knex('lots')
    .where('producto_id', producto_id)
    .where('estado', 'activo')
    .orderBy('fecha_ingreso', 'asc');
}

async function actualizarLote(id, datos) {
  const lote = await knex('lots').where('id', id).first();
  if (!lote) throw new Error('Lote no encontrado');
  
  const cambios = {};
  if (datos.numero_referencia !== undefined) cambios.numero_referencia = datos.numero_referencia;
  if (datos.costo_unitario !== undefined) cambios.costo_unitario = datos.costo_unitario;
  if (datos.cantidad !== undefined) {
    const diferenciaStock = datos.cantidad - lote.cantidad_actual;
    cambios.cantidad_actual = datos.cantidad;
    
    // Registrar movimiento de ajuste
    if (diferenciaStock !== 0) {
      await knex('stock_movements').insert({
        producto_id: lote.producto_id,
        lote_id: id,
        tipo: diferenciaStock > 0 ? 'ajuste_entrada' : 'ajuste_salida',
        cantidad: Math.abs(diferenciaStock),
        cantidad_anterior: lote.cantidad_actual,
        cantidad_nueva: datos.cantidad,
        motivo: datos.motivo || 'Ajuste manual de lote'
      });
    }
  }
  
  await knex('lots').where('id', id).update(cambios);
  return knex('lots').where('id', id).first();
}

async function obtenerStockTotal(producto_id) {
  const resultado = await knex('lots')
    .where('producto_id', producto_id)
    .where('estado', 'activo')
    .sum('cantidad_actual as total')
    .first();
  return resultado.total || 0;
}

// ===== MOVIMIENTOS DE INVENTARIO =====

async function registrarMovimiento(datos) {
  const { producto_id, lote_id, almacen_id, tipo, cantidad, usuario_id, motivo, referencia } = datos;
  
  const stockAnterior = await obtenerStockTotal(producto_id);
  const stockNuevo = stockAnterior + (tipo === 'salida' ? -cantidad : cantidad);
  
  const [id] = await knex('stock_movements').insert({
    producto_id,
    lote_id,
    almacen_id: almacen_id || 1,
    tipo,
    cantidad,
    cantidad_anterior: stockAnterior,
    cantidad_nueva: stockNuevo,
    usuario_id,
    motivo,
    referencia,
    fecha: new Date()
  });
  
  // Verificar alertas
  await verificarAlertas(producto_id);
  
  return knex('stock_movements').where('id', id).first();
}

async function listarMovimientos(filtros = {}) {
  let query = knex('stock_movements');
  
  if (filtros.producto_id) query = query.where('producto_id', filtros.producto_id);
  if (filtros.tipo) query = query.where('tipo', filtros.tipo);
  if (filtros.fecha_desde) query = query.whereDate('fecha', '>=', filtros.fecha_desde);
  if (filtros.fecha_hasta) query = query.whereDate('fecha', '<=', filtros.fecha_hasta);
  
  return query.orderBy('fecha', 'desc');
}

// ===== ALERTAS =====

async function verificarAlertas(producto_id) {
  const producto = await knex('products').where('id', producto_id).first();
  const stockTotal = await obtenerStockTotal(producto_id);
  
  // Limpiar alertas previas del mismo tipo
  await knex('alertas')
    .where('producto_id', producto_id)
    .whereIn('tipo', ['stock_bajo', 'agotado'])
    .where('estado', 'pendiente')
    .del();
  
  // Stock bajo
  if (stockTotal <= producto.stock_minimo && stockTotal > 0) {
    await knex('alertas').insert({
      producto_id,
      tipo: 'stock_bajo',
      descripcion: `Stock bajo: ${stockTotal} unidades disponibles`,
      severidad: 'media',
      cantidad_actual: stockTotal,
      valor_referencia: producto.stock_minimo,
      estado: 'pendiente'
    });
  }
  
  // Agotado
  if (stockTotal === 0) {
    await knex('alertas').insert({
      producto_id,
      tipo: 'agotado',
      descripcion: 'Producto agotado',
      severidad: 'alta',
      cantidad_actual: 0,
      valor_referencia: 0,
      estado: 'pendiente'
    });
  }
}

async function verificarVencimientos() {
  // Función deshabilitada - fecha de vencimiento eliminada del sistema
  return;
}

async function listarAlertas(filtros = {}) {
  let query = knex('alertas');
  
  if (filtros.estado) query = query.where('estado', filtros.estado);
  if (filtros.severidad) query = query.where('severidad', filtros.severidad);
  if (filtros.solo_pendientes) query = query.where('estado', 'pendiente');
  
  return query.orderBy('severidad', 'desc').orderBy('fecha_creacion', 'desc');
}

async function resolverAlerta(id) {
  await knex('alertas').where('id', id).update({
    estado: 'resuelto',
    fecha_resolucion: new Date()
  });
}

// ===== GESTIÓN DE PRECIOS =====

async function actualizarPrecio(producto_id, precio_costo, precio_venta, usuario_id) {
  const producto = await knex('products').where('id', producto_id).first();
  
  if (precio_costo === undefined) precio_costo = producto.precio_costo;
  if (precio_venta === undefined) precio_venta = producto.precio_venta;
  
  // Registrar en historial
  await knex('precio_historial').insert({
    producto_id,
    precio_costo_anterior: producto.precio_costo,
    precio_costo_nuevo: precio_costo,
    precio_venta_anterior: producto.precio_venta,
    precio_venta_nuevo: precio_venta,
    usuario_id,
    fecha: new Date()
  });
  
  // Actualizar producto
  await knex('products').where('id', producto_id).update({
    precio_costo,
    precio_venta,
    updated_at: new Date()
  });
}

async function obtenerHistorialPrecios(producto_id) {
  return knex('precio_historial')
    .where('producto_id', producto_id)
    .orderBy('fecha', 'desc');
}

// ===== BÚSQUEDA Y FILTRADO =====

async function buscarProductos(termino) {
  return knex('products')
    .where('estado', true)
    .where(function() {
      this.whereLike('nombre', `%${termino}%`)
        .orWhereLike('codigo_interno', `%${termino}%`);
    })
    .limit(20);
}

// ===== REPORTES =====

async function reporteStockActual() {
  const productos = await knex('products')
    .where('estado', true)
    .select('*');
  
  const reporte = [];
  for (const producto of productos) {
    const stockTotal = await obtenerStockTotal(producto.id);
    const margen = producto.precio_costo > 0 
      ? ((producto.precio_venta - producto.precio_costo) / producto.precio_costo * 100).toFixed(2)
      : 0;
    
    reporte.push({
      id: producto.id,
      codigo: producto.codigo_interno,
      nombre: producto.nombre,
      stock_total: stockTotal,
      stock_minimo: producto.stock_minimo,
      precio_costo: producto.precio_costo,
      precio_venta: producto.precio_venta,
      margen_porcentaje: margen,
      valor_total_costo: (stockTotal * producto.precio_costo).toFixed(2),
      alerta: stockTotal <= producto.stock_minimo ? 'BAJO' : 'OK'
    });
  }
  
  return reporte;
}

async function reporteRotacion(dias = 30) {
  const fechaLimite = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
  
  // Obtener ventas desde sale_items uniendo con sales para obtener la fecha
  const ventasPorProducto = await knex('sale_items')
    .join('sales', 'sale_items.sale_id', 'sales.id')
    .select('sale_items.producto_id')
    .sum('sale_items.cantidad as total_vendido')
    .where('sales.fecha', '>=', fechaLimite)
    .groupBy('sale_items.producto_id')
    .orderBy('total_vendido', 'desc');
  
  const reporte = [];
  for (const venta of ventasPorProducto) {
    const producto = await knex('products').where('id', venta.producto_id).first();
    if (producto) {
      reporte.push({
        id: producto.id,
        nombre: producto.nombre,
        vendido_ultimos_dias: venta.total_vendido,
        velocidad_rotacion: (venta.total_vendido / dias).toFixed(2),
        dias: dias
      });
    }
  }
  
  return reporte;
}

async function reporteValorizacion() {
  const lotes = await knex('lots')
    .where('cantidad_actual', '>', 0)
    .select('*');
  
  let valorTotal = 0;
  const detalles = [];
  
  for (const lote of lotes) {
    const valor = lote.cantidad_actual * (lote.costo_unitario || 0);
    valorTotal += valor;
    
    const producto = await knex('products').where('id', lote.producto_id).first();
    if (producto) {
      detalles.push({
        producto: producto.nombre,
        lote_id: lote.id,
        cantidad: lote.cantidad_actual,
        costo_unitario: lote.costo_unitario,
        valor_total: valor.toFixed(2),
        fecha_vencimiento: lote.fecha_vencimiento
      });
    }
  }
  
  return {
    valor_total_inventario: valorTotal.toFixed(2),
    cantidad_lotes: lotes.length,
    detalles
  };
}

// ===== GESTIÓN DE PROVEEDORES =====

async function crearProveedor(datos) {
  const [id] = await knex('proveedores').insert({
    nombre: datos.nombre,
    contacto: datos.contacto,
    email: datos.email,
    telefono: datos.telefono,
    pais: datos.pais,
    condiciones_pago: datos.condiciones_pago,
    lead_time_dias: datos.lead_time_dias || 0,
    estado: true
  });
  
  return knex('proveedores').where('id', id).first();
}

async function listarProveedores() {
  return knex('proveedores').where('estado', true).orderBy('nombre');
}

async function asociarProductoProveedor(producto_id, proveedor_id, precio_compra, cantidad_minima) {
  const [id] = await knex('producto_proveedor').insert({
    producto_id,
    proveedor_id,
    precio_compra,
    cantidad_minima: cantidad_minima || 1
  });
  
  return knex('producto_proveedor').where('id', id).first();
}

async function obtenerProveedoresProducto(producto_id) {
  return knex('producto_proveedor')
    .where('producto_id', producto_id)
    .join('proveedores', 'producto_proveedor.proveedor_id', 'proveedores.id')
    .select('proveedores.*', 'producto_proveedor.precio_compra', 'producto_proveedor.cantidad_minima');
}

// ===== IMPORTACIÓN Y EXPORTACIÓN =====

async function importarProductos(datos) {
  const resultados = { exitosos: 0, errores: [] };
  
  for (const fila of datos) {
    try {
      const codigoExistente = await knex('products').where('codigo_interno', fila.codigo_interno).first();
      if (codigoExistente) {
        resultados.errores.push(`Código ${fila.codigo_interno} ya existe`);
        continue;
      }
      
      await crearProducto({
        nombre: fila.nombre,
        codigo_interno: fila.codigo_interno,
        categoria_id: fila.categoria_id,
        descripcion: fila.descripcion,
        precio_costo: fila.precio_costo,
        precio_venta: fila.precio_venta,
        stock_minimo: fila.stock_minimo,
        stock_maximo: fila.stock_maximo
      });
      
      resultados.exitosos++;
    } catch (error) {
      resultados.errores.push(`Error en ${fila.nombre}: ${error.message}`);
    }
  }
  
  return resultados;
}

async function exportarInventario() {
  const productos = await knex('products').where('estado', true);
  
  const datos = [];
  for (const producto of productos) {
    const stockTotal = await obtenerStockTotal(producto.id);
    datos.push({
      codigo_interno: producto.codigo_interno,
      nombre: producto.nombre,
      stock_actual: stockTotal,
      stock_minimo: producto.stock_minimo,
      precio_costo: producto.precio_costo,
      precio_venta: producto.precio_venta
    });
  }
  
  return datos;
}

module.exports = {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProducto,
  listarProductos,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  listarCategorias,
  crearLote,
  actualizarLote,
  listarLotes,
  obtenerStockTotal,
  registrarMovimiento,
  listarMovimientos,
  verificarAlertas,
  verificarVencimientos,
  listarAlertas,
  resolverAlerta,
  actualizarPrecio,
  obtenerHistorialPrecios,
  buscarProductos,
  reporteStockActual,
  reporteRotacion,
  reporteValorizacion,
  crearProveedor,
  listarProveedores,
  asociarProductoProveedor,
  obtenerProveedoresProducto,
  importarProductos,
  exportarInventario
};
