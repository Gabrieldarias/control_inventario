# 📖 EJEMPLOS DE CÓDIGO - Cómo funcionan las funciones serverless

## 1️⃣ Health Check (Sin autenticación)

### Archivo: `api/index.js`

```javascript
import { setCorsHeaders } from './utils';

export default async function handler(req, res) {
  setCorsHeaders(res);  // Configurar CORS

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({ 
    message: 'API funciona correctamente',
    version: '2.0',
    timestamp: new Date().toISOString()
  });
}
```

**Testing:**
```bash
curl https://tu-proyecto.vercel.app/api
```

---

## 2️⃣ Login (Generar JWT)

### Archivo: `api/auth/login.js`

```javascript
import jwt from 'jsonwebtoken';
import { setCorsHeaders } from '../utils';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_local';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST' });
  }

  try {
    const { email, password } = req.body;

    // Verificar credenciales
    if (email === 'admin@example.com' && password === 'adminpass') {
      const token = jwt.sign(
        { 
          id: 1, 
          email: 'admin@example.com', 
          role: 'admin' 
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.status(200).json({
        token,
        usuario: {
          id: 1,
          nombre: 'Admin',
          email: 'admin@example.com',
          role: 'admin'
        }
      });
    }

    res.status(401).json({ error: 'Credenciales inválidas' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
}
```

**Testing:**
```bash
curl -X POST https://tu-proyecto.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpass"}'

# Respuesta:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "usuario": { ... }
# }
```

---

## 3️⃣ Listar productos (Con autenticación)

### Archivo: `api/inventory/productos/index.js`

```javascript
import { supabase, setCorsHeaders } from '../../utils';
import { requireAuth } from '../../middleware/auth';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // req.user ya está verificado por requireAuth
    console.log('Usuario autenticado:', req.user.email);

    // Obtener parámetro de query
    const { estado } = req.query;
    
    let query = supabase.from('products').select('*');

    // Filtrar por estado
    if (estado === 'true') {
      query = query.eq('estado', true);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Error cargando productos' });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Envolver con requireAuth para proteger
export default requireAuth(handler);
```

**Testing:**
```bash
TOKEN="tu-token-aqui"

curl https://tu-proyecto.vercel.app/api/inventory/productos \
  -H "Authorization: Bearer $TOKEN"

# Con filtro
curl "https://tu-proyecto.vercel.app/api/inventory/productos?estado=true" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 4️⃣ Crear producto (Con validación de rol)

### Archivo: `api/inventory/productos/crear.js`

```javascript
import { supabase, setCorsHeaders } from '../../utils';
import { requireRole } from '../../middleware/auth';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST' });
  }

  try {
    // req.user ya verificado y debe ser 'admin'
    const {
      nombre,
      codigo_interno,
      categoria_id,
      precio_costo,
      precio_venta
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !precio_venta) {
      return res.status(400).json({ 
        error: 'Nombre y precio_venta son requeridos' 
      });
    }

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('products')
      .insert([{
        nombre,
        codigo_interno,
        categoria_id,
        precio_costo,
        precio_venta,
        estado: true,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select();

    if (error) {
      console.error('Error Supabase:', error);
      return res.status(400).json({ error: 'Error creando producto' });
    }

    res.status(201).json({
      message: 'Producto creado exitosamente',
      producto: data[0]
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Requerir rol 'admin'
export default requireRole(['admin'])(handler);
```

**Testing:**
```bash
TOKEN="tu-token-aqui"

curl -X POST https://tu-proyecto.vercel.app/api/inventory/productos/crear \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nombre": "Aceite nuevo",
    "codigo_interno": "OIL001",
    "precio_venta": 15,
    "precio_costo": 10
  }'
```

---

## 5️⃣ Autenticación (Middleware)

### Archivo: `api/middleware/auth.js`

```javascript
import jwt from 'jsonwebtoken';
import { setCorsHeaders } from '../utils';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_local';

// Verificar y decodificar JWT
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Extraer usuario del header Authorization
export function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

// Middleware para requerir autenticación
export function requireAuth(handler) {
  return async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized: Token inválido o ausente' 
      });
    }

    req.user = user;  // Agregar usuario al request
    return handler(req, res);
  };
}

// Middleware para requerir un rol específico
export function requireRole(allowedRoles) {
  return (handler) => {
    return requireAuth(async (req, res) => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Forbidden: No tienes permisos' 
        });
      }
      return handler(req, res);
    });
  };
}
```

**Uso:**
```javascript
// Sin autenticación
export default handler;

// Con autenticación
export default requireAuth(handler);

// Con rol específico
export default requireRole(['admin'])(handler);
```

---

## 6️⃣ Utilidades compartidas

### Archivo: `api/utils.js`

```javascript
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase (usado en todas las funciones)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Configurar CORS (llamar en cada función)
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Manejo de OPTIONS (CORS preflight)
export function handleOptionsRequest(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}

// Respuesta de error estandarizada
export function errorResponse(res, statusCode, message) {
  setCorsHeaders(res);
  res.status(statusCode).json({ error: message });
}

// Respuesta exitosa estandarizada
export function successResponse(res, statusCode, data) {
  setCorsHeaders(res);
  res.status(statusCode).json(data);
}
```

---

## 7️⃣ Frontend - Cómo llamar al API

### Archivo: `frontend/app.js` (sección actualizada)

```javascript
function api() {
  // Auto-detectar URL base según ambiente
  const getBaseUrl = () => {
    if (window.location.hostname !== 'localhost') {
      // En producción (Vercel)
      return window.location.origin + '/api';
    }
    // En local
    return 'http://localhost:3000/api';  // vercel dev
    // o 'http://localhost:3001/api'     // Express backend
  };

  const base = getBaseUrl();
  const token = localStorage.getItem('token');

  // Configurar headers
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Crear instancia axios
  const axiosInstance = axios.create({
    baseURL: base,
    headers
  });

  return {
    // Login - Sin token
    login: (email, password) => 
      axios.post(`${base}/auth/login`, { email, password }),

    // Productos - Con token
    getProductos: (filtros) => 
      axiosInstance.get('/inventory/productos', { params: filtros }),

    crearProducto: (data) => 
      axiosInstance.post('/inventory/productos/crear', data),

    // Categorías - Con token
    getCategorias: () => 
      axiosInstance.get('/inventory/categorias'),

    crearCategoria: (data) => 
      axiosInstance.post('/inventory/categorias/crear', data),
  };
}

// USO
async function handleLogin(email, password) {
  try {
    const { data } = await api().login(email, password);
    localStorage.setItem('token', data.token);
    // Redirigir al dashboard
  } catch (error) {
    console.error('Error:', error.response.data.error);
  }
}

async function loadProductos() {
  try {
    const { data } = await api().getProductos({ estado: true });
    console.log('Productos:', data);
  } catch (error) {
    console.error('Error:', error.response.data.error);
  }
}
```

---

## 🎯 Patrón general de una función

Todas las funciones serverless siguen este patrón:

```javascript
import { supabase, setCorsHeaders } from '../utils';
import { requireAuth, requireRole } from '../middleware/auth';

async function handler(req, res) {
  // 1. Configurar CORS
  setCorsHeaders(res);

  // 2. Manejo de OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 3. Lógica según método HTTP
    if (req.method === 'GET') {
      // GET logic
    } else if (req.method === 'POST') {
      // POST logic
    } else if (req.method === 'PUT') {
      // PUT logic
    } else if (req.method === 'DELETE') {
      // DELETE logic
    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Exportar con middleware de autenticación
export default requireAuth(handler);
// O con rol específico
export default requireRole(['admin'])(handler);
// O sin autenticación
export default handler;
```

---

## ✨ Resumen

- **Sin autenticación**: `export default handler`
- **Con autenticación**: `export default requireAuth(handler)`
- **Con rol**: `export default requireRole(['admin'])(handler)`
- **CORS**: Llamar `setCorsHeaders(res)` en cada función
- **Supabase**: Usar `supabase.from('tabla').select()`
- **Errores**: Usar status codes HTTP correctos

