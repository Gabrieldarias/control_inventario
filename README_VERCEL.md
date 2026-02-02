# 🚀 TIENDA MVP - Vercel Serverless Edition

> Sistema de gestión de inventario completamente funcional, desplegable en Vercel sin servidor.

[![Vercel Deployment](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)
[![Node.js](https://img.shields.io/badge/Node-18+-blue)](https://nodejs.org)

---

## 📋 Tabla de contenidos

1. [Instalación rápida](#instalación-rápida)
2. [Características](#características)
3. [Requisitos](#requisitos)
4. [Desarrollo local](#desarrollo-local)
5. [Desplegar a Vercel](#desplegar-a-vercel)
6. [Endpoints API](#endpoints-api)
7. [Variables de entorno](#variables-de-entorno)
8. [Troubleshooting](#troubleshooting)

---

## ⚡ Instalación rápida

### Opción A: Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Loguear en Vercel
vercel login

# 3. Clonar y entrar al proyecto
git clone https://github.com/tu-usuario/tienda-mvp.git
cd tienda-mvp

# 4. Desplegar
vercel --prod
```

### Opción B: Desarrollo local

```bash
# 1. Clonar
git clone https://github.com/tu-usuario/tienda-mvp.git
cd tienda-mvp

# 2. Instalar dependencias
npm install

# 3. Configurar variables
cp .env.local.example .env.local
# Editar .env.local con tus credenciales

# 4. Iniciar servidor de desarrollo
npm run dev
# Abre http://localhost:3000
```

---

## ✨ Características

✅ **Autenticación JWT** - Segura y basada en tokens  
✅ **Gestión de inventario** - CRUD completo de productos  
✅ **Categorías** - Organiza tus productos  
✅ **Sistema de lotes** - Control de vencimientos  
✅ **Movimientos de stock** - Auditoría completa  
✅ **Configuración dinámica** - Márgenes de ganancia  
✅ **Serverless** - Sin mantenimiento de servidores  
✅ **Global** - Desplegado en CDN mundial  

---

## 📋 Requisitos

- Node.js 18+ (para desarrollo local)
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Supabase](https://supabase.com)
- Git

---

## 💻 Desarrollo local

### Usar Vercel CLI (Recomendado)

```bash
npm run dev
```

Esto simula exactamente cómo correrá en producción.

```
✓ Ready! Available at http://localhost:3000
```

### Usar servidor Express (Alternativo)

Si tienes el backend Express antiguo:

```bash
cd backend
npm install
npm start
```

---

## 🚀 Desplegar a Vercel

### Paso 1: Crear proyecto en Vercel

```bash
vercel
```

Selecciona "Create a new project"

### Paso 2: Configurar variables de entorno

En Vercel Dashboard → Settings → Environment Variables

```
SUPABASE_URL     = https://xxxx.supabase.co
SUPABASE_KEY     = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET       = tu_secreto_super_seguro
```

### Paso 3: Desplegar

```bash
vercel --prod
```

Tu app estará en: `https://tu-proyecto.vercel.app`

---

## 📡 Endpoints API

### Health Check
```
GET /api
```

### Autenticación
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "adminpass"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": 1,
    "nombre": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Productos

```bash
# Listar
GET /api/inventory/productos
Authorization: Bearer <token>

# Crear
POST /api/inventory/productos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Aceite Motor",
  "codigo_interno": "AM001",
  "precio_venta": 12,
  "precio_costo": 8
}
```

### Categorías

```bash
# Listar
GET /api/inventory/categorias
Authorization: Bearer <token>

# Crear
POST /api/inventory/categorias/crear
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Lubricantes",
  "descripcion": "Aceites y lubricantes"
}
```

### Configuración

```bash
# Obtener todas
GET /api/configuracion
Authorization: Bearer <token>

# Obtener valor específico
GET /api/configuracion/porcentaje_ganancia
Authorization: Bearer <token>
```

---

## 🔑 Variables de entorno

### Para desarrollo

Crear `.env.local`:

```env
# Supabase (Obligatorio)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT (Obligatorio)
JWT_SECRET=mi_secreto_super_seguro_cambiar_en_produccion

# Node Environment (Opcional)
NODE_ENV=development
```

### Para producción (Vercel)

Configurar en Vercel Dashboard:

```
Settings → Environment Variables
```

---

## 🧪 Testing

### Verificar que el API funciona

```bash
# Obtener token
TOKEN=$(curl -s -X POST https://tu-proyecto.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpass"}' \
  | jq -r '.token')

# Usar token
curl https://tu-proyecto.vercel.app/api/inventory/productos \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### Error: "SUPABASE_URL is not defined"

✅ **Solución:**
```bash
vercel env list
# Asegurar que SUPABASE_URL y SUPABASE_KEY estén listados

vercel env add SUPABASE_URL https://xxxx.supabase.co
vercel env add SUPABASE_KEY eyJhbGc...
```

### Error: "Function returned with status 502"

✅ **Solución:**
```bash
# Ver logs
vercel logs

# Asegurar que el código esté correcto en /api
# Reinstalar dependencias
npm install @supabase/supabase-js jsonwebtoken
```

### Error: "CORS error"

✅ **Solución:** Ya está configurado en `api/utils.js`. Si persiste:

```javascript
// Verificar que setCorsHeaders se llamó
setCorsHeaders(res);
```

### El frontend no se conecta al API

✅ **Solución:** El frontend auto-detecta la URL. En `frontend/app.js`:

```javascript
// Si estás en producción, usa:
return window.location.origin + '/api';

// Si estás en localhost:
return 'http://localhost:3000/api';  // Con vercel dev
// o
return 'http://localhost:3001/api';  // Con Express backend
```

---

## 📚 Documentación completa

- [VERCEL_MIGRATION.md](VERCEL_MIGRATION.md) - Guía de migración
- [SERVERLESS_SUMMARY.md](SERVERLESS_SUMMARY.md) - Resumen técnico
- [API.md](API.md) - Referencia de endpoints
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Solución de problemas

---

## 🔐 Seguridad

- ✅ Contraseñas con hash bcrypt
- ✅ JWT con expiración
- ✅ CORS configurado
- ✅ Validación de entrada
- ✅ Variables de entorno protegidas

---

## 📊 Performance

- ⚡ **Latencia global**: < 50ms
- 📈 **Auto-scaling**: Automático con tráfico
- 💾 **Base de datos**: Supabase PostgreSQL
- 🌍 **CDN**: Vercel Edge Network

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios mayores:

1. Fork el repo
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT - Ver [LICENSE](LICENSE) para detalles

---

## 👨‍💻 Soporte

- **Issues**: https://github.com/tu-usuario/tienda-mvp/issues
- **Discussions**: https://github.com/tu-usuario/tienda-mvp/discussions
- **Email**: tu-email@example.com

---

**Última actualización**: Febrero 2026
**Versión**: 2.0 Serverless Edition

