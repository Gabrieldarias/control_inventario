const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const salesRoutes = require('./salesRoutes');
const inventoryRoutes = require('./inventoryRoutes');

// Usar rutas
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/sales', salesRoutes);
router.use('/inventory', inventoryRoutes);

module.exports = router;
