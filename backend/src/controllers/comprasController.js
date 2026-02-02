const comprasService = require('../services/comprasService');

async function crearCompra(req, res) {
  try {
    const { proveedor_id, items } = req.body;
    const usuario_id = req.user.id;
    if (!proveedor_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Datos requeridos inválidos' });
    }
    const compra = await comprasService.crearCompra(proveedor_id, items, usuario_id);
    res.status(201).json(compra);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarCompras(req, res) {
  try {
    const compras = await comprasService.listarCompras();
    res.json(compras);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function obtenerCompra(req, res) {
  try {
    const compra = await comprasService.obtenerCompra(req.params.id);
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json(compra);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { crearCompra, listarCompras, obtenerCompra };
