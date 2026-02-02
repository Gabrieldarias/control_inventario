# 📦 RESUMEN VISUAL DEL PROYECTO

## 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENTE (NAVEGADOR)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ React 18 (CDN)                                        │  │
│  │ ├── Login                                             │  │
│  │ ├── GestionProductos (CRUD)                          │  │
│  │ ├── GestionLotes (Entrada stock)                     │  │
│  │ ├── Reportes (3 tipos)                               │  │
│  │ └── GestionAlertas (Centro alertas)                  │  │
│  └───────────────────────────────────────────────────────┘  │
│           HTTP/AJAX (axios)                                 │
└─────────────────────────────────────────────────────────────┘
                    ↕️ REQUESTS/RESPONSES
┌─────────────────────────────────────────────────────────────┐
│                   SERVIDOR (Node.js/Express)                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ API REST (20+ endpoints)                              │  │
│  │ ├── /api/inventory/productos/* (CRUD)               │  │
│  │ ├── /api/inventory/lotes/* (Stock)                  │  │
│  │ ├── /api/inventory/alertas/* (Alertas)              │  │
│  │ ├── /api/inventory/reportes/* (Análisis)            │  │
│  │ └── /api/inventory/* (Otros)                         │  │
│  └───────────────────────────────────────────────────────┘  │
│           ↓                                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ SERVICIOS DE NEGOCIO                                  │  │
│  │ ├── inventoryService.js (40+ funciones)             │  │
│  │ ├── CRUD operaciones                                 │  │
│  │ ├── Lógica FIFO                                       │  │
│  │ ├── Generación de alertas                            │  │
│  │ └── Cálculo de reportes                              │  │
│  └───────────────────────────────────────────────────────┘  │
│           ↓                                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ CAPA DE DATOS (Knex.js)                               │  │
│  │ └── Queries optimizadas                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                    ↕️ SQL
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (SQLite)                         │
│  tienda_mvp.db (16 tablas)                                  │
│  ├── users (Autenticación)                                 │
│  ├── products (Catálogo)                                   │
│  ├── categorias (Clasificación)                            │
│  ├── lots (Stock por lote)                                 │
│  ├── stock_movements (Auditoría)                           │
│  ├── alertas (Alertas automáticas)                         │
│  ├── precio_historial (Control precios)                    │
│  ├── proveedores (Gestión proveedores)                     │
│  ├── almacenes (Multi-almacén future)                      │
│  ├── sales, compras, devoluciones (Futuro POS)           │
│  └── ... (y más)                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 FLUJO DE DATOS

### 1️⃣ CREAR PRODUCTO
```
Usuario → Formulario → POST /products → inventoryService.crearProducto()
→ INSERT products → BD ✅ → Respuesta JSON → Tabla actualizada
```

### 2️⃣ AGREGAR STOCK (LOTE)
```
Usuario → Selector producto → Nuevo lote → POST /lotes 
→ inventoryService.crearLote()
→ INSERT lots + INSERT stock_movements → BD ✅
→ Calcular stock_total (SUM lots) → Respuesta → Tabla actualizada
```

### 3️⃣ ALERTAS AUTOMÁTICAS
```
inventoryService.verificarAlertas(producto_id)
→ if (stock ≤ min) → INSERT alertas (stock_bajo)
→ if (stock = 0) → INSERT alertas (agotado)
→ Frontend lee GET /alertas → Muestra en panel 🔔
```

### 4️⃣ REPORTES
```
Usuario selecciona tipo → GET /reportes/stock-actual
→ inventoryService.reporteStockActual()
→ SELECT * products + (SELECT SUM(cantidad) lots) per product
→ Calcula margen, valorización
→ JSON → Renderiza tabla + Opción descargar CSV
```

---

## 🗂️ ESTRUCTURA DE CARPETAS

```
Tienda/
├── backend/
│   ├── src/
│   │   ├── server.js                     (Entrada Express)
│   │   ├── controllers/
│   │   │   └── inventoryController.js    (Handlers HTTP)
│   │   ├── services/
│   │   │   └── inventoryService.js       (Lógica negocio)
│   │   ├── routes/
│   │   │   ├── index.js                  (Router principal)
│   │   │   └── inventoryRoutes.js        (Rutas inventario)
│   │   ├── middleware/
│   │   │   └── auth.js                   (JWT + autorización)
│   │   └── db/
│   │       ├── knex.js                   (Config BD)
│   │       ├── schema.sql                (Esquema)
│   │       ├── init_db.js                (Inicialización)
│   │       ├── reset_db.js               (Reset)
│   │       └── seeds.js                  (Datos ejemplo)
│   ├── tienda_mvp.db                     (BD SQLite)
│   ├── package.json                      (Dependencias)
│   ├── SETUP.bat                         (Setup automatizado)
│   └── run.ps1                           (Script ejecución)
│
├── frontend/
│   ├── app.js                            (Aplicación React completa)
│   ├── styles.css                        (Estilos)
│   └── index.html                        (HTML raíz)
│
├── ESPECIFICACION_FUNCIONAL_INVENTARIO.md (Specs detalladas)
├── README_INVENTARIO.md                  (Guía uso)
├── IMPLEMENTACION_COMPLETADA.md          (Resumen técnico)
└── GUIA_EJECUCION.md                     (Setup y primeros pasos)
```

---

## 🎯 FUNCIONES DE NEGOCIO

### Por Módulo

#### **inventoryService.js** (40+ funciones)
```
PRODUCTOS:
├── crearProducto()
├── actualizarProducto()
├── eliminarProducto()
├── obtenerProducto()
└── listarProductos()

CATEGORÍAS:
├── crearCategoria()
├── actualizarCategoria()
├── eliminarCategoria()
└── listarCategorias()

LOTES:
├── crearLote()
├── listarLotes()
└── obtenerStockTotal()

MOVIMIENTOS:
├── registrarMovimiento()
└── listarMovimientos()

ALERTAS:
├── verificarAlertas()
├── verificarVencimientos()
├── listarAlertas()
└── resolverAlerta()

PRECIOS:
├── actualizarPrecio()
└── obtenerHistorialPrecios()

BÚSQUEDA:
└── buscarProductos()

REPORTES:
├── reporteStockActual()
├── reporteRotacion()
└── reporteValorizacion()

PROVEEDORES:
├── crearProveedor()
├── listarProveedores()
├── asociarProductoProveedor()
└── obtenerProveedoresProducto()

IMPORTACIÓN/EXPORTACIÓN:
├── importarProductos()
└── exportarInventario()
```

---

## 🔐 SEGURIDAD Y ROLES

### Autenticación
```
POST /auth/login {email, password}
↓
Verificar email + password (bcrypt)
↓
Generar JWT token (user.id, user.role)
↓
Cliente almacena en localStorage
↓
Envía en cada request: Authorization: Bearer {token}
```

### Autorización
```
Middleware authenticate:
  ✓ Verifica token válido
  ✓ Extrae usuario
  ✓ Attached a request.user

Middleware authorize(['admin']):
  ✓ Verifica role en request.user
  ✓ Si role no coincide → 403 Forbidden
```

### Roles
- **Admin:** Acceso completo (CRUD, reportes, alertas)
- **Vendedor:** Solo lectura (productos, alertas, no edita)

---

## 📈 CÁLCULOS IMPLEMENTADOS

### Stock Total
```javascript
SELECT SUM(cantidad_actual) FROM lots 
WHERE producto_id = ? AND estado = 'activo'
```

### Margen
```javascript
margen = (precio_venta - precio_costo) / precio_costo * 100
```

### Rotación (días)
```javascript
días_en_stock = (hoy - fecha_ingreso).days
```

### FIFO Descuento
```
1. Buscar lotes ordenados por vencimiento ASC
2. Restar cantidad de primer lote
3. Si se agota, marcar como consumido
4. Mover a siguiente lote
5. Registrar en sale_item_lots
```

### Valorización
```javascript
valor_total = SUM(lote.cantidad * lote.costo_unitario)
```

---

## 🚀 PASOS DE EJECUCIÓN

```
1. npm install
   └─ Descarga dependencias (Express, bcrypt, knex, sqlite3, etc)

2. npm run reset-db
   └─ Elimina BD anterior
   └─ Ejecuta schema.sql (16 tablas)
   └─ Ejecuta seeds.js (datos ejemplo)
   └─ Crea tienda_mvp.db

3. npm run dev
   └─ Inicia Express en puerto 3001
   └─ Sirve React estático desde /frontend
   └─ Escucha requests en /api

4. http://localhost:3001
   └─ Carga index.html + app.js
   └─ React renderiza componentes
   └─ Usuario hace login
   └─ Accede a módulos según role
```

---

## 📊 TABLAS DE BASE DE DATOS

### products
```
id (PK)
nombre
codigo_interno (UNIQUE)
categoria_id (FK)
descripcion
precio_costo
precio_venta
stock_minimo
stock_maximo
unidad_medida
estado (boolean)
created_at
updated_at
```

### lots
```
id (PK)
producto_id (FK)
numero_referencia
cantidad_inicial
cantidad_actual
fecha_ingreso
fecha_vencimiento
costo_unitario
proveedor_id (FK)
almacen_id (FK)
estado
created_at
```

### stock_movements
```
id (PK)
producto_id (FK)
lote_id (FK nullable)
almacen_id (FK)
tipo (entrada|salida|devolución|ajuste)
cantidad
cantidad_anterior
cantidad_nueva
usuario_id (FK)
motivo
referencia
documento_adjunto
fecha
```

### alertas
```
id (PK)
producto_id (FK)
tipo
descripcion
severidad
cantidad_actual
valor_referencia
estado (pendiente|resuelto)
fecha_creacion
fecha_resolucion
```

---

## 🎨 INTERFAZ DE USUARIO

### Pantalla Principal
```
┌─────────────────────────────────────────────┐
│  🏪 Sistema Tienda MVP - Gestión Inventario  │  NAVBAR
│  Usuario: Admin@example.com  [Cerrar sesión] │
├─────────────────────────────────────────────┤
│ 📦 Productos | 📋 Lotes | 📊 Reportes | 🔔 │ TABS
├─────────────────────────────────────────────┤
│ CONTENIDO DE TAB ACTIVO                     │
│ ┌─────────────────────────────────────────┐ │
│ │ [Buscar] [Filtrar por categoría]        │ │
│ ├─────────────────────────────────────────┤ │
│ │ Código | Nombre | Categ | P.Costo | ... │ │ TABLA
│ │ FILT   | Filtro | Auto  | $150    | ... │ │
│ │ ACEITE | Aceite | Auto  | $200    | ... │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Colores
- Primario: #667eea (Púrpura)
- Secundario: #764ba2 (Púrpura oscuro)
- Success: #28a745 (Verde)
- Danger: #dc3545 (Rojo)
- Warning: #ffc107 (Amarillo)

---

## 📱 Responsividad

```
Desktop (> 1200px)
├─ Navegación completa
├─ Tablas normales
└─ Botones en fila

Tablet (768px - 1200px)
├─ Navegación adaptada
├─ Tabla con scroll horizontal
└─ Botones envueltos

Mobile (< 768px)
├─ Menú hamburguesa
├─ Tabla stackeada
└─ Botones en columna
```

---

## 🔄 CICLO COMPLETO: Usuario agrega Producto

```
┌──────────┐
│  Usuario │
│  (Admin) │
└─────┬────┘
      │ 1. Hace clic "+ Nuevo Producto"
      ↓
┌────────────────┐
│  Modal abierto │
└─────┬──────────┘
      │ 2. Ingresa datos (nombre, código, precios)
      ↓
┌──────────────────────┐
│ Validación Frontend  │
│ - Campos requeridos  │
│ - Formato correcto   │
└─────┬────────────────┘
      │ 3. POST /api/inventory/productos
      ↓
┌─────────────────────┐
│   Express Server    │
│   Valida JWT token  │
└─────┬───────────────┘
      │ 4. inventoryController.crearProducto()
      ↓
┌──────────────────────┐
│  inventoryService    │
│  .crearProducto()    │
└─────┬────────────────┘
      │ 5. knex INSERT
      ↓
┌─────────────────────┐
│    SQLite BD        │
│  INSERT products    │
└─────┬───────────────┘
      │ 6. Devuelve ID nuevo
      ↓
┌──────────────────────┐
│  Controller responde │
│  JSON con producto   │
└─────┬────────────────┘
      │ 7. React actualiza state
      ↓
┌──────────────────────┐
│  Tabla se renderiza  │
│  con nuevo producto  │
└──────────────────────┘
      ✅ Éxito
```

---

## 📞 ENDPOINTS COMPLETOS

```
PRODUCTOS
  POST   /api/inventory/productos
  GET    /api/inventory/productos
  GET    /api/inventory/productos/:id
  PUT    /api/inventory/productos/:id
  DELETE /api/inventory/productos/:id

LOTES
  POST   /api/inventory/lotes
  GET    /api/inventory/lotes/:producto_id

MOVIMIENTOS
  POST   /api/inventory/movimientos
  GET    /api/inventory/movimientos

ALERTAS
  GET    /api/inventory/alertas
  PUT    /api/inventory/alertas/:id/resolver

PRECIOS
  PUT    /api/inventory/productos/:id/precio
  GET    /api/inventory/productos/:id/historial-precios

REPORTES
  GET    /api/inventory/reportes/stock-actual
  GET    /api/inventory/reportes/rotacion
  GET    /api/inventory/reportes/valorizacion

+ Más endpoints...
```

---

**✨ Documentación Visual Completa**  
**Sistema Tienda MVP v2.0**
