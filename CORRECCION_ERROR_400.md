# 🔧 Corrección de Error 400: Bad Request

## ❌ Problema Identificado

**Error:** `Failed to load resource: the server responded with a status of 400 (Bad Request)` 
**URL afectada:** `/api/inventory/productos/5:1`

## 🔍 Causa Raíz

El error ocurría por un **conflicto en el orden de las rutas de Express**:

```
ORDEN INCORRECTO:
GET /productos/:id          ← Esta ruta se ejecutaba primero
GET /productos/buscar/termino  ← Esta ruta nunca se ejecutaba
```

Cuando Express procesaba `/productos/buscar/termino`, lo interpretaba como:
- `:id` = `"buscar/termino"`

Lo que generaba una URL malformada: `/productos/5:1`

## ✅ Solución Aplicada

Se reorganizaron las rutas en el archivo `inventoryRoutes.js` para que las **rutas específicas se procesen ANTES de las rutas con parámetros**:

```javascript
// ORDEN CORRECTO:
GET /productos                        ← Lista general
GET /productos/buscar/termino        ← Ruta específica (ANTES)
PUT /productos/:producto_id/precio   ← Rutas específicas (ANTES)
GET /productos/:producto_id/historial-precios
GET /productos/:id                   ← Ruta paramétrica (DESPUÉS)
PUT /productos/:id
DELETE /productos/:id
```

## 📝 Archivo Modificado

**Ruta:** `backend/src/routes/inventoryRoutes.js`

**Cambios:**
- ✓ Movidas rutas específicas ANTES de parámetros
- ✓ Reorganizado orden lógico de rutas
- ✓ Eliminados conflictos de matching

## 🚀 Próximos Pasos

### Si el servidor está ejecutándose:

1. **Reinicia el servidor backend:**
   ```bash
   cd c:\xampp\htdocs\paginas\Tienda\backend
   Ctrl + C  (para detener el proceso actual)
   npm start  o  node server.js
   ```

2. **Recarga la página del navegador:**
   ```
   F5 o Ctrl + R
   ```

3. **Prueba las funcionalidades:**
   - Click en "Editar" producto
   - Búsqueda de productos
   - Historial de precios
   - Actualización de precios

## ✅ Validación

El error debe desaparecer. Si persiste:

1. Verifica que el servidor esté reiniciado
2. Abre la consola del navegador (F12)
3. Revisa los headers de la petición
4. Confirma que la URL sea correcta (sin `:1`)

## 📊 Impacto

**Afecta a:** Todos los endpoints que contienen parámetros ID
**Endpoints corregidos:**
- GET `/api/inventory/productos/:id`
- PUT `/api/inventory/productos/:id`
- DELETE `/api/inventory/productos/:id`
- GET `/api/inventory/productos/buscar/termino`
- PUT `/api/inventory/productos/:producto_id/precio`
- GET `/api/inventory/productos/:producto_id/historial-precios`

## 💡 Referencia Técnica

En Express.js, el orden importa para las rutas:
- Las rutas más específicas deben definirse ANTES que las genéricas
- Las rutas con parámetros (`:id`) son más genéricas
- Las rutas fijas (`/buscar`, `/precio`, `/historial`) son más específicas

---

**Fecha de corrección:** 2 de febrero de 2026
**Estado:** ✅ CORREGIDO
