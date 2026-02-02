const express = require('express');
const router = express.Router();

const productController = require('./controllers/productController');
const salesController = require('./controllers/salesController');
const authController = require('./controllers/authController');
const comprasController = require('./controllers/comprasController');
const devolucionesController = require('./controllers/devolucionesController');
const usuariosController = require('./controllers/usuariosController');
const configController = require('./controllers/configController');
const inventoryRoutes = require('./routes/inventoryRoutes');
const { authenticate, authorize } = require('./middleware/auth');

// Auth
router.post('/auth/login', authController.login);

// Rutas de Inventario
router.use('/inventory', inventoryRoutes);

// Productos (admin)
router.get('/products', authenticate, productController.list);
router.post('/products', authenticate, authorize('admin'), productController.create);
router.put('/products/:id', authenticate, authorize('admin'), productController.update);
router.delete('/products/:id', authenticate, authorize('admin'), productController.remove);

// Lotes (admin)
router.post('/products/:id/lots', authenticate, authorize('admin'), productController.addLot);

// Ventas (vendedores y admin)
router.post('/sales', authenticate, authorize('vendedor,admin'), salesController.createSale);
router.get('/sales', authenticate, authorize(['admin', 'vendedor']), salesController.salesReport);
router.get('/sales/:id', authenticate, authorize(['admin', 'vendedor']), salesController.getSaleDetails);

// Compras (admin)
router.post('/compras', authenticate, authorize('admin'), comprasController.crearCompra);
router.get('/compras', authenticate, authorize('admin'), comprasController.listarCompras);
router.get('/compras/:id', authenticate, authorize('admin'), comprasController.obtenerCompra);

// Devoluciones (admin y vendedores)
router.post('/devoluciones', authenticate, authorize(['admin', 'vendedor']), devolucionesController.crearDevolucion);
router.get('/devoluciones', authenticate, authorize(['admin', 'vendedor']), devolucionesController.listarDevoluciones);

// Usuarios (admin)
router.get('/usuarios', authenticate, authorize('admin'), usuariosController.listarUsuarios);
router.post('/usuarios', authenticate, authorize('admin'), usuariosController.crearUsuario);
router.put('/usuarios/:id', authenticate, authorize('admin'), usuariosController.actualizarUsuario);
router.delete('/usuarios/:id', authenticate, authorize('admin'), usuariosController.eliminarUsuario);

// Configuración (admin)
router.get('/configuracion', authenticate, authorize('admin'), configController.getAllConfig);
router.get('/configuracion/:clave', authenticate, authorize('admin'), configController.getConfig);
router.put('/configuracion/:clave', authenticate, authorize('admin'), configController.setConfig);

// Alerts & reports (admin)
router.get('/alerts', authenticate, authorize('admin'), productController.alerts);
router.get('/reports/sales', authenticate, authorize('admin'), salesController.salesReport);

module.exports = router;
