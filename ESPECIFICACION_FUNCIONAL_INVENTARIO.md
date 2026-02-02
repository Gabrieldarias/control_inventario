# DOCUMENTO DE ESPECIFICACIÓN FUNCIONAL
## MÓDULO DE INVENTARIO - SISTEMA TIENDA MVP

**Versión:** 1.0  
**Fecha:** 2 de febrero de 2026  
**Estado:** Aprobado para desarrollo

---

## 1. INTRODUCCIÓN

El Módulo de Inventario es el componente central del Sistema Tienda, responsable de gestionar de forma eficiente y segura todas las existencias de productos en el comercio físico. Proporciona herramientas intuitivas para administradores y vendedores, permitiendo control en tiempo real, trazabilidad completa y reportes detallados.

---

## 2. OBJETIVOS DEL MÓDULO

- ✅ Mantener control actualizado del stock en tiempo real
- ✅ Prevenir stockouts mediante alertas automáticas
- ✅ Garantizar trazabilidad completa de movimientos (auditoría)
- ✅ Optimizar rotación de inventario (FIFO)
- ✅ Facilitar toma de decisiones con reportes precisos
- ✅ Integración seamless con módulo de ventas
- ✅ Escalabilidad para múltiples almacenes

---

## 3. FUNCIONALIDADES DETALLADAS

### 3.1 REGISTRO Y GESTIÓN DE PRODUCTOS

#### 3.1.1 Alta de Productos
- **Descripción:** Crear nuevos productos en el sistema
- **Datos requeridos:**
  - Nombre del producto (obligatorio)
  - Código interno único (obligatorio, validación de duplicados)
  - Categoría (obligatorio, selección de lista)
  - Descripción (opcional)
  - Precio de costo (obligatorio)
  - Precio de venta (obligatorio)
  - Stock mínimo (obligatorio, default: 0)
  - Stock máximo (opcional)
  - Estado (activo/inactivo, default: activo)
  - Requiere control de lotes (sí/no)
- **Validaciones:**
  - Código interno: no duplicado, alfanumérico
  - Precios: numéricos positivos, costo < venta
  - Stock: enteros positivos
- **Permisos:** Solo Administrador

#### 3.1.2 Edición de Productos
- Permitir modificación de campos:
  - Nombre, descripción, precios, stock mínimo/máximo, estado
- **Restricciones:**
  - No permitir cambiar código interno (identificador único)
  - Auditar cambios de precios
  - Registrar quién y cuándo modificó
- **Permisos:** Solo Administrador

#### 3.1.3 Eliminación de Productos
- Soft delete (marcar como inactivo, no eliminar físicamente)
- Bloquear eliminación si hay movimientos asociados (auditoría)
- Opción de reactivar productos inactivos
- **Permisos:** Solo Administrador

#### 3.1.4 Visualización de Productos
- Listar todos con filtros y búsqueda
- Ver detalles: stock total, últimos movimientos, alertas asociadas
- Historial de cambios de precio
- **Permisos:** Admin, Vendedor (lectura limitada)

---

### 3.2 GESTIÓN DE CATEGORÍAS

#### 3.2.1 Estructura de Categorías
- Categorías principales (ej: Lubricantes, Filtros, Electrónica)
- Subcategorías (ej: Aceites > Motores, Transmisión)
- Jerarquía de hasta 3 niveles

#### 3.2.2 Operaciones sobre Categorías
- **Alta:** Crear nueva categoría con descripción
- **Edición:** Cambiar nombre, descripción, nivel superior
- **Eliminación:** Bloquear si hay productos asociados
- **Reorden:** Cambiar orden de visualización
- **Permisos:** Solo Administrador

#### 3.2.3 Asignación a Productos
- Cada producto debe estar en una categoría
- Un producto puede tener múltiples categorías (tags)
- Facilitar búsqueda y filtrado

---

### 3.3 CONTROL DE STOCK EN TIEMPO REAL

#### 3.3.1 Cálculo de Stock Total
- **Fórmula:** Stock Total = Σ (cantidad por lote - descuentos FIFO aplicados)
- Actualización automática en cada movimiento
- Validación: cantidad no puede ser negativa
- Visualización en múltiples puntos: dashboard, lista de productos, POS

#### 3.3.2 Stock por Lotes
- Cada entrada de stock crea un lote independiente
- Lote contiene:
  - ID único
  - Producto asociado
  - Cantidad
  - Fecha de vencimiento (opcional)
  - Fecha de ingreso (automática)
  - Estado (activo/consumido)
  - Costo unitario (para seguimiento de inventario)

#### 3.3.3 Visualización Granular
- Vista de lotes por producto: cantidad, fecha vencimiento, estado
- Stock disponible vs. reservado
- Alertas visuales para lotes próximos a vencer

---

### 3.4 ACTUALIZACIÓN AUTOMÁTICA DE EXISTENCIAS

#### 3.4.1 Entradas de Stock
**Generadas por:**
- Compra a proveedores (manual)
- Devoluciones de clientes (manual)
- Ajustes de inventario (manual, autorización requerida)
- Cambios de almacén (inter-almacén, si aplica)

**Proceso:**
1. Usuario ingresa datos de entrada
2. Sistema valida cantidad y datos
3. Crea lote o suma a existente
4. Registra movimiento de stock
5. Actualiza stock total automáticamente

#### 3.4.2 Salidas de Stock
**Generadas por:**
- Venta presencial (automática en POS)
- Devoluciones a proveedor (manual)
- Ajustes de inventario (manual, autorización)
- Pérdida/daño (manual con justificación)

**Proceso (FIFO):**
1. Venta solicita cantidad de producto
2. Sistema busca lotes en orden: vencimiento más cercano primero
3. Descuenta cantidad del lote
4. Si lote se agota, marca como consumido
5. Si no hay stock suficiente, rechaza venta
6. Registra movimiento con trazabilidad de lotes consumidos

#### 3.4.3 Sincronización en Tiempo Real
- Actualización inmediata tras cada movimiento
- Reflejo en Dashboard del Admin
- Alerta a vendedores si stock cae bajo stock mínimo

---

### 3.5 REGISTRO DE MOVIMIENTOS DE INVENTARIO

#### 3.5.1 Tipos de Movimientos
| Tipo | Origen | Destino | Autorizador |
|------|--------|---------|-------------|
| Compra | Proveedor | Almacén | Admin |
| Venta | Almacén | Cliente | Vendedor |
| Devolución entrada | Cliente | Almacén | Admin/Vendedor |
| Devolución salida | Almacén | Proveedor | Admin |
| Ajuste (+) | - | Almacén | Admin |
| Ajuste (-) | Almacén | - | Admin |

#### 3.5.2 Información por Movimiento
- Tipo de movimiento
- Producto y cantidad
- Lote(s) afectado(s)
- Usuario que registra
- Timestamp (automático)
- Motivo/justificación
- Referencia (número de venta, compra, etc.)
- Documento adjunto (opcional, foto de recepción)
- Estado (pendiente, confirmado, rechazado)

#### 3.5.3 Auditoría Completa
- Historial no editable (append-only)
- Cada movimiento queryeable
- Filtro por: fecha, usuario, tipo, producto
- Exportación a CSV/PDF para auditoría externa

---

### 3.6 DEFINICIÓN DE STOCK MÍNIMO Y MÁXIMO

#### 3.6.1 Stock Mínimo
- **Concepto:** Cantidad crítica por debajo de la cual se genera alerta
- **Configuración:** Por producto, editable por Admin
- **Uso:** Trigger de alertas y reórdenes sugeridas
- **Ejemplo:** Filtro de aire stock mínimo = 5 unidades

#### 3.6.2 Stock Máximo (Opcional)
- **Concepto:** Capacidad de almacenamiento o límite operativo
- **Configuración:** Por producto
- **Uso:** Alertas si se intenta ingresar más stock
- **Funcionalidad:** Advertencia pero permite override con justificación

#### 3.6.3 Recomendaciones Automáticas
- Sugerir reorden si: stock_actual <= stock_mínimo
- Calcular cantidad sugerida basada en: rotación promedio, lead time proveedor
- Mostrar en Dashboard admin con prioridad

---

### 3.7 ALERTAS AUTOMÁTICAS

#### 3.7.1 Tipos de Alertas

**A. Stock Bajo**
- Activada cuando: stock_total <= stock_mínimo
- Severidad: Alta (rojo)
- Notificación: Visual en dashboard, email al admin
- Sugerencia: Cantidad a reordenar

**B. Productos Agotados**
- Activada cuando: stock_total = 0
- Severidad: Crítica (rojo oscuro)
- Notificación: Bloquea ventas del producto
- Acción: No permitir vender, mostrar en POS como NO DISPONIBLE

**C. Próximo a Vencer**
- Activada cuando: fecha_vencimiento <= hoy + días_alerta (configurable, default 7)
- Severidad: Media (naranja)
- Notificación: Visual en dashboard, listado de lotes
- Sugerencia: Prioritizar venta (descuentos sugeridos)

**D. Stock Máximo Excedido**
- Activada cuando: stock_total > stock_máximo
- Severidad: Baja (amarillo)
- Notificación: Visual en dashboard
- Acción: Informativa, permite override

#### 3.7.2 Gestión de Alertas
- Centro de alertas unificado en dashboard
- Marcar alerta como "leída" sin cerrar
- Resolver alerta (acción manual o automática)
- Historial de alertas resueltas
- Configuración de umbrales por producto (días a vencer, %)

---

### 3.8 GESTIÓN DE PRECIOS

#### 3.8.1 Estructura de Precios

**Por cada producto:**
- **Precio de Costo:** Valor de adquisición (confidencial, solo admin)
- **Precio de Venta:** Precio público aplicado en POS
- **Margen:** Calculado automático (venta - costo) / costo * 100%
- **Historial:** Todas las modificaciones con fechas y usuario

#### 3.8.2 Descuentos

**Tipos permitidos:**
- Descuento por porcentaje (ej: -10%)
- Descuento por cantidad (ej: 3x2)
- Descuento temporal (ej: productos próximos a vencer)

**Restricciones:**
- Descuento no puede ser > margen (no vender con pérdida)
- Requiere autorización admin si descuento > 20%
- Auditar todos los descuentos aplicados

#### 3.8.3 Actualización de Precios
- Permitir cambio manual (admin)
- Programar cambios futuros (ej: oferta del mes)
- Aplicar cambio a categoría completa
- Historial de cambios de precio por producto

---

### 3.9 CONTROL DE LOTES Y VENCIMIENTOS

#### 3.9.1 Datos de Lote
- ID único del lote
- Producto asociado
- Cantidad inicial y actual
- Fecha de ingreso
- Fecha de vencimiento (si aplica)
- Número de referencia de compra
- Proveedor
- Costo unitario

#### 3.9.2 Gestión de Vencimientos
- Listado de lotes próximos a vencer (dashboard admin)
- Filtro por fecha de vencimiento
- Sugerencia de descuentos para acelerar rotación
- Registro de destrucción de productos vencidos

#### 3.9.3 Trazabilidad
- Al vender: registrar qué lote se utilizó
- Historial completo: de qué lote salió cada producto vendido
- Útil para: recalls, devoluciones, garantía

---

### 3.10 BÚSQUEDA Y FILTRADO

#### 3.10.1 Búsqueda
- Por nombre de producto (búsqueda parcial)
- Por código interno (exact match)
- Por categoría
- Por rango de precios
- Por rango de stock

#### 3.10.2 Filtros Avanzados
- Estado (activo/inactivo)
- Con stock bajo
- Próximos a vencer
- Más vendidos (últimos 30 días)
- Menos vendidos (rotación lenta)
- Productos sin lotes

#### 3.10.3 Ordenamiento
- Por nombre, código, precio, stock, rotación
- Ascendente/descendente
- Persistencia de último ordenamiento usado

---

### 3.11 REPORTES DE INVENTARIO

#### 3.11.1 Reporte de Stock Actual
**Información:**
- Código, nombre, categoría
- Stock total, stock mínimo, stock máximo
- Unidad de medida
- Precio unitario, valor total en almacén
- Estado de alerta
- Última venta (fecha y cantidad)

**Filtros:**
- Por categoría, por rango de stock, solo con alertas

**Formato:** Visualización en tabla, exportable a Excel/PDF

#### 3.11.2 Reporte de Rotación
**Información:**
- Producto, categoría
- Cantidad vendida (período)
- Velocidad de rotación (días promedio en almacén)
- Ranking de productos más/menos vendidos

**Períodos:** Últimos 7, 30, 90, 365 días

#### 3.11.3 Reporte de Movimientos
**Información:**
- Fecha, tipo movimiento, producto
- Cantidad entrada/salida
- Stock antes/después
- Usuario, referencia

**Filtros:** Producto, fecha, tipo, usuario

**Uso:** Auditoría, análisis de patrones

#### 3.11.4 Reporte de Valorización
**Información:**
- Stock en almacén valorizado a costo
- Pérdidas por vencimiento
- Margen total por categoría
- Eficiencia de rotación

**Periodicidad:** Mensual, trimestral, anual

---

### 3.12 HISTORIAL Y AUDITORÍA

#### 3.12.1 Registro de Cambios
- Toda modificación a productos: quién, cuándo, qué cambió, valor anterior/nuevo
- Movimientos de stock: trazabilidad completa
- Cambios de precios: historial completo
- Eliminación de productos: soft delete con registro

#### 3.12.2 Logs de Acceso
- Usuario que accedió al módulo
- Cuándo accedió
- Qué datos consultó/modificó
- Duración de sesión

#### 3.12.3 Auditoría de Transacciones
- Movimientos anuladosteado/rechazados
- Discrepancias en conteos físicos
- Ajustes manuales (requieren justificación)

#### 3.12.4 Reportes de Auditoría
- Descargar logs por período
- Análisis de discrepancias
- Identificación de usuarios frecuentes
- Detección de anomalías (ej: muchos ajustes negativos)

---

### 3.13 IMPORTACIÓN Y EXPORTACIÓN

#### 3.13.1 Importación de Datos
**Formato:** CSV, Excel
**Datos importables:**
- Productos (nombre, código, categoría, precios, stock mínimo)
- Categorías
- Inventario inicial (carga masiva de lotes)
- Precios (actualización masiva)

**Validaciones:**
- Estructura del archivo
- Duplicados
- Campos obligatorios
- Tipos de datos

**Proceso:**
1. Cargar archivo
2. Preview de datos a importar
3. Validar
4. Confirmar
5. Registrar como movimiento masivo
6. Generar reporte de importación

#### 3.13.2 Exportación de Datos
**Formatos:** CSV, Excel, PDF

**Datos exportables:**
- Catálogo de productos completo
- Inventario actual
- Movimientos de período
- Reportes (stock, rotación, valorización)

**Proceso:** Un clic, descarga automática

---

### 3.14 GESTIÓN DE PROVEEDORES

#### 3.14.1 Información de Proveedor
- Nombre, contacto, teléfono, email
- Dirección, país
- Condiciones de pago
- Lead time promedio
- Categorías que suple

#### 3.14.2 Relación Proveedor-Producto
- Cada producto puede tener múltiples proveedores
- Precio de cada proveedor (actualizable)
- Cantidad mínima de compra
- Plazo de entrega
- Última compra y fecha

#### 3.14.3 Sugerencias de Compra
- Sistema sugiere reorden automático
- Propone mejor proveedor (precio + tiempo)
- Consolida reórdenes de múltiples productos del mismo proveedor
- Genera PO (Purchase Order) sugerida

---

### 3.15 SOPORTE PARA MÚLTIPLES ALMACENES (Futuro)

#### 3.15.1 Estructura
- Almacén principal
- Múltiples sucursales/puntos de venta
- Transferencias inter-almacén

#### 3.15.2 Funcionalidad
- Stock por almacén
- Reportes consolidados o por ubicación
- Movimientos de transferencia
- Integración con sistema de ventas (elegir almacén origen)

**Estado:** Diseñado pero no implementado en MVP v1.0

---

## 4. REQUISITOS FUNCIONALES ADICIONALES

### 4.1 Seguridad y Permisos
```
Admin:
  - CRUD completo de productos, categorías
  - Configurar stock mínimo/máximo
  - Importar/exportar inventario
  - Generar reportes
  - Auditoría completa

Vendedor:
  - Consultar stock
  - Ver alertas
  - No puede modificar productos
  - No puede importar/exportar
  - Movimientos solo lectura

Gerente (opcional):
  - Ver reportes
  - Ver análisis
  - No puede modificar productos
```

### 4.2 Performance
- Listados: <= 2 segundos (1000 productos)
- Búsqueda: <= 1 segundo
- Cálculo de stock: tiempo real
- Reportes: <= 5 segundos

### 4.3 Integración
- **Módulo de Ventas:** Descuento automático de stock al confirmar venta
- **Módulo de Compras:** Ingreso de stock al recibir compra
- **Contabilidad:** Valorización de inventario
- **Dashboard:** KPIs principales (stock bajo, rotación)

---

## 5. CASOS DE USO PRINCIPALES

### Caso 1: Venta presencial
1. Vendedor agrega producto a ticket
2. Sistema valida stock disponible
3. Si hay stock, permite venta
4. Sistema descuenta automáticamente (FIFO)
5. Registra movimiento
6. Actualiza stock en tiempo real

### Caso 2: Alerta de stock bajo
1. Stock de producto cae al nivel mínimo
2. Sistema genera alerta
3. Admin ve en dashboard
4. Admin sugiere reorden
5. Proveedor sugerido automáticamente

### Caso 3: Producto próximo a vencer
1. Sistema detecta lote con fecha vencimiento <= hoy + 7 días
2. Alerta naranja en dashboard
3. Sugiere descuento
4. Prioriza FIFO: vende este lote primero

### Caso 4: Auditoría de movimientos
1. Admin consulta historial de producto
2. Ve todos los movimientos: entrada, venta, ajustes
3. Identifica discrepancias
4. Rastrea responsable
5. Genera reporte para auditoría externa

---

## 6. INDICADORES CLAVE (KPIs)

- **Stock Actual vs. Mínimo:** % de productos en alerta
- **Rotación:** Días promedio en almacén
- **Valor en Inventario:** $ total stock
- **Margen Promedio:** % margen por categoría
- **Tasa de Obsolescencia:** % productos vencidos/descartados
- **Exactitud de Inventario:** % discrepancias en conteos

---

## 7. DESCRIPCIÓN TÉCNICA (Para Developers)

### Base de Datos
```
Tablas principales:
- products
- categories
- lots
- stock_movements
- suppliers
- suppliers_products
- price_history
- alerts
- audit_logs
```

### API Endpoints
```
GET /api/inventory/products
GET /api/inventory/products/:id
POST /api/inventory/products
PUT /api/inventory/products/:id
DELETE /api/inventory/products/:id

GET /api/inventory/stock/:productId
GET /api/inventory/lots/:productId
POST /api/inventory/lots
PUT /api/inventory/lots/:id

GET /api/inventory/movements
POST /api/inventory/movements (entrada/salida/ajuste)

GET /api/inventory/alerts
GET /api/inventory/reports/stock
GET /api/inventory/reports/rotation
GET /api/inventory/reports/audit

POST /api/inventory/import
GET /api/inventory/export
```

### Cálculos Automáticos
- Stock total = SUM(lots.cantidad) WHERE status = 'activo'
- Rotación = días desde última venta
- Margen = (precio_venta - precio_costo) / precio_costo * 100
- Alerta stock bajo = stock_total <= stock_mínimo

---

## 8. ROADMAP (Futuro)

### v1.1 (Próximas semanas)
- [ ] Importación masiva de inventario
- [ ] Descuentos automáticos por vencimiento
- [ ] Email de alertas

### v1.2 (Próximo mes)
- [ ] Gestión de proveedores
- [ ] Sugerencias automáticas de reorden
- [ ] Reportes avanzados (análisis ABC)

### v2.0 (Futuro)
- [ ] Multi-almacén
- [ ] App móvil para conteos
- [ ] Código de barras/QR
- [ ] Integración EDI con proveedores

---

## 9. CONCLUSIÓN

El Módulo de Inventario proporciona un control integral, eficiente y auditable del stock. Está diseñado para ser intuitivo para vendedores y poderoso para administradores, con énfasis en la trazabilidad y la optimización de la rotación de inventario mediante FIFO.

La arquitectura es escalable y preparada para futuras expansiones (multi-almacén, análisis avanzado, automatización).

---

**Aprobado por:** Arquitectura de Software  
**Fecha de aprobación:** 2 de febrero de 2026  
**Próxima revisión:** 30 de marzo de 2026
