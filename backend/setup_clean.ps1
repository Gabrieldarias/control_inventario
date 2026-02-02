# Script de setup para Tienda MVP
# Ejecutar: cd c:\xampp\htdocs\paginas\Tienda\backend; .\setup.ps1

Write-Host ""
Write-Host "========================================"
Write-Host "TIENDA MVP - Setup Automatizado"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Host "[1/5] Verificando Node.js..." -ForegroundColor Yellow
$node = node --version 2>$null
if ($null -eq $node) {
    Write-Host "ERROR: Node.js NO esta instalado." -ForegroundColor Red
    Write-Host "Descargalo desde: https://nodejs.org/ (LTS recomendado)" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Node.js $node encontrado" -ForegroundColor Green

# 2. Instalar dependencias
Write-Host ""
Write-Host "[2/5] Instalando dependencias..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo en npm install" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Dependencias instaladas" -ForegroundColor Green

# 3. Inicializar BD
Write-Host ""
Write-Host "[3/5] Inicializando base de datos..." -ForegroundColor Yellow
npm run init-db
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo en npm run init-db" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Base de datos inicializada" -ForegroundColor Green

# 4. Cargar datos de ejemplo
Write-Host ""
Write-Host "[4/5] Cargando datos de ejemplo..." -ForegroundColor Yellow
npm run seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo en npm run seed" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Datos de ejemplo cargados" -ForegroundColor Green

# 5. Iniciar servidor
Write-Host ""
Write-Host "[5/5] Iniciando servidor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "EXITO - MVP listo!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URL: http://localhost:3001/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciales de prueba:" -ForegroundColor Cyan
Write-Host "  Admin:    admin@example.com / adminpass" -ForegroundColor Cyan
Write-Host "  Vendedor: vendedor@example.com / vendedorpass" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

npm run dev
