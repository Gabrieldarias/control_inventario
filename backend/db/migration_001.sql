-- Script de migración: Eliminar fecha_vencimiento y agregar configuración

-- 1. Crear tabla de configuración
CREATE TABLE IF NOT EXISTS configuracion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) DEFAULT 'string',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id)
);

-- 2. Insertar configuración por defecto
INSERT OR IGNORE INTO configuracion (clave, valor, descripcion, tipo) 
VALUES ('porcentaje_ganancia', '30', 'Porcentaje de ganancia para calcular precio de venta', 'number');

-- 3. Crear tabla lots_new sin fecha_vencimiento
CREATE TABLE IF NOT EXISTS lots_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  numero_referencia VARCHAR(100),
  cantidad_inicial INTEGER NOT NULL,
  cantidad_actual INTEGER NOT NULL,
  fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
  costo_unitario NUMERIC(12,2),
  proveedor_id INTEGER REFERENCES proveedores(id),
  almacen_id INTEGER REFERENCES almacenes(id),
  estado VARCHAR(20) DEFAULT 'activo',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Copiar datos de lots a lots_new (sin fecha_vencimiento)
INSERT INTO lots_new (id, producto_id, numero_referencia, cantidad_inicial, cantidad_actual, fecha_ingreso, costo_unitario, proveedor_id, almacen_id, estado, created_at)
SELECT id, producto_id, numero_referencia, cantidad_inicial, cantidad_actual, fecha_ingreso, costo_unitario, proveedor_id, almacen_id, estado, created_at
FROM lots;

-- 5. Eliminar tabla vieja y renombrar
DROP TABLE lots;
ALTER TABLE lots_new RENAME TO lots;
