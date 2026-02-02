# 🗄️ DIAGRAMA ER - BASE DE DATOS TIENDA MVP

## Relaciones de Tablas

```
                        ┌─────────────┐
                        │   USERS     │
                        │   (roles)   │
                        └──────┬──────┘
                               │
                   ┌───────────┼───────────┐
                   │           │           │
                   ▼           ▼           ▼
            ┌──────────┐  ┌──────────┐ ┌─────────────┐
            │ PRODUCTS │  │MOVEMENTS │ │  ALERTAS    │
            └────┬─────┘  └──────────┘ └─────────────┘
                 │
        ┌────────┼────────┐
        │        │        │
        ▼        ▼        ▼
    ┌────────┐ ┌────────┐ ┌────────────┐
    │ LOTS   │ │PRECIO_ │ │CATEGORIAS  │
    │(FIFO)  │ │HISTOR  │ │            │
    └────┬───┘ │IAL     │ └────────────┘
         │     └────────┘
    ┌────┼────────┐
    │    │        │
    ▼    ▼        ▼
┌────────────┐ ┌──────────────┐ ┌─────────────┐
│SALES      │ │COMPRAS       │ │DEVOLUCIONES │
│(Futuro)   │ │(Futuro)      │ │(Futuro)     │
└───────┬───┘ └──────┬───────┘ └─────┬───────┘
        │           │               │
        ▼           ▼               ▼
┌──────────────┐ ┌───────────┐ ┌──────────────┐
│SALE_ITEMS    │ │COMPRA_    │ │DEVOLUCION_   │
│              │ │ITEMS      │ │ITEMS         │
└──────┬───────┘ └─────┬─────┘ └──────────────┘
       │               │
       │               │
       └───────┬───────┘
              ▼
    ┌──────────────────┐
    │SALE_ITEM_LOTS    │ (FIFO Tracking)
    └──────────────────┘
```

---

## Tablas Normalizadas (3NF)

### 1. USERS (Autenticación y Roles)
```
users
├─ id (PK)
├─ nombre
├─ email (UNIQUE)
├─ password_hash
├─ role (admin|vendedor)
├─ estado (boolean)
├─ created_at
└─ updated_at

Índices: email (UNIQUE), role
```

### 2. CATEGORIAS (Clasificación jerárquica)
```
categorias
├─ id (PK)
├─ nombre (UNIQUE)
├─ categoria_padre_id (FK → categorias.id, nullable)
├─ descripcion
├─ orden (para sorting)
├─ estado (boolean)
└─ created_at

Relación: Autorreferencial (subcategorías)
```

### 3. ALMACENES (Multi-almacén)
```
almacenes
├─ id (PK)
├─ nombre
├─ ubicacion
├─ es_principal (boolean)
├─ estado (boolean)
└─ created_at
```

### 4. PROVEEDORES (Gestión de supply)
```
proveedores
├─ id (PK)
├─ nombre
├─ contacto
├─ email
├─ telefono
├─ pais
├─ condiciones_pago
├─ lead_time_dias
├─ estado (boolean)
└─ created_at
```

### 5. PRODUCTS (Catálogo)
```
products ⬅️ NÚCLEO DEL SISTEMA
├─ id (PK)
├─ nombre
├─ codigo_interno (UNIQUE)
├─ categoria_id (FK → categorias.id)
├─ descripcion
├─ precio_costo (DECIMAL)
├─ precio_venta (DECIMAL)
├─ stock_minimo (INT)
├─ stock_maximo (INT, nullable)
├─ requiere_lote (boolean)
├─ unidad_medida
├─ estado (boolean)
├─ created_at
└─ updated_at

Índices: codigo_interno (UNIQUE), categoria_id, estado
```

### 6. PRODUCTO_PROVEEDOR (Relación M:N)
```
producto_proveedor
├─ id (PK)
├─ producto_id (FK → products.id)
├─ proveedor_id (FK → proveedores.id)
├─ precio_compra (DECIMAL)
├─ cantidad_minima (INT)
├─ plazo_entrega (INT, nullable)
└─ created_at

Índices: (producto_id, proveedor_id) UNIQUE
```

### 7. LOTS (Gestión FIFO)
```
lots ⬅️ NÚCLEO DEL SISTEMA
├─ id (PK)
├─ producto_id (FK → products.id)
├─ numero_referencia
├─ cantidad_inicial (INT)
├─ cantidad_actual (INT) ⬅️ Se actualiza en movimientos
├─ fecha_ingreso (DATETIME)
├─ fecha_vencimiento (DATE, nullable)
├─ costo_unitario (DECIMAL)
├─ proveedor_id (FK → proveedores.id, nullable)
├─ almacen_id (FK → almacenes.id)
├─ estado (activo|consumido)
└─ created_at

Índices: producto_id, almacen_id, fecha_vencimiento
```

### 8. STOCK_MOVEMENTS (Auditoría completa)
```
stock_movements ⬅️ AUDITORÍA (APPEND-ONLY)
├─ id (PK)
├─ producto_id (FK → products.id)
├─ lote_id (FK → lots.id, nullable)
├─ almacen_id (FK → almacenes.id)
├─ tipo (entrada|salida|devolución|ajuste)
├─ cantidad (cantidad movida)
├─ cantidad_anterior (stock antes)
├─ cantidad_nueva (stock después)
├─ usuario_id (FK → users.id, nullable)
├─ motivo (TEXT)
├─ referencia (ej: número de venta)
├─ documento_adjunto (path imagen, nullable)
└─ fecha (DATETIME, auto)

Índices: producto_id, fecha, tipo, usuario_id
Restricción: NUNCA se actualiza/elimina (auditoría)
```

### 9. PRECIO_HISTORIAL (Seguimiento de precios)
```
precio_historial ⬅️ HISTORIAL (APPEND-ONLY)
├─ id (PK)
├─ producto_id (FK → products.id)
├─ precio_costo_anterior (DECIMAL)
├─ precio_costo_nuevo (DECIMAL)
├─ precio_venta_anterior (DECIMAL)
├─ precio_venta_nuevo (DECIMAL)
├─ usuario_id (FK → users.id, nullable)
└─ fecha (DATETIME, auto)

Restricción: NUNCA se modifica (auditoría)
```

### 10. ALERTAS (Sistema de alertas)
```
alertas
├─ id (PK)
├─ producto_id (FK → products.id)
├─ tipo (stock_bajo|agotado|proximo_vencer|maximo_excedido)
├─ descripcion
├─ severidad (baja|media|alta)
├─ cantidad_actual (INT)
├─ valor_referencia (INT, ej: stock_minimo)
├─ estado (pendiente|resuelto)
├─ fecha_creacion (DATETIME, auto)
└─ fecha_resolucion (DATETIME, nullable)

Índices: producto_id, estado, tipo
```

### 11. SALES (Ventas presenciales)
```
sales
├─ id (PK)
├─ numero_venta (UNIQUE)
├─ vendedor_id (FK → users.id)
├─ almacen_id (FK → almacenes.id, nullable)
├─ fecha (DATETIME, auto)
├─ total (DECIMAL)
└─ estado (completada|cancelada)

Índices: vendedor_id, fecha
```

### 12. SALE_ITEMS (Detalle de ventas)
```
sale_items
├─ id (PK)
├─ sale_id (FK → sales.id)
├─ producto_id (FK → products.id)
├─ cantidad (INT)
├─ precio_unitario (DECIMAL)
└─ subtotal (DECIMAL)

Índices: sale_id, producto_id
```

### 13. SALE_ITEM_LOTS (FIFO Tracking en ventas)
```
sale_item_lots ⬅️ AUDITORÍA DE FIFO
├─ id (PK)
├─ sale_item_id (FK → sale_items.id)
├─ lote_id (FK → lots.id)
└─ cantidad (INT, cantidad consumida de este lote)

Restricción: Para trazar qué lote se usó en cada venta
```

### 14. COMPRAS (Compras a proveedores - Futuro)
```
compras
├─ id (PK)
├─ numero_compra (UNIQUE)
├─ proveedor_id (FK → proveedores.id)
├─ almacen_id (FK → almacenes.id)
├─ usuario_id (FK → users.id)
├─ fecha (DATETIME, auto)
├─ total (DECIMAL)
└─ estado (pendiente|recibida|cancelada)
```

### 15. COMPRA_ITEMS (Detalle de compras)
```
compra_items
├─ id (PK)
├─ compra_id (FK → compras.id)
├─ producto_id (FK → products.id)
├─ cantidad (INT)
├─ precio_unitario (DECIMAL)
└─ lote_id (FK → lots.id, nullable)
```

### 16. DEVOLUCIONES (Devoluciones entrada/salida)
```
devoluciones
├─ id (PK)
├─ numero_devolucion (UNIQUE)
├─ tipo (cliente|proveedor)
├─ referencia_original (ej: número de venta)
├─ almacen_id (FK → almacenes.id, nullable)
├─ usuario_id (FK → users.id)
├─ fecha (DATETIME, auto)
├─ motivo (TEXT)
└─ total (DECIMAL, nullable)

devolucion_items
├─ id (PK)
├─ devolucion_id (FK → devoluciones.id)
├─ producto_id (FK → products.id)
├─ cantidad (INT)
└─ precio_unitario (DECIMAL)
```

---

## Queries Principales Implementadas

### 1. Stock Total de un Producto
```sql
SELECT SUM(cantidad_actual) as stock_total
FROM lots
WHERE producto_id = ? AND estado = 'activo'
```

### 2. Detectar Stock Bajo
```sql
SELECT p.id, p.nombre, SUM(l.cantidad_actual) as stock
FROM products p
LEFT JOIN lots l ON p.id = l.producto_id AND l.estado = 'activo'
GROUP BY p.id
HAVING stock <= p.stock_minimo
```

### 3. Lotes Próximos a Vencer
```sql
SELECT *
FROM lots
WHERE estado = 'activo'
  AND fecha_vencimiento IS NOT NULL
  AND DATE(fecha_vencimiento) BETWEEN DATE('now') AND DATE('now', '+7 days')
```

### 4. Reporte de Rotación
```sql
SELECT 
  p.id,
  p.nombre,
  SUM(si.cantidad) as vendido,
  SUM(si.cantidad) / CAST((strftime('%j', 'now') - strftime('%j', MAX(s.fecha))) AS FLOAT) as velocidad
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
JOIN products p ON si.producto_id = p.id
WHERE DATE(s.fecha) >= DATE('now', '-30 days')
GROUP BY p.id
```

### 5. Valorización de Inventario
```sql
SELECT 
  p.nombre,
  SUM(l.cantidad_actual * l.costo_unitario) as valor_total
FROM products p
LEFT JOIN lots l ON p.id = l.producto_id AND l.estado = 'activo'
GROUP BY p.id
```

### 6. FIFO - Consumir Stock
```sql
SELECT *
FROM lots
WHERE producto_id = ?
  AND estado = 'activo'
ORDER BY fecha_vencimiento ASC, created_at ASC
LIMIT 1
```

---

## Restricciones y Reglas

### Integridad Referencial
- products.categoria_id → categorias.id (CASCADE)
- lots.producto_id → products.id (CASCADE)
- stock_movements.producto_id → products.id (NO ACTION)
- alertas.producto_id → products.id (NO ACTION)

### Restricciones de Negocio
1. **Código Interno:** UNIQUE por producto
2. **Stock:** No puede ser negativo
3. **Precio Costo < Precio Venta:** Validación en aplicación
4. **Auditoría:** stock_movements es append-only
5. **FIFO:** Siempre consumir lote con vencimiento más cercano
6. **Alertas:** Auto-generadas, no edibles (solo lectura)

### Índices para Performance
```sql
-- Búsquedas comunes
CREATE INDEX idx_products_codigo ON products(codigo_interno);
CREATE INDEX idx_products_categoria ON products(categoria_id);
CREATE INDEX idx_lots_producto ON lots(producto_id);
CREATE INDEX idx_movements_producto ON stock_movements(producto_id);
CREATE INDEX idx_movements_fecha ON stock_movements(fecha);
CREATE INDEX idx_alertas_producto ON alertas(producto_id);
CREATE INDEX idx_alertas_estado ON alertas(estado);
```

---

## Normalización

### 1NF (Primera Forma Normal)
✅ Todos los valores atómicos
✅ Sin repetición de grupos

### 2NF (Segunda Forma Normal)
✅ Cumple 1NF
✅ Todo atributo no clave depende de la clave completa

### 3NF (Tercera Forma Normal)
✅ Cumple 2NF
✅ Sin dependencias transitivas
✅ Tablas de dimensión separadas (categorías, proveedores, almacenes)

---

## Integridad de Datos

### Constraints Implementados
```sql
-- PRIMARY KEY
ALTER TABLE products ADD CONSTRAINT pk_products PRIMARY KEY (id);

-- UNIQUE
ALTER TABLE products ADD CONSTRAINT uk_codigo UNIQUE (codigo_interno);
ALTER TABLE categorias ADD CONSTRAINT uk_nombre UNIQUE (nombre);

-- FOREIGN KEY
ALTER TABLE lots ADD CONSTRAINT fk_producto 
  FOREIGN KEY (producto_id) REFERENCES products(id) ON DELETE CASCADE;

-- CHECK (en aplicación)
CHECK (precio_venta >= precio_costo)
CHECK (stock_minimo >= 0)
CHECK (cantidad_actual >= 0)
```

---

**Diseño de BD profesional, escalable y auditable**

Sistema Tienda MVP v2.0
