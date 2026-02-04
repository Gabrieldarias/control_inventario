# API Endpoints Faltantes

## Estado Actual del Sistema

### ✅ Endpoints Implementados

1. **Auth**
   - ✅ `POST /api/auth/login` - Login de usuarios

2. **Productos**
   - ✅ `GET /api/inventory/productos` - Listar productos
   - ✅ `POST /api/inventory/productos` - Crear producto
   - ✅ `GET /api/inventory/productos/:id` - Obtener un producto
   - ✅ `PUT /api/inventory/productos/:id` - Actualizar producto
   - ✅ `DELETE /api/inventory/productos/:id` - Eliminar producto
   - ✅ `GET /api/inventory/productos/buscar/termino` - Buscar productos

3. **Categorías**
   - ✅ `GET /api/inventory/categorias` - Listar categorías
   - ✅ `POST /api/inventory/categorias` - Crear categoría

4. **Configuración**
   - ✅ `GET /api/configuracion` - Obtener toda la configuración
   - ✅ `GET /api/configuracion/:clave` - Obtener configuración por clave
   - ✅ `PUT /api/configuracion/:clave` - Actualizar configuración

### ❌ Endpoints que FALTAN Implementar

#### 1. **Lotes** (Pestaña: Lotes)
```
❌ POST /api/inventory/lotes - Crear lote
❌ PUT /api/inventory/lotes/:id - Actualizar lote
❌ GET /api/inventory/lotes/:productoId - Obtener lotes de un producto
```

#### 2. **Movimientos de Inventario** (Usado en múltiples pestañas)
```
❌ POST /api/inventory/movimientos - Registrar movimiento
❌ GET /api/inventory/movimientos - Listar movimientos con filtros
```

#### 3. **Alertas** (Pestaña: Alertas)
```
❌ GET /api/inventory/alertas - Listar alertas con filtros
❌ PUT /api/inventory/alertas/:id/resolver - Resolver alerta
```

#### 4. **Historial de Precios** (Usado en Productos)
```
❌ PUT /api/inventory/productos/:id/precio - Actualizar precio con historial
❌ GET /api/inventory/productos/:id/historial-precios - Obtener historial
```

#### 5. **Proveedores** (Pestaña: Proveedores)
```
❌ GET /api/inventory/proveedores - Listar proveedores
❌ POST /api/inventory/proveedores - Crear proveedor
❌ PUT /api/inventory/proveedores/:id - Actualizar proveedor
❌ DELETE /api/inventory/proveedores/:id - Eliminar proveedor
```

#### 6. **Ventas** (Pestaña: Ventas / Punto de Venta)
```
❌ POST /api/sales - Crear venta
❌ GET /api/sales - Listar ventas con filtros
❌ GET /api/sales/:id - Obtener detalle de venta
```

#### 7. **Compras** (Pestaña: Compras)
```
❌ POST /api/compras - Crear compra
❌ GET /api/compras - Listar compras con filtros
❌ GET /api/compras/:id - Obtener detalle de compra
```

#### 8. **Devoluciones** (Pestaña: Devoluciones)
```
❌ POST /api/devoluciones - Crear devolución
❌ GET /api/devoluciones - Listar devoluciones con filtros
```

#### 9. **Reportes** (Pestaña: Reportes)
```
❌ GET /api/inventory/reportes/stock-actual - Reporte de stock actual
❌ GET /api/inventory/reportes/rotacion - Reporte de rotación de productos
❌ GET /api/inventory/reportes/valorizacion - Reporte de valorización
```

#### 10. **Usuarios** (Pestaña: Usuarios)
```
❌ GET /api/usuarios - Listar usuarios
❌ POST /api/usuarios - Crear usuario
❌ PUT /api/usuarios/:id - Actualizar usuario
❌ DELETE /api/usuarios/:id - Eliminar usuario
```

#### 11. **Importación/Exportación**
```
❌ POST /api/inventory/importar - Importar productos desde CSV/Excel
❌ GET /api/inventory/exportar - Exportar inventario
```

## Resumen de Trabajo Pendiente

### Tablas Creadas: ✅ 17/17 (100%)
- users
- categories
- products
- suppliers
- customers
- sales
- sale_items
- purchases
- purchase_items
- returns
- return_items
- lotes
- movimientos
- alertas
- historial_precios
- configuracion

### Endpoints Implementados: ✅ 12/55 (22%)

### Endpoints Faltantes: ❌ 43/55 (78%)

## Prioridad de Implementación

### 🔴 PRIORIDAD ALTA (Para funcionalidad básica)
1. **Ventas** - POST /api/sales, GET /api/sales, GET /api/sales/:id
2. **Proveedores** - GET y POST /api/inventory/proveedores
3. **Compras** - POST y GET /api/compras
4. **Lotes** - POST, PUT, GET /api/inventory/lotes

### 🟡 PRIORIDAD MEDIA (Para funcionalidad completa)
5. **Movimientos** - POST y GET /api/inventory/movimientos
6. **Devoluciones** - POST y GET /api/devoluciones
7. **Alertas** - GET y PUT /api/inventory/alertas
8. **Historial de Precios** - PUT y GET

### 🟢 PRIORIDAD BAJA (Para funcionalidad avanzada)
9. **Reportes** - GET /api/inventory/reportes/*
10. **Usuarios** - CRUD completo /api/usuarios
11. **Importación/Exportación**

## Instrucciones para Implementar

Para cada endpoint faltante:

1. Crear archivo en `api/[módulo]/[recurso].js` o `api/[módulo]/[recurso]/[acción].js`
2. Seguir estructura de endpoints existentes
3. Usar `import { supabase, setCorsHeaders } from '../utils.js'`
4. Por ahora, NO aplicar autenticación (como en endpoints actuales)
5. Agregar extensión `.js` en todos los imports
6. Usar nombres de columnas en ESPAÑOL (coincidiendo con database/RESET_DATABASE.sql)

## Ejemplo de Implementación

### Archivo: `api/inventory/lotes/index.js`

```javascript
import { supabase, setCorsHeaders } from '../../utils.js';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'GET') {
    const { productoId } = req.query;

    const { data, error } = await supabase
      .from('lotes')
      .select('*')
      .eq('producto_id', productoId)
      .eq('estado', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Método no permitido' });
}

export default handler;
```

## Siguiente Paso

Para que TODAS las pestañas funcionen, necesitas:

1. ✅ Ejecutar `database/RESET_DATABASE.sql` en Supabase
2. ❌ Implementar los 43 endpoints faltantes listados arriba

**Recomendación:** Comenzar implementando los endpoints de PRIORIDAD ALTA para tener funcionalidad básica del sistema.
