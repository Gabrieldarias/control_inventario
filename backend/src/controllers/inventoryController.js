const inventoryService = require('../services/inventoryService');

// ===== PRODUCTOS =====

async function crearProducto(req, res) {
  try {
    const producto = await inventoryService.crearProducto(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function actualizarProducto(req, res) {
  try {
    console.log('=== ACTUALIZAR PRODUCTO ===');
    console.log('ID:', req.params.id);
    console.log('Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('Usuario:', req.user ? req.user.id : 'N/A');
    
    const producto = await inventoryService.actualizarProducto(req.params.id, {
      ...req.body,
      usuario_id: req.user.id
    });
    
    console.log('Producto actualizado exitosamente:', producto.id);
    res.json(producto);
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    console.error('Stack:', error.stack);
    res.status(400).json({ error: error.message });
  }
}

async function eliminarProducto(req, res) {
  try {
    await inventoryService.eliminarProducto(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function obtenerProducto(req, res) {
  try {
    const producto = await inventoryService.obtenerProducto(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    
    const stockTotal = await inventoryService.obtenerStockTotal(producto.id);
    const lotes = await inventoryService.listarLotes(producto.id);
    const proveedores = await inventoryService.obtenerProveedoresProducto(producto.id);
    const historialPrecios = await inventoryService.obtenerHistorialPrecios(producto.id);
    
    res.json({
      ...producto,
      stock_total: stockTotal,
      lotes,
      proveedores,
      historial_precios: historialPrecios
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarProductos(req, res) {
  try {
    const productos = await inventoryService.listarProductos(req.query);
    
    // Enriquecer con stock total
    const productosConStock = [];
    for (const producto of productos) {
      const stock = await inventoryService.obtenerStockTotal(producto.id);
      productosConStock.push({
        ...producto,
        stock_total: stock
      });
    }
    
    res.json(productosConStock);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ===== CATEGORÍAS =====

async function crearCategoria(req, res) {
  try {
    const { nombre, categoria_padre_id, descripcion } = req.body;
    const categoria = await inventoryService.crearCategoria(nombre, categoria_padre_id, descripcion);
    res.status(201).json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarCategorias(req, res) {
  try {
    const categorias = await inventoryService.listarCategorias();
    res.json(categorias);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ===== LOTES =====

async function crearLote(req, res) {
  try {
    const lote = await inventoryService.crearLote(req.body);
    res.status(201).json(lote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarLotes(req, res) {
  try {
    const lotes = await inventoryService.listarLotes(req.params.producto_id);
    res.json(lotes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function actualizarLote(req, res) {
  try {
    const lote = await inventoryService.actualizarLote(req.params.id, req.body);
    res.json(lote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ===== MOVIMIENTOS =====

async function registrarMovimiento(req, res) {
  try {
    const movimiento = await inventoryService.registrarMovimiento({
      ...req.body,
      usuario_id: req.user.id
    });
    res.status(201).json(movimiento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarMovimientos(req, res) {
  try {
    const movimientos = await inventoryService.listarMovimientos(req.query);
    res.json(movimientos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ===== ALERTAS =====

async function listarAlertas(req, res) {
  try {
    const alertas = await inventoryService.listarAlertas(req.query);
    res.json(alertas);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function resolverAlerta(req, res) {
  try {
    await inventoryService.resolverAlerta(req.params.id);
    res.json({ mensaje: 'Alerta resuelta' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ===== PRECIOS =====

async function actualizarPrecio(req, res) {
  try {
    const { precio_costo, precio_venta } = req.body;
    await inventoryService.actualizarPrecio(req.params.producto_id, precio_costo, precio_venta, req.user.id);
    
    const producto = await inventoryService.obtenerProducto(req.params.producto_id);
    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function obtenerHistorialPrecios(req, res) {
  try {
    const historial = await inventoryService.obtenerHistorialPrecios(req.params.producto_id);
    res.json(historial);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ===== BÚSQUEDA =====

async function buscarProductos(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const productos = await inventoryService.buscarProductos(q);
    res.json(productos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ===== REPORTES =====

async function reporteStockActual(req, res) {
  try {
    const reporte = await inventoryService.reporteStockActual();
    res.json(reporte);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function reporteRotacion(req, res) {
  try {
    const dias = req.query.dias || 30;
    const reporte = await inventoryService.reporteRotacion(parseInt(dias));
    res.json(reporte);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function reporteValorizacion(req, res) {
  try {
    const reporte = await inventoryService.reporteValorizacion();
    res.json(reporte);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ===== PROVEEDORES =====

async function crearProveedor(req, res) {
  try {
    const proveedor = await inventoryService.crearProveedor(req.body);
    res.status(201).json(proveedor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarProveedores(req, res) {
  try {
    const proveedores = await inventoryService.listarProveedores();
    res.json(proveedores);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function asociarProductoProveedor(req, res) {
  try {
    const { producto_id, proveedor_id, precio_compra, cantidad_minima } = req.body;
    const asociacion = await inventoryService.asociarProductoProveedor(producto_id, proveedor_id, precio_compra, cantidad_minima);
    res.status(201).json(asociacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ===== IMPORTACIÓN/EXPORTACIÓN =====

async function importarProductos(req, res) {
  try {
    const { datos } = req.body;
    const resultado = await inventoryService.importarProductos(datos);
    res.json(resultado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function exportarInventario(req, res) {
  try {
    const datos = await inventoryService.exportarInventario();
    
    // Convertir a CSV
    const headers = ['Código', 'Nombre', 'Stock Actual', 'Stock Mínimo', 'Precio Costo', 'Precio Venta'];
    const filas = datos.map(d => [
      d.codigo_interno,
      d.nombre,
      d.stock_actual,
      d.stock_minimo,
      d.precio_costo,
      d.precio_venta
    ]);
    
    let csv = headers.join(',') + '\n';
    filas.forEach(fila => {
      csv += fila.map(v => `"${v}"`).join(',') + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventario.csv');
    res.send(csv);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProducto,
  listarProductos,
  crearCategoria,
  listarCategorias,
  crearLote,
  actualizarLote,
  listarLotes,
  registrarMovimiento,
  listarMovimientos,
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
  importarProductos,
  exportarInventario
};
