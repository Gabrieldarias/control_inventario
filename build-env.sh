#!/bin/sh
# Script para generar env.js en Vercel durante el build
echo "// Variables de entorno inyectadas para el frontend" > frontend/env.js
echo "window.ENV = {" >> frontend/env.js
echo "  SUPABASE_URL: '$SUPABASE_URL'," >> frontend/env.js
echo "  SUPABASE_ANON_KEY: '$SUPABASE_ANON_KEY'" >> frontend/env.js
echo "}" >> frontend/env.js
echo "✅ env.js generado"
