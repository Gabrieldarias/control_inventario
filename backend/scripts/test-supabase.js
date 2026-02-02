// Script alternativo usando connectionString directo
const postgres = require('knex')({
  client: 'pg',
  connection: {
    connectionString: 'postgresql://postgres:laquizanda.@db.rsujclfftqfbudbirsxj.supabase.co:5432/postgres?sslmode=require',
    ssl: { rejectUnauthorized: false },
    // Forzar IPv4
    lookup: 'ipv4'
  },
  searchPath: ['public'],
  pool: { min: 0, max: 5 }
});

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a Supabase...\n');
    
    const result = await postgres.raw('SELECT NOW() as tiempo_actual');
    console.log('✅ Conexión exitosa!');
    console.log('Hora del servidor:', result.rows[0].tiempo_actual);
    
    const version = await postgres.raw('SELECT version()');
    console.log('Versión PostgreSQL:', version.rows[0].version.split(',')[0]);
    
    return true;
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    console.error('\n💡 Posibles soluciones:');
    console.error('1. Verifica que tu proyecto Supabase esté activo (no pausado)');
    console.error('2. Ve a Settings → Database → Connection pooling');
    console.error('3. Asegúrate de que IPv4 esté habilitado');
    console.error('4. Verifica que la contraseña sea correcta');
    return false;
  } finally {
    await postgres.destroy();
  }
}

testConnection();
