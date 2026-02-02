# Tienda MVP - Setup (PowerShell)
# Ejecutar: cd c:\xampp\htdocs\paginas\Tienda\backend; .\run.ps1

Write-Host ""
Write-Host "======================================"
Write-Host "TIENDA MVP - Setup"
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1
Write-Host "[PASO 1] Instalar dependencias..." -ForegroundColor Yellow
Write-Host "npm install"
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR en Paso 1" -ForegroundColor Red; exit 1 }
Write-Host "[OK]" -ForegroundColor Green
Write-Host ""

# Paso 2
Write-Host "[PASO 2] Inicializar BD..." -ForegroundColor Yellow
Write-Host "npm run init-db"
npm run init-db
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR en Paso 2" -ForegroundColor Red; exit 1 }
Write-Host "[OK]" -ForegroundColor Green
Write-Host ""

# Paso 3
Write-Host "[PASO 3] Cargar datos ejemplo..." -ForegroundColor Yellow
Write-Host "npm run seed"
npm run seed
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR en Paso 3" -ForegroundColor Red; exit 1 }
Write-Host "[OK]" -ForegroundColor Green
Write-Host ""

# Paso 4
Write-Host "[PASO 4] Iniciar servidor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "======================================"
Write-Host "LISTO - Servidor iniciado" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Abre: http://localhost:3001/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciales:"
Write-Host "  Admin:    admin@example.com / adminpass"
Write-Host "  Vendedor: vendedor@example.com / vendedorpass"
Write-Host ""
Write-Host "======================================"
Write-Host ""

npm run dev
