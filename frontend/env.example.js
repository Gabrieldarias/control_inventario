// Variables de entorno para PRODUCCIÓN
// Este archivo se carga ANTES de supabaseClient.js

// ⚠️ IMPORTANTE: NO subir este archivo a GitHub
// Agrégalo a .gitignore

// En producción (Vercel), este archivo se genera automáticamente
// con el buildCommand en vercel.json

window.ENV = {
  SUPABASE_URL: 'https://db.rsujclfftqfbudbirsxj.supabase.co',
  SUPABASE_ANON_KEY: 'tu_supabase_anon_key_aqui'
};

// Para desarrollo local, NO uses este archivo
// Usa frontend/config.html para configurar localStorage
