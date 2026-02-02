@echo off
echo Tienda MVP - Setup
echo.
echo Paso 1: Instalar dependencias...
npm install
if errorlevel 1 goto error
echo Paso 1 OK
echo.

echo Paso 2: Inicializar base de datos...
npm run init-db
if errorlevel 1 goto error
echo Paso 2 OK
echo.

echo Paso 3: Cargar datos de ejemplo...
npm run seed
if errorlevel 1 goto error
echo Paso 3 OK
echo.

echo Paso 4: Iniciar servidor...
echo URL: http://localhost:3001
echo.
npm run dev
exit /b 0

:error
echo.
echo ERROR - Revisa los pasos anteriores
exit /b 1
