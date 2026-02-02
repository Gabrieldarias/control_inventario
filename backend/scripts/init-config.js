// Script para inicializar configuración por defecto
const configService = require('../src/services/configService');

async function init() {
  try {
    await configService.initDefaults();
    console.log('✅ Configuración inicializada correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

init();
