# 🔍 AUDITORÍA: CONEXIÓN BASE DE DATOS SUPABASE

## ❌ PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **DESINCRONIZACIÓN TOTAL DE NOMBRES DE COLUMNAS**

El código usa nombres en **ESPAÑOL** pero la base de datos tiene columnas en **INGLÉS**.

---

## 📊 TABLA: `products`

### ✅ Esquema REAL en Supabase:
```sql
id              UUID PRIMARY KEY
sku             VARCHAR(100) UNIQUE
name            VARCHAR(255) NOT NULL
category        VARCHAR(100)
purchase_price  DECIMAL(10, 2)
sale_price      DECIMAL(10, 2)
stock           INTEGER
stock_min       INTEGER
is_active       BOOLEAN
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### ❌ Lo que el CÓDIGO está intentando usar:

**Frontend (`app.js` línea 710-719):**
- `nombre` → ❌ NO EXISTE (debería ser `name`)
- `codigo_interno` → ❌ NO EXISTE (debería ser `sku`)
- `categoria_id` → ❌ NO EXISTE (debería ser `category`)
- `descripcion` → ❌ NO EXISTE (no hay columna description)
- `precio_costo` → ❌ NO EXISTE (debería ser `purchase_price`)
- `precio_venta` → ❌ NO EXISTE (debería ser `sale_price`)
- `stock_minimo` → ❌ NO EXISTE (debería ser `stock_min`)
- `stock_maximo` → ❌ NO EXISTE (no existe esta columna)
- `unidad_medida` → ❌ NO EXISTE (no existe esta columna)
- `stock_total` → ❌ NO EXISTE (debería ser `stock`)

**API (`api/inventory/productos/crear.js`):**
- Mismos errores que el frontend

---

## 📂 TABLA: `categories`

### ✅ Esquema REAL en Supabase:
```sql
id          UUID PRIMARY KEY
name        VARCHAR(255) UNIQUE
description TEXT
estado      BOOLEAN
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### ❌ Lo que el CÓDIGO está intentando usar:
- `nombre` → ❌ NO EXISTE (debería ser `name`)
- `id` → ⚠️ Es UUID pero el código trata como INTEGER

---

## 🚨 PROBLEMAS ESPECÍFICOS

### A. Tipos de datos incompatibles:
1. **category**: En DB es `VARCHAR(100)` pero el código envía `categoria_id INTEGER`
   - La tabla NO tiene relación con `categories`, solo almacena el texto

2. **id**: Todas las tablas usan `UUID` pero el código usa `parseInt()` 

### B. Columnas que NO existen:
- `descripcion` en products
- `stock_maximo` en products
- `unidad_medida` en products
- `requiere_lote` en products
- `stock_total` en products (debería ser `stock`)
- `nombre` en categories (debería ser `name`)

### C. Relaciones mal implementadas:
- `products.category` es VARCHAR, no una FK a `categories.id`
- El frontend intenta usar `categoria_id` como número pero debería ser texto

---

## ✅ SOLUCIONES PROPUESTAS

### OPCIÓN 1: Ajustar la Base de Datos (MÁS RÁPIDO) ⭐

Ejecutar este SQL en Supabase para que coincida con el código:

```sql
-- 1. Eliminar tabla products actual
DROP TABLE IF EXISTS products CASCADE;

-- 2. Recrear con estructura correcta
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  codigo_interno VARCHAR(100) UNIQUE,
  categoria_id UUID REFERENCES categories(id),
  descripcion TEXT,
  precio_costo DECIMAL(10, 2) NOT NULL DEFAULT 0,
  precio_venta DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 5,
  stock_maximo INTEGER DEFAULT 1000,
  stock_total INTEGER NOT NULL DEFAULT 0,
  requiere_lote BOOLEAN NOT NULL DEFAULT false,
  unidad_medida VARCHAR(20) DEFAULT 'ud',
  estado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ajustar categories para usar 'nombre'
ALTER TABLE categories ADD COLUMN IF NOT EXISTS nombre VARCHAR(255);
UPDATE categories SET nombre = name WHERE nombre IS NULL;
ALTER TABLE categories ALTER COLUMN nombre SET NOT NULL;

-- 4. Insertar categorías de ejemplo
INSERT INTO categories (nombre) VALUES
('Electrónica') ON CONFLICT DO NOTHING;
INSERT INTO categories (nombre) VALUES
('Alimentos') ON CONFLICT DO NOTHING;
INSERT INTO categories (nombre) VALUES
('Ropa') ON CONFLICT DO NOTHING;

-- 5. Productos de ejemplo
INSERT INTO products (nombre, codigo_interno, precio_costo, precio_venta, stock_minimo, stock_total) VALUES
('Laptop HP', 'ELEC-001', 600.00, 650.00, 2, 10),
('Mouse Inalámbrico', 'ELEC-002', 12.00, 15.50, 10, 50),
('Teclado Mecánico', 'ELEC-003', 70.00, 85.00, 5, 25),
('Arroz 1kg', 'ALIM-001', 2.00, 2.50, 20, 100),
('Aceite 1L', 'ALIM-002', 3.00, 3.75, 15, 80);

-- 6. Deshabilitar RLS
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
```

### OPCIÓN 2: Ajustar el Código (MÁS SEGURO PERO MÁS TRABAJO)

Modificar todos los archivos para usar los nombres en inglés:
- ✏️ `frontend/app.js` (líneas 710-850)
- ✏️ `api/inventory/productos/crear.js`
- ✏️ `api/inventory/productos/index.js`
- ✏️ `api/inventory/categorias/index.js`
- ✏️ `api/inventory/categorias/crear.js`

---

## 📝 RECOMENDACIÓN FINAL

**✅ SOLUCIÓN RECOMENDADA: OPCIÓN 1** (Ajustar Base de Datos)

**Razones:**
1. ✅ Cambio único en un solo lugar (Supabase SQL Editor)
2. ✅ El código frontend/backend ya está consistente internamente
3. ✅ Menos archivos que modificar
4. ✅ Menos riesgo de introducir bugs
5. ✅ Compatible con la estructura que el código espera

**Desventajas:**
- ⚠️ Perderás los 5 productos actuales (se recrean con el INSERT)
- ⚠️ Nombres en español (no es estándar pero funciona)

---

## 🔐 PREVENCIÓN EN PRODUCCIÓN

### A. Establecer Convención de Nombres:
```
✅ USAR SIEMPRE: snake_case en inglés (recommended)
ó
✅ USAR SIEMPRE: snake_case en español (si el equipo prefiere)

❌ NUNCA MEZCLAR ambos idiomas
```

### B. Validación con TypeScript:
- Definir interfaces/types que reflejen exactamente el schema de Supabase
- Usar generador automático: `supabase gen types typescript`

### C. Testing:
- Tests de integración que validen INSERT/SELECT contra schema real
- CI/CD que corra migraciones antes de deploy

### D. Documentación:
- Mantener archivo `SCHEMA.md` actualizado
- Sincronizar con cada cambio de base de datos

---

## 🎯 ACCIÓN INMEDIATA REQUERIDA

1. Ejecutar el SQL de OPCIÓN 1 en Supabase
2. Verificar que los endpoints funcionen
3. Probar crear/editar productos desde el frontend
4. Decidir estándar de nombres para futuros desarrollos
