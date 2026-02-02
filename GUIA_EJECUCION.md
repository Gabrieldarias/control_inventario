# 🚀 GUÍA DE EJECUCIÓN - SISTEMA TIENDA MVP v2.0

## ⚠️ IMPORTANTE: Leer primero

Este sistema requiere **Node.js instalado** en tu computadora. Si no lo tienes, descárgalo desde: https://nodejs.org/

---

## 📋 PASOS DE INSTALACIÓN

### PASO 1: Abrir Terminal PowerShell
1. Abre **PowerShell** como administrador
2. Ejecuta el siguiente comando:

```powershell
cd "c:\xampp\htdocs\paginas\Tienda\backend"
```

### PASO 2: Instalar Dependencias
```powershell
npm install
```

**Esperar a que termine** (puede tomar 2-3 minutos)

### PASO 3: Reiniciar Base de Datos
```powershell
npm run reset-db
```

**Esto va a:**
- Eliminar BD anterior
- Crear esquema completo con 16 tablas
- Cargar datos de ejemplo (2 usuarios + 3 productos)

### PASO 4: Iniciar Servidor
```powershell
npm run dev
```

**Esperar a ver en terminal:**
```
Tienda backend escuchando en puerto 3001
```

### PASO 5: Abrir en Navegador
```
http://localhost:3001
```

---

## 👤 CREDENCIALES PARA LOGIN

**Usuario Admin:**
- Email: `admin@example.com`
- Contraseña: `adminpass`

**Usuario Vendedor:**
- Email: `vendedor@example.com`
- Contraseña: `vendedorpass`

---

## 🎯 PRIMEROS PASOS EN LA APP

### 1. Ingresa como Admin
- Usa las credenciales admin

### 2. Explora "📦 Productos"
- Verás 3 productos de ejemplo
- Stock total = 0 (porque no hay lotes aún)

### 3. Ve a "📋 Lotes"
- Selecciona cualquier producto
- Haz clic en "+ Nuevo Lote"
- Ingresa:
  - Cantidad: 10
  - Costo Unitario: 100.00
  - Fecha Vencimiento: 2026-12-31
- Haz clic en "Guardar Lote"

### 4. Vuelve a "📦 Productos"
- Verás que Stock Total ahora = 10

### 5. Mira "📊 Reportes"
- Stock Actual: Muestra los 3 productos con stock = 10
- Rotación: Estará vacío (no hay ventas aún)
- Valorización: Muestra valor total del inventario

### 6. Revisa "🔔 Alertas"
- Si agregaste stock por debajo del mínimo, verás alertas
- Haz clic en "Resolver" para marcarla como resuelta

---

## 📦 FUNCIONES DISPONIBLES

### En "📦 Productos"
- ✅ Ver todos los productos
- ✅ **Buscar** por nombre o código
- ✅ **Filtrar** por categoría
- ✅ **Crear** nuevo producto
- ✅ **Editar** producto (haz clic en "Editar")
- ✅ **Eliminar** producto (haz clic en "Eliminar")

### En "📋 Lotes"
- ✅ Seleccionar producto
- ✅ Ver todos sus lotes
- ✅ **Crear nuevo lote** (entrada de stock)
- ✅ Ver cantidad actual vs. inicial

### En "📊 Reportes"
- ✅ **Reporte de Stock Actual:** Stock de cada producto
- ✅ **Reporte de Rotación:** Productos más vendidos
- ✅ **Reporte de Valorización:** Valor total inventario
- ✅ Descargar CSV (⬇️ Botón)
- ✅ Imprimir (🖨️ Botón o Ctrl+P)

### En "🔔 Alertas"
- ✅ Ver todas las alertas automáticas
- ✅ Filtrar por estado (pendiente/resuelto)
- ✅ Resolver alertas

---

## 🎨 EJEMPLO COMPLETO: Agregar Producto + Stock

### Paso 1: Crear Producto
1. Ir a "📦 Productos"
2. Haz clic en "+ Nuevo Producto"
3. Ingresa:
   - Nombre: `Filtro de Aire`
   - Código Interno: `FILT-001`
   - Categoría: (elige una o deja en blanco)
   - Precio Costo: `150.00`
   - Precio Venta: `250.00`
   - Stock Mínimo: `5`
4. Haz clic en "Guardar"

### Paso 2: Agregar Stock (Lote)
1. Ir a "📋 Lotes"
2. Selecciona "Filtro de Aire"
3. Haz clic en "+ Nuevo Lote"
4. Ingresa:
   - Referencia: `LOT-2026-001`
   - Cantidad: `20`
   - Costo Unitario: `150.00`
   - Vencimiento: `2026-12-31`
5. Haz clic en "Guardar Lote"

### Paso 3: Ver Stock
1. Vuelve a "📦 Productos"
2. Busca "Filtro de Aire"
3. Verás Stock Total = 20

### Paso 4: Editar Precio
1. En "📦 Productos", haz clic en "Editar" en el Filtro de Aire
2. Cambia precio a 300.00
3. Guarda
4. El cambio se registra automáticamente en historial

### Paso 5: Ver en Reporte
1. Ve a "📊 Reportes"
2. Selecciona "Stock Actual"
3. Verás tu filtro con:
   - Stock: 20
   - Precio Costo: 150
   - Precio Venta: 300
   - Margen %: 100%
   - Estado: OK (porque 20 > 5 mínimo)

---

## ❓ TROUBLESHOOTING

### "Error: npm no encontrado"
**Solución:** 
- Instala Node.js desde https://nodejs.org/
- Reinicia PowerShell
- Intenta de nuevo

### "Error: puerto 3001 ya está en uso"
**Solución:**
- Abre otro PowerShell
- Ejecuta: `netstat -ano | findstr :3001`
- Matará el proceso: `taskkill /PID [PID] /F`
- Intenta de nuevo

### "Error: Base de datos"
**Solución:**
- Ejecuta: `npm run reset-db`
- Si persiste, elimina `tienda_mvp.db` manualmente e intenta de nuevo

### "No veo datos de ejemplo"
**Solución:**
- Verifica que `npm run reset-db` haya terminado correctamente
- Recarga el navegador (F5)

### "No puedo loguear"
**Solución:**
- Verifica email y contraseña (mayúsculas/minúsculas)
- Intenta: admin@example.com / adminpass
- Recarga la página (F5) e intenta de nuevo

---

## 📱 ACCESO DESDE OTROS DISPOSITIVOS

Si quieres acceder desde otra computadora:

1. **En la PC con el servidor:**
   - Ejecuta: `ipconfig`
   - Busca "IPv4 Address" (ej: 192.168.1.100)

2. **En otro dispositivo:**
   - Abre navegador
   - Ingresa: `http://192.168.1.100:3001`

---

## 🛑 DETENER EL SERVIDOR

En PowerShell donde corre el servidor:
- Presiona `Ctrl + C`

Esto detiene el servidor.

---

## 🔄 REINICIAR DESDE CERO

Si necesitas resetear todo:

```powershell
# Opción 1: Solo base de datos
npm run reset-db

# Opción 2: Completo
npm install
npm run reset-db
npm run dev
```

---

## 📚 DOCUMENTACIÓN ADICIONAL

- `ESPECIFICACION_FUNCIONAL_INVENTARIO.md` - Especificación completa
- `README_INVENTARIO.md` - Guía de uso del sistema
- `IMPLEMENTACION_COMPLETADA.md` - Resumen técnico

---

## 💡 CONSEJOS

1. **Mantén el terminal abierto** mientras usas la app
2. **Abre DevTools** (F12) si ves errores
3. **Recarga** si algo no funciona (F5)
4. **Probacomo Admin** primero para ver todas las funciones
5. **Los datos persisten** en `tienda_mvp.db`

---

## ✅ CHECKLIST DE SETUP

- [ ] Node.js instalado
- [ ] Terminal abierto en `c:\xampp\htdocs\paginas\Tienda\backend`
- [ ] `npm install` completado
- [ ] `npm run reset-db` ejecutado
- [ ] `npm run dev` corriendo
- [ ] Navegador en `http://localhost:3001`
- [ ] Logeo exitoso
- [ ] Ver productos en lista
- [ ] Crear lote
- [ ] Stock actualizado
- [ ] Ver reporte

---

**¡Listo para usar! 🎉**

Si tienes problemas, revisa los logs en PowerShell o abre DevTools (F12) en el navegador.

**Soporte:** Revisa la sección de Troubleshooting arriba o los archivos de documentación.
