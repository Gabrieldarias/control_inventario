const usuariosService = require('../services/usuariosService');

async function listarUsuarios(req, res) {
  try {
    const usuarios = await usuariosService.listarUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function crearUsuario(req, res) {
  try {
    const { nombre, email, password, role } = req.body;
    if (!nombre || !email || !password || !role) {
      return res.status(400).json({ error: 'Campos requeridos' });
    }
    const usuario = await usuariosService.crearUsuario({ nombre, email, password, role });
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function actualizarUsuario(req, res) {
  try {
    const { nombre, email, password, role } = req.body;
    const usuario = await usuariosService.actualizarUsuario(req.params.id, { nombre, email, password, role });
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminarUsuario(req, res) {
  try {
    await usuariosService.eliminarUsuario(req.params.id);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario };
