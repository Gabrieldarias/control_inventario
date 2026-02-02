# 🏪 SISTEMA TIENDA MVP - GESTIÓN DE INVENTARIO COMPLETA

## 📋 Descripción

Sistema web profesional y completo para gestión de inventario, productos, lotes, movimientos de stock y reportes. Incluye todas las funcionalidades solicitadas:

✅ Registro de productos (CRUD)  
✅ Gestión de categorías y subcategorías  
✅ Control de stock en tiempo real  
✅ Actualización automática de existencias  
✅ Registro de movimientos de inventario  
✅ Definición de stock mínimo y máximo  
✅ Alertas automáticas  
✅ Gestión de precios  
✅ Control de lotes y vencimientos  
✅ Búsqueda y filtrado avanzado  
✅ Reportes completos  
✅ Historial y auditoría  
✅ Importación/Exportación de datos  
✅ Gestión de proveedores  

---

## 🚀 INICIO RÁPIDO

### Requisitos previos
- Node.js (v14+)
- npm
- Windows (para ejecutar scripts .bat/.ps1)

### Instalación

1. **Abrir terminal en la carpeta backend**
   ```
   cd c:\xampp\htdocs\paginas\Tienda\backend
   ```

2. **Instalar dependencias**
   ```
   npm install
   ```

3. **Reiniciar la base de datos**
   ```
   npm run reset-db
   ```

4. **Iniciar servidor**
   ```
   npm run dev
   ```

5. **Abrir en navegador**
   ```
   http://localhost:3001
   ```

---

## 👤 Credenciales por Defecto

**Admin:**
- Email: `admin@example.com`
- Contraseña: `adminpass`

**Vendedor:**
- Email: `vendedor@example.com`
- Contraseña: `vendedorpass`

---

## 📦 MÓDULOS PRINCIPALES

### 1. GESTIÓN DE PRODUCTOS
- **Alta de productos** con código interno, categoría, precio costo/venta, stock mínimo/máximo
- **Edición** de todos los campos
- **Eliminación** (soft delete)
- **Búsqueda** por nombre y código
- **Filtrado** por categoría y disponibilidad
- **Visualización** de stock total, historial de precios

**Acciones:**
- Crear producto → + Nuevo Producto
- Editar → Botón Editar
- Eliminar → Botón Eliminar
- Buscar → Barra de búsqueda

---

### 2. GESTIÓN DE LOTES
- **Entrada de stock** mediante creación de lotes
- **Información por lote:** cantidad, fecha vencimiento, costo unitario, número de referencia
- **Visualización** de todos los lotes por producto
- **Seguimiento** de cantidad disponible vs. consumida

**Acciones:**
- Seleccionar producto → Dropdown "Seleccionar Producto"
- Agregar lote → + Nuevo Lote
- Ver detalle de lotes por producto

---

### 3. REPORTES
Tres tipos de reportes disponibles:

#### **Reporte de Stock Actual**
- Código, nombre, categoría, stock total
- Stock mínimo, precio costo, precio venta
- Margen de ganancia (%), valor total en costo
- Estado de alerta (BAJO/OK)

#### **Reporte de Rotación** (últimos 30 días)
- Producto y categoría
- Cantidad vendida
- Velocidad de rotación (unidades/día)

#### **Reporte de Valorización**
- Valor total del inventario
- Detalles por lote (cantidad, costo, valor total)
- Fechas de vencimiento

**Acciones:**
- Seleccionar tipo de reporte
- Descargar CSV
- Imprimir (Ctrl+P)

---

### 4. ALERTAS
Sistema de alertas automáticas y en tiempo real:

- **Stock Bajo:** Cuando stock ≤ stock mínimo (severidad media)
- **Agotado:** Cuando stock = 0 (severidad alta)
- **Próximo a Vencer:** Cuando fecha vencimiento ≤ hoy + 7 días (severidad media)
- **Stock Máximo Excedido:** Cuando stock > máximo (severidad baja)

**Acciones:**
- Ver todas las alertas
- Filtrar por estado (pendiente/resuelto)
- Resolver alerta → Botón "Resolver"
- Marca con colores por severidad

---

## 🔧 DESCRIPCIÓN TÉCNICA

### Base de Datos
**Motor:** SQLite (archivo `tienda_mvp.db`)

**Tablas principales:**
- `products` - Catálogo de productos
- `categorias` - Categorías y subcategorías
- `lots` - Lotes de stock
- `stock_movements` - Auditoría de movimientos
- `alertas` - Alertas generadas
- `precio_historial` - Historial de cambios de precio
- `proveedores` - Proveedores
- `producto_proveedor` - Relación producto-proveedor

### Backend (Node.js + Express)
**Estructura:**
```
backend/
├── src/
│   ├── server.js              (Aplicación principal)
│   ├── controllers/           (Lógica de negocio)
│   │   └── inventoryController.js
│   ├── services/              (Servicios reutilizables)
│   │   └── inventoryService.js
│   ├── routes/                (Rutas API)
│   │   └── inventoryRoutes.js
│   ├── middleware/            (Auth, validaciones)
│   │   └── auth.js
│   └── db/
│       ├── knex.js            (Configuración DB)
│       ├── schema.sql         (Esquema)
│       ├── init_db.js         (Inicialización)
│       ├── reset_db.js        (Reset)
│       └── seeds.js           (Datos iniciales)
├── package.json
└── tienda_mvp.db              (Base de datos SQLite)
```

### Frontend (React 18 + CDN)
**Componentes:**
- `Login` - Autenticación
- `GestionProductos` - CRUD de productos
- `GestionLotes` - Gestión de lotes
- `Reportes` - Visualización de reportes
- `GestionAlertas` - Centro de alertas
- `Modal`, `AlertBox` - Componentes reutilizables

---

## 🔌 API REST ENDPOINTS

### Productos
```
GET     /api/inventory/productos              (Listar todos)
GET     /api/inventory/productos/:id          (Obtener uno)
POST    /api/inventory/productos              (Crear)
PUT     /api/inventory/productos/:id          (Actualizar)
DELETE  /api/inventory/productos/:id          (Eliminar)
GET     /api/inventory/productos/buscar/termino (Búsqueda)
```

### Categorías
```
GET     /api/inventory/categorias             (Listar)
POST    /api/inventory/categorias             (Crear)
```

### Lotes
```
GET     /api/inventory/lotes/:producto_id     (Listar por producto)
POST    /api/inventory/lotes                  (Crear lote)
```

### Movimientos
```
GET     /api/inventory/movimientos            (Listar con filtros)
POST    /api/inventory/movimientos            (Registrar movimiento)
```

### Alertas
```
GET     /api/inventory/alertas                (Listar alertas)
PUT     /api/inventory/alertas/:id/resolver   (Resolver alerta)
```

### Precios
```
PUT     /api/inventory/productos/:id/precio             (Actualizar precio)
GET     /api/inventory/productos/:id/historial-precios  (Ver historial)
```

### Reportes
```
GET     /api/inventory/reportes/stock-actual      (Stock actual)
GET     /api/inventory/reportes/rotacion          (Rotación productos)
GET     /api/inventory/reportes/valorizacion      (Valorización inventario)
```

### Proveedores
```
GET     /api/inventory/proveedores                (Listar)
POST    /api/inventory/proveedores                (Crear)
POST    /api/inventory/proveedores/asociar        (Asociar a producto)
```

### Importación/Exportación
```
POST    /api/inventory/importar                   (Importar productos)
GET     /api/inventory/exportar                   (Descargar CSV)
```

---

## 📊 FLUJOS DE NEGOCIO

### Flujo 1: Entrada de Stock
1. Admin accede a "Lotes"
2. Selecciona producto
3. Hace clic en "+ Nuevo Lote"
4. Ingresa: cantidad, fecha vencimiento, costo unitario, referencia
5. Sistema registra lote y movimiento de entrada
6. Stock se actualiza automáticamente

### Flujo 2: Venta (POS)
1. Sistema descuenta stock automáticamente
2. Utiliza FIFO: consume lotes más antiguos primero
3. Registra movimiento de salida
4. Actualiza stock disponible
5. Verifica si genera alertas de bajo stock

### Flujo 3: Gestión de Precios
1. Admin edita producto
2. Actualiza precio costo/venta
3. Sistema registra cambio en historial
4. Calcula margen automáticamente
5. Disponible en reportes

### Flujo 4: Alertas
1. Sistema verifica alertas automáticamente en cada movimiento
2. Si stock ≤ mínimo → Alerta "Stock bajo"
3. Si stock = 0 → Alerta "Agotado"
4. Si próximo a vencer → Alerta "Próximo vencer"
5. Admin resuelve desde panel de alertas

---

## 🎯 CASOS DE USO COMPLETOS

### Caso 1: Nuevo Producto
1. Ir a "Productos" → "+ Nuevo Producto"
2. Ingresar: nombre, código, categoría, precio costo, precio venta, stock mínimo
3. Guardar
4. Crear lotes de entrada (ir a "Lotes")
5. Ver en reporte de stock

### Caso 2: Control de Vencimientos
1. Ir a "Alertas"
2. Ver alertas tipo "Próximo vencer"
3. Priorizar venta de esos productos
4. Resolver alerta cuando se vende

### Caso 3: Análisis de Rotación
1. Ir a "Reportes" → "Rotación"
2. Ver productos vendidos últimos 30 días
3. Identificar productos lentos (baja rotación)
4. Aplicar estrategia: descuentos, promociones

### Caso 4: Auditoría
1. Ir a "Productos" → Seleccionar producto → Ver detalles
2. Ver historial de precios
3. Ver todos los movimientos
4. Identificar responsable y fecha

---

## 🔒 Seguridad y Permisos

### Admin (admin@example.com)
- ✅ CRUD completo de productos
- ✅ Gestión de lotes
- ✅ Ver reportes
- ✅ Gestionar alertas
- ✅ Importar/Exportar

### Vendedor (vendedor@example.com)
- ✅ Ver productos y stock
- ✅ Ver alertas
- ✅ ❌ No puede crear/editar productos
- ✅ ❌ No puede acceder a reportes

---

## 📈 KPIs Principales

1. **Stock Bajo:** % de productos en alerta
2. **Rotación:** Días promedio en almacén
3. **Valorización:** $ total inventario
4. **Margen Promedio:** % margen por categoría
5. **Exactitud:** % discrepancias inventario

---

## 🐛 Troubleshooting

### "Error de conexión a BD"
- Ejecutar: `npm run reset-db`
- Verificar que SQLite esté instalado

### "No se puede crear producto"
- Verificar que código_interno sea único
- Verificar que precio_venta > precio_costo

### "Stock no se actualiza"
- Verificar que lote esté en estado "activo"
- Revisar movimientos de stock

### "Alertas no aparecen"
- Ejecutar manualmente: verificarAlertas después de crear lote
- Verificar severidad del filtro

---

## 📝 PRÓXIMAS MEJORAS (Roadmap)

### v1.1
- [ ] Descuentos automáticos por vencimiento
- [ ] Email de alertas
- [ ] Importación masiva de inventario

### v1.2
- [ ] Sugerencias automáticas de reorden
- [ ] Análisis ABC de productos
- [ ] Integración con código de barras

### v2.0
- [ ] Multi-almacén / Multi-sucursal
- [ ] App móvil
- [ ] EDI con proveedores
- [ ] Integración contable

---

## 📞 Soporte

Para reportar bugs o sugerencias, documentar en:
- Tipo de error
- Pasos para reproducir
- Navegador utilizado
- Usuario (admin/vendedor)

---

**Sistema Tienda MVP v1.0**  
**Gestión de Inventario Completa**  
**2 de febrero de 2026**
