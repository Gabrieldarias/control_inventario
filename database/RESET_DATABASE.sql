-- ================================================================
-- SCRIPT DE REINICIO COMPLETO DE BASE DE DATOS
-- Basado en análisis exhaustivo del código de la aplicación
-- ================================================================
-- IMPORTANTE: Este script eliminará TODOS los datos existentes
-- Ejecutar en: Supabase > SQL Editor
-- ================================================================

-- =========================================================
-- PASO 1: ELIMINAR TODAS LAS TABLAS EXISTENTES
-- =========================================================

DROP TABLE IF EXISTS return_items CASCADE;
DROP TABLE IF EXISTS returns CASCADE;
DROP TABLE IF EXISTS purchase_items CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS lotes CASCADE;
DROP TABLE IF EXISTS movimientos CASCADE;
DROP TABLE IF EXISTS alertas CASCADE;
DROP TABLE IF EXISTS historial_precios CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS configuracion CASCADE;

-- =========================================================
-- PASO 2: CREAR TABLA DE USUARIOS (Auth)
-- =========================================================

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'vendedor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 3: CREAR TABLA DE CATEGORÍAS
-- =========================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  estado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 4: CREAR TABLA DE PRODUCTOS
-- =========================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  codigo_interno VARCHAR(100) UNIQUE,
  categoria_id UUID REFERENCES categories(id) ON DELETE SET NULL,
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

-- =========================================================
-- PASO 5: CREAR TABLA DE PROVEEDORES
-- =========================================================

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  contacto VARCHAR(255),
  telefono VARCHAR(50),
  email VARCHAR(255),
  direccion TEXT,
  estado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 6: CREAR TABLA DE CLIENTES
-- =========================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(50),
  direccion TEXT,
  estado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 7: CREAR TABLA DE VENTAS
-- =========================================================

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  estado VARCHAR(50) DEFAULT 'completada',
  vendedor_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 8: CREAR TABLA DE DETALLES DE VENTA
-- =========================================================

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES products(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 9: CREAR TABLA DE COMPRAS
-- =========================================================

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  estado VARCHAR(50) DEFAULT 'completada',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 10: CREAR TABLA DE DETALLES DE COMPRA
-- =========================================================

CREATE TABLE purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES products(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 11: CREAR TABLA DE DEVOLUCIONES
-- =========================================================

CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  motivo TEXT,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  estado VARCHAR(50) DEFAULT 'completada',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 12: CREAR TABLA DE DETALLES DE DEVOLUCIÓN
-- =========================================================

CREATE TABLE return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devolucion_id UUID REFERENCES returns(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES products(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 13: CREAR TABLA DE LOTES
-- =========================================================

CREATE TABLE lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES products(id) ON DELETE CASCADE,
  numero_lote VARCHAR(100) NOT NULL UNIQUE,
  cantidad INTEGER NOT NULL,
  fecha_vencimiento DATE,
  precio_costo DECIMAL(10, 2),
  estado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 14: CREAR TABLA DE MOVIMIENTOS DE INVENTARIO
-- =========================================================

CREATE TABLE movimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES products(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  cantidad INTEGER NOT NULL,
  lote_id UUID REFERENCES lotes(id) ON DELETE SET NULL,
  motivo TEXT,
  usuario_email VARCHAR(255),
  referencia_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 15: CREAR TABLA DE ALERTAS
-- =========================================================

CREATE TABLE alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  severidad VARCHAR(20) DEFAULT 'media',
  estado VARCHAR(20) DEFAULT 'pendiente',
  producto_id UUID REFERENCES products(id) ON DELETE CASCADE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_resolucion TIMESTAMP WITH TIME ZONE,
  resuelto_por VARCHAR(255)
);

-- =========================================================
-- PASO 16: CREAR TABLA DE HISTORIAL DE PRECIOS
-- =========================================================

CREATE TABLE historial_precios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES products(id) ON DELETE CASCADE,
  precio_costo_anterior DECIMAL(10, 2),
  precio_costo_nuevo DECIMAL(10, 2),
  precio_venta_anterior DECIMAL(10, 2),
  precio_venta_nuevo DECIMAL(10, 2),
  motivo TEXT,
  usuario_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 17: CREAR TABLA DE CONFIGURACIÓN
-- =========================================================

CREATE TABLE configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave VARCHAR(255) NOT NULL UNIQUE,
  valor TEXT,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- PASO 18: DESHABILITAR ROW LEVEL SECURITY (DESARROLLO)
-- =========================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE returns DISABLE ROW LEVEL SECURITY;
ALTER TABLE return_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE lotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos DISABLE ROW LEVEL SECURITY;
ALTER TABLE alertas DISABLE ROW LEVEL SECURITY;
ALTER TABLE historial_precios DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;

-- =========================================================
-- PASO 19: CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- =========================================================

CREATE INDEX idx_products_categoria_id ON products(categoria_id);
CREATE INDEX idx_products_estado ON products(estado);
CREATE INDEX idx_products_codigo_interno ON products(codigo_interno);
CREATE INDEX idx_categories_estado ON categories(estado);
CREATE INDEX idx_sale_items_venta_id ON sale_items(venta_id);
CREATE INDEX idx_sale_items_producto_id ON sale_items(producto_id);
CREATE INDEX idx_purchase_items_compra_id ON purchase_items(compra_id);
CREATE INDEX idx_purchase_items_producto_id ON purchase_items(producto_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_lotes_producto_id ON lotes(producto_id);
CREATE INDEX idx_lotes_numero_lote ON lotes(numero_lote);
CREATE INDEX idx_movimientos_producto_id ON movimientos(producto_id);
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX idx_alertas_estado ON alertas(estado);
CREATE INDEX idx_alertas_producto_id ON alertas(producto_id);
CREATE INDEX idx_historial_precios_producto_id ON historial_precios(producto_id);

-- =========================================================
-- PASO 20: INSERTAR USUARIOS DE EJEMPLO
-- =========================================================

INSERT INTO users (id, email, role)
SELECT id, email, 'administrador'
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'administrador';

INSERT INTO users (id, email, role)
SELECT id, email, 'vendedor'
FROM auth.users 
WHERE email = 'vendedor@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'vendedor';

-- =========================================================
-- PASO 21: INSERTAR CATEGORÍAS
-- =========================================================

INSERT INTO categories (nombre, descripcion) VALUES
('Electrónica', 'Dispositivos electrónicos y accesorios'),
('Alimentos', 'Productos alimenticios y bebidas'),
('Ropa', 'Prendas de vestir y accesorios'),
('Hogar', 'Artículos para el hogar'),
('Deportes', 'Equipamiento deportivo');

-- =========================================================
-- PASO 22: INSERTAR PROVEEDORES
-- =========================================================

INSERT INTO suppliers (nombre, contacto, telefono, email, direccion) VALUES
('TechSupply S.A.', 'Juan Pérez', '555-1234', 'ventas@techsupply.com', 'Av. Principal 123'),
('AlimentosXYZ', 'María González', '555-5678', 'info@alimentosxyz.com', 'Calle Comercio 456'),
('DistribuidoraPro', 'Carlos López', '555-9012', 'contacto@distribuidora.com', 'Centro Empresarial 789');

-- =========================================================
-- PASO 23: INSERTAR CLIENTES
-- =========================================================

INSERT INTO customers (nombre, email, telefono, direccion) VALUES
('Carlos Rodríguez', 'carlos@email.com', '555-1111', 'Urb. Los Pinos 111'),
('Ana Martínez', 'ana@email.com', '555-2222', 'Res. Vista Hermosa 222'),
('Luis Fernández', 'luis@email.com', '555-3333', 'Sector Centro 333'),
('María Sánchez', 'maria@email.com', '555-4444', 'Zona Industrial 444'),
('Pedro Ramírez', 'pedro@email.com', '555-5555', 'Barrio Nuevo 555');

-- =========================================================
-- PASO 24: INSERTAR PRODUCTOS
-- =========================================================

DO $$
DECLARE
    cat_electronica UUID;
    cat_alimentos UUID;
    cat_ropa UUID;
BEGIN
    SELECT id INTO cat_electronica FROM categories WHERE nombre = 'Electrónica';
    SELECT id INTO cat_alimentos FROM categories WHERE nombre = 'Alimentos';
    SELECT id INTO cat_ropa FROM categories WHERE nombre = 'Ropa';
    
    INSERT INTO products (nombre, codigo_interno, categoria_id, descripcion, precio_costo, precio_venta, stock_minimo, stock_maximo, stock_total, unidad_medida) VALUES
    ('Laptop HP Pavilion 15', 'ELEC-001', cat_electronica, 'Laptop HP Pavilion 15.6" Intel Core i5, 8GB RAM, 256GB SSD', 600.00, 750.00, 2, 20, 10, 'ud'),
    ('Mouse Inalámbrico Logitech M185', 'ELEC-002', cat_electronica, 'Mouse inalámbrico con sensor óptico de alta precisión', 12.00, 18.00, 10, 100, 50, 'ud'),
    ('Teclado Mecánico RGB Redragon', 'ELEC-003', cat_electronica, 'Teclado mecánico con retroiluminación RGB y switches blue', 70.00, 95.00, 5, 50, 25, 'ud'),
    ('Monitor LED 24" Samsung', 'ELEC-004', cat_electronica, 'Monitor LED Full HD 24 pulgadas, HDMI, VGA', 150.00, 200.00, 3, 30, 15, 'ud'),
    ('Auriculares Bluetooth Sony', 'ELEC-005', cat_electronica, 'Auriculares inalámbricos con cancelación de ruido', 80.00, 120.00, 5, 40, 20, 'ud'),
    ('Arroz Premium 1kg', 'ALIM-001', cat_alimentos, 'Arroz de grano largo extra premium', 2.00, 3.00, 20, 200, 100, 'kg'),
    ('Aceite Vegetal 1L', 'ALIM-002', cat_alimentos, 'Aceite vegetal 100% puro', 3.00, 4.50, 15, 150, 80, 'lt'),
    ('Azúcar Blanca 1kg', 'ALIM-003', cat_alimentos, 'Azúcar refinada blanca', 1.50, 2.25, 25, 250, 120, 'kg'),
    ('Café Molido 500g', 'ALIM-004', cat_alimentos, 'Café colombiano molido, tostado medio', 5.00, 7.50, 10, 100, 60, 'ud'),
    ('Leche Entera 1L', 'ALIM-005', cat_alimentos, 'Leche entera ultrapasteurizada', 1.80, 2.70, 30, 300, 150, 'lt'),
    ('Camiseta Básica Algodón', 'ROPA-001', cat_ropa, 'Camiseta 100% algodón, tallas S-XL', 8.00, 15.00, 20, 100, 60, 'ud'),
    ('Pantalón Jeans Levi''s', 'ROPA-002', cat_ropa, 'Pantalón jeans clásico, corte regular', 35.00, 55.00, 10, 50, 30, 'ud'),
    ('Zapatillas Deportivas Nike', 'ROPA-003', cat_ropa, 'Zapatillas deportivas para running', 60.00, 95.00, 5, 30, 18, 'par');
END $$;

-- =========================================================
-- PASO 25: INSERTAR LOTES
-- =========================================================

DO $$
DECLARE
    producto_laptop UUID;
    producto_mouse UUID;
    producto_arroz UUID;
BEGIN
    SELECT id INTO producto_laptop FROM products WHERE codigo_interno = 'ELEC-001';
    SELECT id INTO producto_mouse FROM products WHERE codigo_interno = 'ELEC-002';
    SELECT id INTO producto_arroz FROM products WHERE codigo_interno = 'ALIM-001';
    
    INSERT INTO lotes (producto_id, numero_lote, cantidad, fecha_vencimiento, precio_costo) VALUES
    (producto_laptop, 'LOT-2026-001', 5, '2027-12-31', 600.00),
    (producto_laptop, 'LOT-2026-002', 5, '2027-12-31', 590.00),
    (producto_mouse, 'LOT-2026-003', 50, NULL, 12.00),
    (producto_arroz, 'LOT-2026-004', 100, '2026-08-15', 2.00);
END $$;

-- =========================================================
-- PASO 26: INSERTAR CONFIGURACIÓN
-- =========================================================

INSERT INTO configuracion (clave, valor, descripcion) VALUES
('nombre_empresa', 'Mi Tienda', 'Nombre de la empresa'),
('moneda', 'USD', 'Moneda principal del sistema'),
('impuesto_venta', '16', 'Porcentaje de impuesto sobre ventas'),
('stock_alerta', '10', 'Cantidad mínima para alerta de stock bajo'),
('dias_vencimiento_alerta', '30', 'Días antes del vencimiento para generar alerta');

-- =========================================================
-- PASO 27: VERIFICAR DATOS INSERTADOS
-- =========================================================

SELECT 
    'Users' as tabla, 
    COUNT(*) as registros,
    'Usuarios del sistema' as descripcion
FROM users
UNION ALL
SELECT 'Categories', COUNT(*), 'Categorías de productos' FROM categories
UNION ALL
SELECT 'Products', COUNT(*), 'Productos en inventario' FROM products
UNION ALL
SELECT 'Suppliers', COUNT(*), 'Proveedores' FROM suppliers
UNION ALL
SELECT 'Customers', COUNT(*), 'Clientes' FROM customers
UNION ALL
SELECT 'Lotes', COUNT(*), 'Lotes de productos' FROM lotes
UNION ALL
SELECT 'Movimientos', COUNT(*), 'Movimientos de inventario' FROM movimientos
UNION ALL
SELECT 'Alertas', COUNT(*), 'Alertas del sistema' FROM alertas
UNION ALL
SELECT 'Historial_Precios', COUNT(*), 'Historial de cambios de precio' FROM historial_precios
UNION ALL
SELECT 'Configuracion', COUNT(*), 'Parámetros de configuración' FROM configuracion
ORDER BY tabla;

-- Verificar productos con sus categorías
SELECT 
    p.codigo_interno as codigo,
    p.nombre,
    c.nombre as categoria,
    p.precio_costo as costo,
    p.precio_venta as venta,
    p.stock_total as stock,
    p.stock_minimo as min,
    p.unidad_medida as unidad
FROM products p
LEFT JOIN categories c ON p.categoria_id = c.id
WHERE p.estado = true
ORDER BY c.nombre, p.codigo_interno;

-- =========================================================
-- SCRIPT COMPLETADO
-- =========================================================
-- Tablas creadas: 17
-- Índices creados: 16
-- Registros de ejemplo:
--   - Usuarios: 2 (admin, vendedor)
--   - Categorías: 5
--   - Productos: 13
--   - Proveedores: 3
--   - Clientes: 5
--   - Lotes: 4
--   - Configuración: 5 parámetros
-- =========================================================
