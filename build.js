#!/usr/bin/env node

/**
 * Build script para inyectar variables de entorno en el navegador
 * Ejecutado por Vercel antes de deployar
 * 
 * Lee las variables NEXT_PUBLIC_* de process.env
 * y genera frontend/env.js con window.ENV
 */

const fs = require('fs');
const path = require('path');

console.log('🔨 Build script iniciado');

// Variables públicas que se inyectarán en el navegador
const publicVars = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
};

// Generar contenido de env.js
// Las variables se escapan correctamente para evitar problemas con comillas
const supabaseUrl = (publicVars.SUPABASE_URL || '').replace(/"/g, '\\"');
const supabaseKey = (publicVars.SUPABASE_ANON_KEY || '').replace(/"/g, '\\"');

const envContent = `// Variables de entorno inyectadas por el build script
// Generado automáticamente en tiempo de build

window.ENV = {
  SUPABASE_URL: "${supabaseUrl}",
  SUPABASE_ANON_KEY: "${supabaseKey}"
};

console.log('✅ Variables de entorno cargadas desde window.ENV');
if (!window.ENV.SUPABASE_URL || !window.ENV.SUPABASE_ANON_KEY) {
  console.error('❌ ERROR: Variables de Supabase no configuradas');
  console.error('Verifica que en Vercel estén configuradas:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
`;

// Ruta del archivo
const envFilePath = path.join(__dirname, 'frontend', 'env.js');

try {
  // Crear directorio si no existe
  const dir = path.dirname(envFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Directorio creado: ${dir}`);
  }

  // Escribir archivo
  fs.writeFileSync(envFilePath, envContent, 'utf8');
  console.log(`✅ Archivo ${envFilePath} generado correctamente`);

  // Verificar si las variables están configuradas
  if (!publicVars.SUPABASE_URL || !publicVars.SUPABASE_ANON_KEY) {
    console.warn('⚠️  WARNING: Variables NEXT_PUBLIC_* no están configuradas');
    console.warn('   En Vercel, ve a Settings → Environment Variables y agrega:');
    console.warn('   - NEXT_PUBLIC_SUPABASE_URL');
    console.warn('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.warn('');
    console.warn('   El archivo env.js se generó, pero estará vacío.');
  } else {
    console.log('✅ Variables configuradas:');
    console.log(`   - SUPABASE_URL: ${publicVars.SUPABASE_URL.substring(0, 30)}...`);
    console.log(`   - SUPABASE_ANON_KEY: ${publicVars.SUPABASE_ANON_KEY.substring(0, 20)}...`);
  }

  console.log('✅ Build completado exitosamente');
  // Siempre salir con 0 (éxito), incluso si las variables no están configuradas
  // El warning se muestra en los logs
  process.exit(0);
} catch (err) {
  console.error('❌ Error durante el build:', err.message);
  console.error('Stack:', err.stack);
  // Crear archivo env.js vacío como fallback para que el build no falle
  try {
    const fallbackContent = `// Error al generar variables de entorno
window.ENV = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: ""
};
console.error('⚠️ Variables de entorno no configuradas');`;
    
    const envFilePath = path.join(__dirname, 'frontend', 'env.js');
    fs.writeFileSync(envFilePath, fallbackContent, 'utf8');
    console.log('✅ Archivo fallback env.js creado');
  } catch (fallbackErr) {
    console.error('❌ Error creando fallback:', fallbackErr.message);
  }
  
  // Salir con 0 (no fallar el build) para permitir que Vercel al menos sirva la app
  process.exit(0);
}
