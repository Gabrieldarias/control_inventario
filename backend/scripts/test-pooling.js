// Script para probar con Connection Pooling
const postgres = require('knex')({
  client: 'pg',
  connection: {
    host: 'pooler.supabase.co',
    port: 6543,
    user: 'postgres.rsujclfftqfbudbirsxj',
    password: 'laquizanda.',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  },
  pool: { min: 0, max: 5 },
  acquireConnectionTimeout: 30000
});

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a Supabase (Connection Pooling)...\n');
    
    const result = await postgres.raw('SELECT NOW() as tiempo_actual');
    console.log('✅ Conexión exitosa!');
    console.log('Hora del servidor:', result.rows[0].tiempo_actual);
    
    const version = await postgres.raw('SELECT version()');
    console.log('Versión PostgreSQL:', version.rows[0].version.split(',')[0]);
    
    return true;
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    console.error('\n💡 Si esto sigue fallando:');
    console.error('1. Verifica que pooler.supabase.co sea accesible');
    console.error('2. Intenta con el DNS: 8.8.8.8 (Google DNS)');
    console.error('3. O contacta a tu ISP sobre restricciones de salida en puerto 6543');
    return false;
  } finally {
    await postgres.destroy();
  }
}

testConnection();
