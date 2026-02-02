# 🚀 MIGRACIÓN A VERCEL SERVERLESS FUNCTIONS

## ¿Qué cambió?

Tu aplicación ha sido convertida de un servidor Express tradicional a **Vercel Serverless Functions**. Esto significa:

- ❌ **NO hay** `app.listen()` ni puerto 3001
- ✅ **SÍ hay** funciones serverless en carpeta `/api`
- ✅ Cada endpoint es una función independiente
- ✅ Compatible con Vercel, AWS Lambda, Google Cloud Functions, etc.

---

## 📂 Nueva estructura

```
proyecto/
├── api/                           # ← Funciones serverless
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   ├── auth/
│   │   └── login.js              # POST /api/auth/login
│   ├── inventory/
│   │   ├── productos/
│   │   │   ├── index.js          # GET /api/inventory/productos
│   │   │   └── crear.js          # POST /api/inventory/productos
│   │   └── categorias/
│   │       ├── index.js          # GET /api/inventory/categorias
│   │       └── crear.js          # POST /api/inventory/categorias
│   ├── configuracion/
│   │   ├── index.js              # GET /api/configuracion
│   │   └── [clave].js            # GET /api/configuracion/:clave
│   ├── utils.js                  # Utilidades compartidas
│   └── index.js                  # GET /api (health check)
├── frontend/
│   ├── app.js                    # React app actualizado
│   ├── index.html
│   └── styles.css
├── vercel.json                   # ← Configuración de Vercel
├── .env.local                    # ← Variables de entorno
├── package.json
└── README.md
```

---

## 🔧 Instalación para Vercel

### 1. Instalar Vercel CLI
```bash
npm install -g vercel
```

### 2. Loguear en Vercel
```bash
vercel login
```

### 3. Crear cuenta en Supabase
- Ir a https://supabase.com
- Crear nuevo proyecto
- Obtener:
  - `SUPABASE_URL`
  - `SUPABASE_KEY`

### 4. Configurar variables de entorno en Vercel
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
vercel env add JWT_SECRET
```

### 5. Desplegar
```bash
vercel --prod
```

---

## 🖥️ Desarrollo local

### Opción A: Con Vercel CLI (recomendado)
```bash
vercel dev
# Servidor en http://localhost:3000
```

### Opción B: Sin Vercel CLI
```bash
npm install
npm start
# Servidor en http://localhost:3001
```

### Variables de entorno para desarrollo
Crear archivo `.env.local`:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=tu_secreto_super_seguro
```

---

## 📡 Endpoints disponibles

### Autenticación
```
POST   /api/auth/login                    # Login
```

### Productos
```
GET    /api/inventory/productos           # Listar
POST   /api/inventory/productos/crear     # Crear
```

### Categorías
```
GET    /api/inventory/categorias          # Listar
POST   /api/inventory/categorias/crear    # Crear
```

### Configuración
```
GET    /api/configuracion                 # Obtener todas
GET    /api/configuracion/[clave]         # Obtener por clave
```

---

## 🔐 Cómo funcionan las funciones serverless

### Estructura de una función
```javascript
// api/inventory/productos/index.js
import { supabase, setCorsHeaders } from '../../utils';
import { requireAuth } from '../../middleware/auth';

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Tu lógica aquí
  
  res.status(200).json(data);
}

export default requireAuth(handler);
```

### Puntos clave
1. Cada archivo es una **función independiente**
2. Se exporta como `export default handler`
3. La ruta se determina por la estructura de carpetas
4. `req` y `res` son Express-like

---

## 🌐 URLs en producción

### Local (desarrollo)
```
http://localhost:3000/api/inventory/productos
```

### Vercel (producción)
```
https://tu-proyecto.vercel.app/api/inventory/productos
```

### El frontend auto-detecta:
```javascript
// En app.js (ya actualizado)
if (window.location.hostname !== 'localhost') {
  // Usa URL del servidor actual
  return window.location.origin + '/api';
}
// En local, usa http://localhost:3001/api
```

---

## 📦 Package.json actualizado

```json
{
  "name": "tienda-mvp",
  "version": "2.0.0-serverless",
  "scripts": {
    "dev": "vercel dev",
    "build": "echo 'No build needed'",
    "start": "node backend/src/server.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.1.4"
  }
}
```

---

## 🚀 Desplegar en Vercel

### Opción A: Desde Git
```bash
# 1. Pushear a GitHub
git add .
git commit -m "feat: Migración a Vercel Serverless"
git push

# 2. En Vercel: Conectar repo y hacer deploy automático
```

### Opción B: Desde CLI
```bash
vercel --prod
```

---

## ✅ Checklist pre-despliegue

- [ ] Crear cuenta en Supabase
- [ ] Obtener SUPABASE_URL y SUPABASE_KEY
- [ ] Crear variables en Vercel
- [ ] Probar en desarrollo: `vercel dev`
- [ ] Revisar que /api/health funcione
- [ ] Revisar que /api/auth/login funcione
- [ ] Hacer deploy: `vercel --prod`
- [ ] Probar endpoints en producción

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Error: "SUPABASE_URL is not defined"
Revisar que las variables estén en Vercel:
```bash
vercel env list
```

### Error: "CORS error"
Ya está configurado en `api/utils.js`. Si persiste, revisar headers.

### Error: "Function returned with status code 502"
Revisar logs:
```bash
vercel logs
```

---

## 📝 Migrando más endpoints

Cada endpoint sigue este patrón:

```javascript
// api/ruta/endpoint.js
import { supabase, setCorsHeaders } from '../utils';
import { requireAuth, requireRole } from '../middleware/auth';

async function handler(req, res) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Tu GET logic
    } else if (req.method === 'POST') {
      // Tu POST logic
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Con autenticación
export default requireAuth(handler);

// O con rol específico
export default requireRole(['admin'])(handler);
```

---

## 🎉 ¡Listo!

Tu aplicación ahora es:
✅ **Serverless** - Sin mantenimiento de servidores
✅ **Escalable** - Auto-escala con tráfico
✅ **Económica** - Pagas solo por lo que usas
✅ **Rápida** - Latencia mínima global
✅ **Segura** - Credenciales en variables de entorno

