-- Esquema para Tienda MVP (SQLite) - VERSIÓN 2.0 CON INVENTARIO COMPLETO
-- Usuarios
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  role VARCHAR(20) NOT NULL,
  estado BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Almacenes
CREATE TABLE IF NOT EXISTS almacenes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre VARCHAR(150) NOT NULL,
  ubicacion VARCHAR(255),
  es_principal BOOLEAN DEFAULT 0,
  estado BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categorías
CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  categoria_padre_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE,
  descripcion TEXT,
  orden INTEGER DEFAULT 0,
  estado BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre VARCHAR(200) NOT NULL,
  contacto VARCHAR(150),
  email VARCHAR(200),
  telefono VARCHAR(20),
  pais VARCHAR(100),
  condiciones_pago VARCHAR(200),
  lead_time_dias INTEGER DEFAULT 0,
  estado BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Productos
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre VARCHAR(200) NOT NULL,
  codigo_interno VARCHAR(100) UNIQUE NOT NULL,
  categoria_id INTEGER REFERENCES categorias(id),
  descripcion TEXT,
  precio_costo NUMERIC(12,2) NOT NULL DEFAULT 0,
  precio_venta NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_minimo INTEGER DEFAULT 5,
  stock_maximo INTEGER,
  requiere_lote BOOLEAN DEFAULT 1,
  unidad_medida VARCHAR(20) DEFAULT 'ud',
  estado BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Relación Producto-Proveedor
CREATE TABLE IF NOT EXISTS producto_proveedor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  proveedor_id INTEGER NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  precio_compra NUMERIC(12,2),
  cantidad_minima INTEGER DEFAULT 1,
  plazo_entrega INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lotes
CREATE TABLE IF NOT EXISTS lots (
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

-- Movimientos de stock (Auditoría)
CREATE TABLE IF NOT EXISTS stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL REFERENCES products(id),
  lote_id INTEGER REFERENCES lots(id),
  almacen_id INTEGER REFERENCES almacenes(id),
  tipo VARCHAR(30) NOT NULL,
  cantidad INTEGER NOT NULL,
  cantidad_anterior INTEGER,
  cantidad_nueva INTEGER,
  usuario_id INTEGER REFERENCES users(id),
  motivo TEXT,
  referencia VARCHAR(200),
  documento_adjunto VARCHAR(255),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Historial de precios
CREATE TABLE IF NOT EXISTS precio_historial (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  precio_costo_anterior NUMERIC(12,2),
  precio_costo_nuevo NUMERIC(12,2),
  precio_venta_anterior NUMERIC(12,2),
  precio_venta_nuevo NUMERIC(12,2),
  usuario_id INTEGER REFERENCES users(id),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Alertas
CREATE TABLE IF NOT EXISTS alertas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  producto_id INTEGER NOT NULL REFERENCES products(id),
  tipo VARCHAR(50) NOT NULL,
  descripcion TEXT,
  severidad VARCHAR(20),
  cantidad_actual INTEGER,
  valor_referencia INTEGER,
  estado VARCHAR(20) DEFAULT 'pendiente',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_resolucion DATETIME
);

-- Ventas
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_venta VARCHAR(50) UNIQUE,
  vendedor_id INTEGER NOT NULL REFERENCES users(id),
  almacen_id INTEGER REFERENCES almacenes(id),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  total NUMERIC(12,2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'completada'
);

-- Items de venta
CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES products(id),
  cantidad INTEGER NOT NULL,
  precio_unitario NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);

-- Asociación de lotes a items (para auditoría y FIFO)
CREATE TABLE IF NOT EXISTS sale_item_lots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_item_id INTEGER NOT NULL REFERENCES sale_items(id) ON DELETE CASCADE,
  lote_id INTEGER NOT NULL REFERENCES lots(id),
  cantidad INTEGER NOT NULL
);

-- Compras (Entradas de inventario)
CREATE TABLE IF NOT EXISTS compras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_compra VARCHAR(50) UNIQUE,
  proveedor_id INTEGER NOT NULL REFERENCES proveedores(id),
  almacen_id INTEGER NOT NULL REFERENCES almacenes(id),
  usuario_id INTEGER NOT NULL REFERENCES users(id),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  total NUMERIC(12,2),
  estado VARCHAR(20) DEFAULT 'recibida'
);

-- Items de compra
CREATE TABLE IF NOT EXISTS compra_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  compra_id INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES products(id),
  cantidad INTEGER NOT NULL,
  precio_unitario NUMERIC(12,2) NOT NULL,
  lote_id INTEGER REFERENCES lots(id)
);

-- Devoluciones
CREATE TABLE IF NOT EXISTS devoluciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_devolucion VARCHAR(50) UNIQUE,
  tipo VARCHAR(20) NOT NULL,
  referencia_original VARCHAR(100),
  almacen_id INTEGER REFERENCES almacenes(id),
  usuario_id INTEGER REFERENCES users(id),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  motivo TEXT,
  total NUMERIC(12,2)
);

-- Items de devolución
CREATE TABLE IF NOT EXISTS devolucion_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  devolucion_id INTEGER NOT NULL REFERENCES devoluciones(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES products(id),
  cantidad INTEGER NOT NULL,
  precio_unitario NUMERIC(12,2)
);

-- Configuración del sistema
CREATE TABLE IF NOT EXISTS configuracion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) DEFAULT 'string',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id)
);

