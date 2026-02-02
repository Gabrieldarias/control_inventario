// Configuración del cliente de Supabase para frontend
// SIN imports - usando SDK desde CDN global (window.supabase)
// Variables desde window.ENV (inyectadas en tiempo de build)

console.log('🔧 Inicializando Supabase Client...');

// Verificar que window.ENV esté disponible
if (typeof window.ENV === 'undefined') {
  console.error('❌ ERROR: window.ENV no está definido');
  console.error('Verifica que env.js esté cargado ANTES de supabaseClient.js');
  console.error('En index.html, env.js debe estar antes de supabaseClient.js');
}

// Configuración de Supabase (desde window.ENV inyectado en build)
const supabaseUrl = window.ENV?.SUPABASE_URL;
const supabaseAnonKey = window.ENV?.SUPABASE_ANON_KEY;

// Debug: Verificar que las variables estén cargadas
console.log('🔧 Supabase Config Check:');
console.log('  📍 URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
console.log('  🔑 Anon Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltante');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Variables de Supabase no configuradas');
  console.error('📋 En Vercel, configura:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('');
  console.error('En Settings → Environment Variables');
}

// Crear cliente de Supabase usando el SDK global
const supabaseClient = (supabaseUrl && supabaseAnonKey && typeof supabase !== 'undefined') 
  ? supabase.createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabaseClient) {
  console.error('❌ No se pudo inicializar el cliente de Supabase');
  if (typeof supabase === 'undefined') {
    console.error('❌ SDK de Supabase no está cargado. Verifica que index.html incluya el CDN.');
  }
}

// Exportar cliente globalmente
window.supabaseClient = supabaseClient;

// Helper para login con email/password
async function loginWithEmail(email, password) {
  if (!supabaseClient) {
    throw new Error('Supabase no está configurado. Contacta al administrador.');
  }

  try {
    console.log('🔐 Intentando login con:', email);
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('❌ Error de login:', error.message);
      throw new Error(error.message);
    }

    console.log('✅ Login exitoso');
    console.log('👤 Usuario:', data.user.email);
    console.log('🔑 Token:', data.session.access_token.substring(0, 20) + '...');

    return {
      success: true,
      user: data.user,
      session: data.session,
      token: data.session.access_token
    };
  } catch (err) {
    console.error('❌ Error en loginWithEmail:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

// Helper para logout
async function logout() {
  if (!supabaseClient) {
    throw new Error('Supabase no está configurado');
  }

  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    
    console.log('✅ Logout exitoso');
    localStorage.removeItem('token');
    
    return { success: true };
  } catch (err) {
    console.error('❌ Error en logout:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

// Helper para obtener usuario actual
async function getCurrentUser() {
  if (!supabaseClient) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) throw error;
    return user;
  } catch (err) {
    console.error('❌ Error obteniendo usuario:', err.message);
    return null;
  }
}

// Exportar funciones globalmente
window.supabaseAuth = {
  login: loginWithEmail,
  logout: logout,
  getCurrentUser: getCurrentUser,
  client: supabaseClient
};

console.log('✅ Supabase Client cargado correctamente');
console.log('💡 Usa window.supabaseAuth.login(email, password) para autenticar');
