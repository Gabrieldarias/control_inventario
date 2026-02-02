const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');

// Middleware de autenticación para todas las rutas
router.use(authenticate);

// ===== PRODUCTOS =====
router.post('/productos', authorize(['admin']), inventoryController.crearProducto);
router.get('/productos', inventoryController.listarProductos);

// ===== BÚSQUEDA Y RUTAS ESPECÍFICAS (ANTES de :id) =====
router.get('/productos/buscar/termino', inventoryController.buscarProductos);

// ===== PRECIOS (ANTES de :id genérico) =====
router.put('/productos/:producto_id/precio', authorize(['admin']), inventoryController.actualizarPrecio);
router.get('/productos/:producto_id/historial-precios', inventoryController.obtenerHistorialPrecios);

// ===== PRODUCTOS :ID (DESPUÉS de rutas específicas) =====
router.get('/productos/:id', inventoryController.obtenerProducto);
router.put('/productos/:id', authorize(['admin']), inventoryController.actualizarProducto);
router.delete('/productos/:id', authorize(['admin']), inventoryController.eliminarProducto);

// ===== CATEGORÍAS =====
router.post('/categorias', authorize(['admin']), inventoryController.crearCategoria);
router.get('/categorias', inventoryController.listarCategorias);

// ===== LOTES =====
router.post('/lotes', authorize(['admin']), inventoryController.crearLote);
router.get('/lotes/:producto_id', inventoryController.listarLotes);
router.put('/lotes/:id', authorize(['admin']), inventoryController.actualizarLote);

// ===== MOVIMIENTOS =====
router.post('/movimientos', authorize(['admin']), inventoryController.registrarMovimiento);
router.get('/movimientos', inventoryController.listarMovimientos);

// ===== ALERTAS =====
router.get('/alertas', inventoryController.listarAlertas);
router.put('/alertas/:id/resolver', authorize(['admin']), inventoryController.resolverAlerta);

// ===== REPORTES =====
router.get('/reportes/stock-actual', authorize(['admin']), inventoryController.reporteStockActual);
router.get('/reportes/rotacion', authorize(['admin']), inventoryController.reporteRotacion);
router.get('/reportes/valorizacion', authorize(['admin']), inventoryController.reporteValorizacion);

// ===== PROVEEDORES =====
router.post('/proveedores', authorize(['admin']), inventoryController.crearProveedor);
router.get('/proveedores', inventoryController.listarProveedores);
router.post('/proveedores/asociar', authorize(['admin']), inventoryController.asociarProductoProveedor);

// ===== IMPORTACIÓN/EXPORTACIÓN =====
router.post('/importar', authorize(['admin']), inventoryController.importarProductos);
router.get('/exportar', authorize(['admin']), inventoryController.exportarInventario);

module.exports = router;
