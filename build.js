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
const envContent = `// Variables de entorno inyectadas por el build script
// Generado automáticamente en tiempo de build

window.ENV = {
  SUPABASE_URL: "${publicVars.SUPABASE_URL}",
  SUPABASE_ANON_KEY: "${publicVars.SUPABASE_ANON_KEY}"
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
  } else {
    console.log('✅ Variables configuradas:');
    console.log(`   - SUPABASE_URL: ${publicVars.SUPABASE_URL.substring(0, 30)}...`);
    console.log(`   - SUPABASE_ANON_KEY: ${publicVars.SUPABASE_ANON_KEY.substring(0, 20)}...`);
  }

  console.log('✅ Build completado exitosamente');
  process.exit(0);
} catch (err) {
  console.error('❌ Error durante el build:', err.message);
  process.exit(1);
}
