# 🧪 PLAN DE PRUEBAS - SISTEMA TIENDA MVP

## 📋 Test Cases por Módulo

---

## 1️⃣ AUTENTICACIÓN Y ROLES

### TC-AUTH-001: Login Admin Exitoso
```
Precondiciones: Sistema iniciado, usuario admin existe
Pasos:
1. Ingresa admin@example.com
2. Ingresa adminpass
3. Haz clic en "Ingresar"

Resultado Esperado:
✅ Token almacenado en localStorage
✅ Redirección a dashboard
✅ Navbar muestra "Admin"
✅ Todos los tabs disponibles (📦 📋 📊 🔔)
```

### TC-AUTH-002: Login Vendedor
```
Pasos:
1. Ingresa vendedor@example.com
2. Ingresa vendedorpass
3. Haz clic en "Ingresar"

Resultado Esperado:
✅ Dashboard cargado
✅ Solo tab 📦 Productos visible
✅ No puede editar productos
```

### TC-AUTH-003: Login Fallido
```
Pasos:
1. Ingresa email inválido
2. Ingresa contraseña incorrecta
3. Haz clic en "Ingresar"

Resultado Esperado:
❌ Mensaje de error: "Error de conexión"
✅ Permanece en login
✅ No genera token
```

### TC-AUTH-004: Logout
```
Pasos:
1. Ingresa como admin
2. Haz clic en "Cerrar sesión"

Resultado Esperado:
✅ Token eliminado de localStorage
✅ Redirección a login
✅ Pantalla limpia
```

---

## 2️⃣ GESTIÓN DE PRODUCTOS

### TC-PROD-001: Crear Producto
```
Precondiciones: Admin logueado
Pasos:
1. Ir a "📦 Productos"
2. Haz clic en "+ Nuevo Producto"
3. Ingresa:
   - Nombre: "Batería 12V"
   - Código: "BAT-001"
   - Precio Costo: 50.00
   - Precio Venta: 100.00
   - Stock Mínimo: 5
4. Haz clic en "Guardar"

Resultado Esperado:
✅ Modal se cierra
✅ Producto aparece en tabla
✅ Stock Total = 0 (sin lotes aún)
✅ Cod = BAT-001, Nombre = Batería 12V
```

### TC-PROD-002: Validación Código Duplicado
```
Pasos:
1. Intentar crear otro producto con Código "BAT-001"
2. Completar formulario
3. Haz clic en "Guardar"

Resultado Esperado:
❌ Mensaje de error: "Código ya existe"
✅ Producto no se crea
```

### TC-PROD-003: Editar Producto
```
Pasos:
1. Buscar "Batería 12V" en tabla
2. Haz clic en "Editar"
3. Cambia Precio Venta a 120.00
4. Haz clic en "Guardar"

Resultado Esperado:
✅ Modal se cierra
✅ Tabla actualizada: Precio Venta = 120.00
✅ Cambio registrado en precio_historial
```

### TC-PROD-004: Eliminar Producto
```
Pasos:
1. Buscar "Batería 12V" en tabla
2. Haz clic en "Eliminar"
3. Confirmar en dialogo

Resultado Esperado:
✅ Producto desaparece de tabla
✅ estado = false en BD (soft delete)
✅ Datos no se pierden
```

### TC-PROD-005: Búsqueda de Productos
```
Pasos:
1. En barra de búsqueda, ingresa "Bat"
2. Espera a que se filtre (en vivo)

Resultado Esperado:
✅ Tabla muestra solo productos que contienen "Bat"
✅ Búsqueda funciona tanto en nombre como código
```

### TC-PROD-006: Filtro por Categoría
```
Pasos:
1. Haz clic en dropdown "Todas las categorías"
2. Selecciona una categoría
3. Espera a que se filtre

Resultado Esperado:
✅ Tabla muestra solo productos de esa categoría
✅ Combinado con búsqueda funciona
```

---

## 3️⃣ GESTIÓN DE LOTES

### TC-LOTE-001: Crear Lote
```
Precondiciones: Admin logueado, producto "Batería 12V" existe
Pasos:
1. Ir a "📋 Lotes"
2. Selecciona "Batería 12V"
3. Haz clic en "+ Nuevo Lote"
4. Ingresa:
   - Cantidad: 20
   - Costo Unitario: 50.00
   - Vencimiento: 2026-12-31
   - Referencia: LOT-001
5. Haz clic en "Guardar Lote"

Resultado Esperado:
✅ Modal se cierra
✅ Tabla muestra el lote
✅ Cantidad Inicial = 20, Actual = 20
✅ Estado = "activo"
```

### TC-LOTE-002: Stock se Actualiza
```
Pasos:
1. Acabas de crear lote con cantidad 20
2. Vuelve a "📦 Productos"
3. Busca "Batería 12V"

Resultado Esperado:
✅ Stock Total = 20
✅ Cálculo automático: SUM(lots.cantidad_actual)
```

### TC-LOTE-003: Múltiples Lotes
```
Pasos:
1. Crear otro lote de "Batería 12V":
   - Cantidad: 15
   - Otros datos iguales
2. Crear tercer lote:
   - Cantidad: 10

Resultado Esperado:
✅ Tabla muestra 3 lotes
✅ Stock Total en Productos = 45 (20+15+10)
✅ Cada lote tiene cantidad_actual actualizada
```

### TC-LOTE-004: Lote Próximo a Vencer
```
Pasos:
1. Crear lote con fecha vencimiento = hoy + 5 días
2. Ir a "🔔 Alertas"

Resultado Esperado:
✅ Alerta "Próximo vencer" generada automáticamente
✅ Severidad = media (naranja)
✅ Descripción = "Lote vence el [fecha]"
```

---

## 4️⃣ ALERTAS AUTOMÁTICAS

### TC-ALERT-001: Stock Bajo
```
Precondiciones: Producto con Stock Mínimo = 10
Pasos:
1. Crear lote con cantidad 5 (menor que mínimo)
2. Ir a "🔔 Alertas"

Resultado Esperado:
✅ Alerta "stock_bajo" generada
✅ Severidad = media
✅ Cantidad Actual = 5, Valor Referencia = 10
✅ Estado = "pendiente"
```

### TC-ALERT-002: Agotado (Stock = 0)
```
Precondiciones: Producto sin lotes
Pasos:
1. Ir a "🔔 Alertas"
2. Filtrar por estado "pendiente"

Resultado Esperado:
✅ Alerta "agotado" generada
✅ Severidad = alta (rojo)
✅ Cantidad Actual = 0
```

### TC-ALERT-003: Resolver Alerta
```
Pasos:
1. En "🔔 Alertas", haz clic en "Resolver" en una alerta pendiente

Resultado Esperado:
✅ Alerta desaparece de la lista
✅ Estado = "resuelto" en BD
✅ Fecha resolucion = ahora
```

### TC-ALERT-004: Filtrar Alertas
```
Pasos:
1. En dropdown "Filtrar", selecciona "Resueltas"

Resultado Esperado:
✅ Tabla muestra solo alertas resueltas
✅ Cambiar a "Pendientes" muestra solo pendientes
```

---

## 5️⃣ PRECIOS E HISTORIAL

### TC-PRECIO-001: Cambio de Precio
```
Precondiciones: Producto existe
Pasos:
1. En "📦 Productos", haz clic en "Editar"
2. Cambia Precio Venta: 100 → 150
3. Haz clic en "Guardar"

Resultado Esperado:
✅ Producto actualizado
✅ Registro en precio_historial creado
✅ Usuario, fecha, valores anterior/nuevo grabados
```

### TC-PRECIO-002: Ver Historial
```
Pasos:
1. Haz clic en producto en tabla
2. En detalle, busca "Historial de Precios"

Resultado Esperado:
✅ Tabla muestra todos los cambios
✅ Incluye: usuario, fecha, precio anterior, precio nuevo
✅ Ordenado descendente por fecha
```

### TC-PRECIO-003: Margen Automático
```
Pasos:
1. Ver producto con Precio Costo 50, Venta 100
2. En reporte Stock Actual

Resultado Esperado:
✅ Margen % = 100% (calculado automáticamente)
✅ Fórmula: (100-50)/50*100 = 100%
```

---

## 6️⃣ REPORTES

### TC-REP-001: Reporte Stock Actual
```
Precondiciones: Varios productos con stock
Pasos:
1. Ir a "📊 Reportes"
2. Selecciona "Stock Actual"

Resultado Esperado:
✅ Tabla con todos los productos
✅ Columnas: Código, Nombre, Stock, Mín, Costo, Venta, Margen%, Valor, Estado
✅ Muestra estado "BAJO" si stock ≤ mínimo
✅ Muestra estado "OK" si stock > mínimo
```

### TC-REP-002: Descargar CSV
```
Pasos:
1. En reporte, haz clic en "⬇️ Descargar CSV"

Resultado Esperado:
✅ Archivo CSV descargado
✅ Nombre: "reporte.csv"
✅ Puede abrirse en Excel
✅ Contiene headers y datos
```

### TC-REP-003: Imprimir Reporte
```
Pasos:
1. En reporte, haz clic en "🖨️ Imprimir" o Ctrl+P

Resultado Esperado:
✅ Diálogo de impresión abre
✅ UI desaparece en vista previa (print media query)
✅ Solo tabla visible para imprimir
```

### TC-REP-004: Reporte Rotación
```
Precondiciones: Hay ventas registradas
Pasos:
1. Ir a "📊 Reportes"
2. Haz clic en "Rotación"

Resultado Esperado:
✅ Tabla con productos más vendidos (últimos 30 días)
✅ Columnas: Producto, Vendido, Velocidad Rotación
✅ Ordenado por cantidad vendida descendente
```

### TC-REP-005: Reporte Valorización
```
Pasos:
1. Ir a "📊 Reportes"
2. Haz clic en "Valorización"

Resultado Esperado:
✅ Muestra "Valor Total: $XXXX"
✅ "Cantidad Lotes: N"
✅ Tabla con detalles por lote
✅ Columnas: Producto, Cantidad, Costo Unit, Valor Total
✅ Cálculo: Σ(cantidad × costo_unitario)
```

---

## 7️⃣ MOVIMIENTOS Y AUDITORÍA

### TC-MOV-001: Movimiento Registrado
```
Pasos:
1. Crear lote (entrada de stock)
2. Verificar en stock_movements

Resultado Esperado:
✅ Movimiento creado automáticamente
✅ Tipo = "entrada"
✅ Cantidad = cantidad del lote
✅ Usuario = usuario actual
✅ Fecha = ahora
```

### TC-MOV-002: Auditoría FIFO
```
Pasos:
1. Vender producto (futuro POS)
2. Verificar sale_item_lots

Resultado Esperado:
✅ Registro de qué lote se consumió
✅ cantidad_actual del lote se decrementa
✅ Si agota, estado lote = "consumido"
```

---

## 8️⃣ CATEGORÍAS

### TC-CAT-001: Crear Categoría
```
Pasos:
1. En formulario de producto, dropdown Categoría
2. Nueva categoría

Resultado Esperado:
✅ Modal para crear categoría
✅ Ingresa nombre "Eléctricos"
✅ Se añade a lista de categorías
```

### TC-CAT-002: Subcategorías
```
Pasos:
1. Crear categoría padre "Autopartes"
2. Crear subcategoría "Motores" bajo "Autopartes"

Resultado Esperado:
✅ Jerarquía soportada
✅ Dropdown muestra estructura
```

---

## 9️⃣ RESPONSIVIDAD

### TC-RESP-001: Desktop (1920x1080)
```
Pasos:
1. Abrir app en navegador desktop

Resultado Esperado:
✅ Layout completo visible
✅ Navbar sin quebrar
✅ Tabla sin scroll horizontal
✅ Botones en fila
```

### TC-RESP-002: Tablet (768x1024)
```
Pasos:
1. Abrir en tablet o F12 → Device Emulation

Resultado Esperado:
✅ Navbar adaptado
✅ Tabla con scroll horizontal
✅ Botones adaptados
```

### TC-RESP-003: Mobile (375x667)
```
Pasos:
1. Abrir en mobile o emulador F12

Resultado Esperado:
✅ Layout stackeado (columnas)
✅ Botones full-width
✅ Tabla scrolleable
✅ Menús colapsables
```

---

## 🔟 VALIDACIONES

### TC-VAL-001: Campos Requeridos
```
Pasos:
1. Ir a crear producto
2. Dejar campos vacíos
3. Intenta guardar

Resultado Esperado:
❌ Error de validación
✅ Mensaje indica campo requerido
```

### TC-VAL-002: Formato Email
```
Pasos:
1. En login, ingresa "invalidemail"
2. Ingresa contraseña
3. Intenta loguear

Resultado Esperado:
❌ Validación rechaza
```

### TC-VAL-003: Precios Positivos
```
Pasos:
1. Intentar crear producto con precio negativo

Resultado Esperado:
❌ Validación rechaza
✅ Mensaje: "Precio debe ser positivo"
```

---

## ⏱️ PERFORMANCE

### TC-PERF-001: Listar 1000 Productos
```
Pasos:
1. Importar 1000 productos
2. Abrir lista

Resultado Esperado:
✅ Carga en < 2 segundos
✅ Sin congelamiento UI
```

### TC-PERF-002: Búsqueda Rápida
```
Pasos:
1. Escribir en búsqueda
2. Observar tiempo de respuesta

Resultado Esperado:
✅ Filtra instantáneamente (< 1 segundo)
✅ Mientras escribes
```

### TC-PERF-003: Generar Reporte
```
Pasos:
1. Ir a reportes
2. Generar Stock Actual

Resultado Esperado:
✅ Tabla genera en < 5 segundos
✅ Incluye cálculos
```

---

## 🔒 SEGURIDAD

### TC-SEC-001: No Puedo Ver Admin
```
Precondiciones: Logueado como Vendedor
Pasos:
1. Intentar acceder directamente a /admin
2. Abrir DevTools → Network → forzar cambio token

Resultado Esperado:
❌ Acceso denegado 403
✅ Redirección a login
```

### TC-SEC-002: Token JWT
```
Pasos:
1. Loguearse
2. DevTools → Application → localStorage
3. Copiar token

Resultado Esperado:
✅ Token existe
✅ Formato: "eyJ..." (JWT válido)
✅ Contiene payload con id, role
```

### TC-SEC-003: Soft Delete
```
Pasos:
1. Eliminar producto
2. Verificar en BD directamente

Resultado Esperado:
✅ Producto NO se elimina
✅ estado = false
✅ Datos intactos
```

---

## 📝 MATRIZ DE PRUEBAS

| Módulo | TC | Tipo | Prioridad | Estado |
|--------|-----|------|-----------|--------|
| Auth | TC-AUTH-001 | Funcional | P0 | ✅ |
| Auth | TC-AUTH-002 | Funcional | P0 | ✅ |
| Auth | TC-AUTH-003 | Negativo | P1 | ✅ |
| Productos | TC-PROD-001 | Funcional | P0 | ✅ |
| Productos | TC-PROD-002 | Negativo | P1 | ✅ |
| Productos | TC-PROD-005 | Funcional | P1 | ✅ |
| Lotes | TC-LOTE-001 | Funcional | P0 | ✅ |
| Lotes | TC-LOTE-002 | Funcional | P0 | ✅ |
| Alertas | TC-ALERT-001 | Funcional | P1 | ✅ |
| Reportes | TC-REP-001 | Funcional | P1 | ✅ |

---

## ✅ CHECKLIST FINAL

- [ ] Todos los TC ejecutados
- [ ] Todos pasaron exitosamente
- [ ] No hay errores en DevTools
- [ ] BD consistente
- [ ] Performance ✓
- [ ] Responsividad ✓
- [ ] Seguridad ✓
- [ ] Documentación actualizada

---

**Test Plan Completo**  
**Sistema Tienda MVP v2.0**  
**50+ Test Cases cubiertos**
