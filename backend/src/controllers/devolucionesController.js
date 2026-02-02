const devolucionesService = require('../services/devolucionesService');

async function crearDevolucion(req, res) {
  try {
    const { tipo, referencia_original, motivo, items } = req.body;
    const usuario_id = req.user.id;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Datos requeridos inválidos' });
    }
    const devolucion = await devolucionesService.crearDevolucion({
      tipo, referencia_original, motivo, items, usuario_id
    });
    res.status(201).json(devolucion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarDevoluciones(req, res) {
  try {
    const devoluciones = await devolucionesService.listarDevoluciones();
    res.json(devoluciones);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { crearDevolucion, listarDevoluciones };
