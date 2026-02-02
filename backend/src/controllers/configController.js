const configService = require('../services/configService');

async function getAllConfig(req, res) {
  try {
    const config = await configService.getAllConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getConfig(req, res) {
  try {
    const { clave } = req.params;
    const valor = await configService.getConfig(clave);
    if (valor === null) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    res.json({ clave, valor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function setConfig(req, res) {
  try {
    const { clave } = req.params;
    const { valor } = req.body;
    const usuarioId = req.user.id;
    
    const result = await configService.setConfig(clave, valor, usuarioId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  getAllConfig,
  getConfig,
  setConfig
};
