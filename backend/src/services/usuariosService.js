const knex = require('../db/knex');
const bcrypt = require('bcrypt');

async function listarUsuarios() {
  return knex('users').select('id', 'nombre', 'email', 'role', 'estado', 'created_at');
}

async function crearUsuario({ nombre, email, password, role }) {
  const existe = await knex('users').where('email', email).first();
  if (existe) throw new Error('El email ya está registrado');

  const passwordHash = await bcrypt.hash(password, 10);
  const [usuarioId] = await knex('users').insert({
    nombre,
    email,
    password_hash: passwordHash,
    role,
    estado: true
  });

  return knex('users').select('id', 'nombre', 'email', 'role', 'estado').where('id', usuarioId).first();
}

async function actualizarUsuario(id, { nombre, email, password, role }) {
  const usuario = await knex('users').where('id', id).first();
  if (!usuario) throw new Error('Usuario no encontrado');

  const cambios = { nombre, email, role };
  
  if (password && password.length > 0) {
    cambios.password_hash = await bcrypt.hash(password, 10);
  }

  await knex('users').where('id', id).update(cambios);
  return knex('users').select('id', 'nombre', 'email', 'role', 'estado').where('id', id).first();
}

async function eliminarUsuario(id) {
  const usuario = await knex('users').where('id', id).first();
  if (!usuario) throw new Error('Usuario no encontrado');
  
  await knex('users').where('id', id).update({ estado: false });
}

module.exports = { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario };
