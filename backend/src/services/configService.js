const db = require('../db/knex');

/**
 * Obtener valor de configuración
 */
async function getConfig(clave) {
  const config = await db('configuracion')
    .where({ clave })
    .first();
  
  if (!config) return null;
  
  // Convertir según el tipo
  if (config.tipo === 'number') return parseFloat(config.valor);
  if (config.tipo === 'boolean') return config.valor === 'true';
  if (config.tipo === 'json') return JSON.parse(config.valor);
  
  return config.valor;
}

/**
 * Establecer valor de configuración
 */
async function setConfig(clave, valor, usuarioId, descripcion = '') {
  const existe = await db('configuracion').where({ clave }).first();
  
  let valorStr = valor;
  let tipo = 'string';
  
  if (typeof valor === 'number') {
    valorStr = valor.toString();
    tipo = 'number';
  } else if (typeof valor === 'boolean') {
    valorStr = valor.toString();
    tipo = 'boolean';
  } else if (typeof valor === 'object') {
    valorStr = JSON.stringify(valor);
    tipo = 'json';
  }
  
  if (existe) {
    await db('configuracion')
      .where({ clave })
      .update({
        valor: valorStr,
        tipo,
        updated_by: usuarioId
      });
  } else {
    await db('configuracion').insert({
      clave,
      valor: valorStr,
      tipo,
      descripcion,
      updated_by: usuarioId
    });
  }
  
  return { clave, valor };
}

/**
 * Obtener todas las configuraciones
 */
async function getAllConfig() {
  const configs = await db('configuracion').select('*');
  
  const result = {};
  for (const config of configs) {
    if (config.tipo === 'number') {
      result[config.clave] = parseFloat(config.valor);
    } else if (config.tipo === 'boolean') {
      result[config.clave] = config.valor === 'true';
    } else if (config.tipo === 'json') {
      result[config.clave] = JSON.parse(config.valor);
    } else {
      result[config.clave] = config.valor;
    }
  }
  
  return result;
}

/**
 * Inicializar configuraciones por defecto
 */
async function initDefaults() {
  const defaults = [
    { clave: 'porcentaje_ganancia', valor: '30', descripcion: 'Porcentaje de ganancia para calcular precio de venta', tipo: 'number' }
  ];
  
  for (const def of defaults) {
    const existe = await db('configuracion').where({ clave: def.clave }).first();
    if (!existe) {
      await db('configuracion').insert(def);
    }
  }
}

module.exports = {
  getConfig,
  setConfig,
  getAllConfig,
  initDefaults
};
