# 📡 API DOCUMENTATION

## Base URL
```
http://localhost:3001/api
```

---

## 🔐 Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "adminpass"
}

Response: 
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": { ... }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "nombre": "Usuario",
  "email": "usuario@example.com",
  "password": "password123",
  "role": "vendedor"
}
```

---

## 📦 Productos

### Listar productos
```http
GET /inventory/productos?estado=true
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "nombre": "Aceite Motor 1L",
    "codigo_interno": "AM001",
    "precio_venta": 12,
    "stock_actual": 8,
    ...
  }
]
```

### Crear producto
```http
POST /inventory/productos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Producto nuevo",
  "codigo_interno": "PROD001",
  "categoria_id": 1,
  "precio_costo": 10,
  "precio_venta": 20,
  "stock_minimo": 5,
  "stock_maximo": 100
}
```

### Actualizar producto
```http
PUT /inventory/productos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Nombre actualizado",
  "precio_venta": 25
}
```

### Eliminar producto
```http
DELETE /inventory/productos/:id
Authorization: Bearer <token>
```

---

## 📊 Ventas

### Crear venta
```http
POST /sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 12
    }
  ]
}

Response:
{
  "id": 1,
  "numero_venta": "V001",
  "total": 24,
  "fecha": "2026-02-02T...",
  "estado": "completada"
}
```

### Listar ventas
```http
GET /sales
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "numero_venta": "V001",
    "total": 104,
    "fecha": "2026-02-02T01:36:31",
    "estado": "completada",
    "vendedor": { ... }
  }
]
```

### Detalle de venta
```http
GET /sales/:id
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "items": [
    {
      "producto_id": 2,
      "nombre": "Aceite Motor 1L",
      "cantidad": 8,
      "precio_unitario": 12,
      "subtotal": 96
    }
  ],
  "total": 104
}
```

---

## 📈 Inventario

### Stock actual
```http
GET /inventory/stock
Authorization: Bearer <token>

Response:
[
  {
    "producto_id": 1,
    "nombre": "Aceite Motor 1L",
    "stock_actual": 8,
    "stock_minimo": 3,
    "stock_maximo": 50,
    "alerta": false
  }
]
```

### Movimientos de stock
```http
GET /inventory/movimientos?producto_id=1
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "tipo": "venta",
    "cantidad": -8,
    "cantidad_anterior": 20,
    "cantidad_nueva": 12,
    "fecha": "2026-02-02T01:36:31",
    "usuario": "admin@example.com"
  }
]
```

### Registrar movimiento
```http
POST /inventory/movimientos
Authorization: Bearer <token>
Content-Type: application/json

{
  "producto_id": 1,
  "tipo": "entrada",
  "cantidad": 10,
  "motivo": "Compra a proveedor"
}
```

---

## ⚙️ Configuración

### Obtener configuración
```http
GET /configuracion
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "clave": "porcentaje_ganancia",
    "valor": "20",
    "tipo": "number"
  }
]
```

### Obtener valor específico
```http
GET /configuracion/porcentaje_ganancia
Authorization: Bearer <token>

Response:
{
  "clave": "porcentaje_ganancia",
  "valor": "20"
}
```

### Actualizar configuración
```http
PUT /configuracion/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "valor": "25"
}
```

---

## 🏷️ Categorías

### Listar categorías
```http
GET /categorias
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "nombre": "Lubricantes",
    "descripcion": "Aceites y lubricantes",
    "estado": true
  }
]
```

### Crear categoría
```http
POST /categorias
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Nueva categoría",
  "descripcion": "Descripción",
  "orden": 1
}
```

---

## 👥 Usuarios

### Listar usuarios
```http
GET /usuarios
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "nombre": "Admin",
    "email": "admin@example.com",
    "role": "admin",
    "estado": true
  }
]
```

---

## ❌ Códigos de Error

| Código | Significado |
|--------|------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o ausente |
| 403 | Forbidden - No tienes permiso |
| 404 | Not Found - Recurso no encontrado |
| 500 | Server Error - Error del servidor |

---

## 📝 Headers requeridos

Todas las peticiones (excepto login/register) requieren:

```
Authorization: Bearer <token>
Content-Type: application/json
```

El token se obtiene del login y expira en 8 horas.
