#!/bin/bash

# Script de despliegue a Vercel
# Uso: bash deploy.sh

set -e

echo "🚀 Iniciando despliegue a Vercel Serverless..."

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: No se encuentra vercel.json"
    echo "Asegurate de estar en la raíz del proyecto"
    exit 1
fi

# 2. Verificar git
if ! command -v git &> /dev/null; then
    echo "❌ Git no está instalado"
    exit 1
fi

# 3. Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# 4. Verificar token de Vercel
if [ ! -f ~/.vercel/auth.json ]; then
    echo "🔐 Inicia sesión en Vercel..."
    vercel login
fi

# 5. Commitar cambios
echo "📝 Preparando cambios..."
git add .
git commit -m "chore: Actualización pre-despliegue" || true
git push || true

# 6. Verificar variables de entorno
echo "✅ Configurando variables de entorno..."
echo "Asegurate de que estas variables estén en Vercel Dashboard:"
echo "  - SUPABASE_URL"
echo "  - SUPABASE_KEY"
echo "  - JWT_SECRET"

# 7. Desplegar
echo "🚀 Desplegando a Vercel..."
vercel --prod

echo "✅ ¡Despliegue completado!"
echo "Tu app estará disponible en:"
vercel list --json | jq -r '.deployments[0].url' || echo "Verifica en el dashboard de Vercel"
