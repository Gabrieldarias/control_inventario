// Script para probar conexión forzando resolución
const dns = require('dns');
const postgres = require('knex')({
  client: 'pg',
  connection: {
    host: 'db.rsujclfftqfbudbirsxj.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'laquizanda.',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  },
  pool: { min: 0, max: 5 },
  acquireConnectionTimeout: 30000
});

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a Supabase...\n');
    
    // Primero intenta resolver manualmente
    console.log('Resolviendo DNS de db.rsujclfftqfbudbirsxj.supabase.co...');
    dns.resolve4('db.rsujclfftqfbudbirsxj.supabase.co', (err, addresses) => {
      if (err) {
        console.error('❌ Error de DNS:', err.message);
      } else {
        console.log('✅ DNS resuelto a:', addresses);
      }
    });
    
    // Esperar un poco y luego intentar conexión
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await postgres.raw('SELECT NOW() as tiempo_actual');
    console.log('\n✅ ¡Conexión exitosa a Supabase!');
    console.log('Hora del servidor:', result.rows[0].tiempo_actual);
    
    const version = await postgres.raw('SELECT version()');
    console.log('Versión PostgreSQL:', version.rows[0].version.split(',')[0]);
    
    return true;
  } catch (err) {
    console.error('\n❌ Error de conexión:', err.message);
    return false;
  } finally {
    await postgres.destroy();
  }
}

testConnection();
