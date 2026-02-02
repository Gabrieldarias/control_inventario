# Script de setup para Tienda MVP - Ejecutar en PowerShell como Administrador
# cd c:\xampp\htdocs\paginas\Tienda\backend
# .\setup.ps1

Write-Host "🚀 Tienda MVP - Setup Automatizado" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# 1. Verificar Node.js
Write-Host ""
Write-Host "1️⃣  Verificando Node.js..." -ForegroundColor Yellow
$node = node --version 2>$null
if ($null -eq $node) {
    Write-Host "❌ Node.js NO está instalado." -ForegroundColor Red
    Write-Host "Descárgalo desde: https://nodejs.org/ (LTS recomendado)" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $node encontrado" -ForegroundColor Green

# 2. Instalar dependencias
Write-Host ""
Write-Host "2️⃣  Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green

# 3. Inicializar BD
Write-Host ""
Write-Host "3️⃣  Inicializando base de datos..." -ForegroundColor Yellow
npm run init-db
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al inicializar BD" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Base de datos inicializada" -ForegroundColor Green

# 4. Cargar datos de ejemplo
Write-Host ""
Write-Host "4️⃣  Cargando datos de ejemplo..." -ForegroundColor Yellow
npm run seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al cargar seeds" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Datos de ejemplo cargados" -ForegroundColor Green

# 5. Iniciar servidor
Write-Host ""
Write-Host "5️⃣  Iniciando servidor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 ¡MVP listo!" -ForegroundColor Green
Write-Host "📱 Abre tu navegador en: http://localhost:3001/" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciales de prueba:" -ForegroundColor Cyan
Write-Host "  Admin: admin@example.com / adminpass" -ForegroundColor Cyan
Write-Host "  Vendedor: vendedor@example.com / vendedorpass" -ForegroundColor Cyan
Write-Host ""

npm run dev
