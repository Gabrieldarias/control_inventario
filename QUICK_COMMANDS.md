# 🚀 QUICK COMMANDS - Todos los comandos que necesitas

## 📋 Setup inicial (5 minutos)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Loguear en Vercel
vercel login

# 3. Entrar al proyecto
cd tienda-mvp

# 4. Instalar dependencias
npm install

# 5. Probar localmente
npm run dev
# Abre http://localhost:3000
```

---

## 🌍 Desplegar a Vercel (1 minuto)

```bash
# Un solo comando
vercel --prod
```

---

## 🔐 Configurar variables de entorno

```bash
# En Vercel CLI
vercel env add SUPABASE_URL https://xxxx.supabase.co
vercel env add SUPABASE_KEY eyJhbGc...
vercel env add JWT_SECRET tu_secreto_super_seguro

# Luego redeploy
vercel --prod
```

---

## 🧪 Testing endpoints

```bash
# Health check
curl https://tu-proyecto.vercel.app/api

# Login (obtener token)
TOKEN=$(curl -s -X POST https://tu-proyecto.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpass"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# Listar productos
curl https://tu-proyecto.vercel.app/api/inventory/productos \
  -H "Authorization: Bearer $TOKEN"

# Listar categorías
curl https://tu-proyecto.vercel.app/api/inventory/categorias \
  -H "Authorization: Bearer $TOKEN"

# Obtener configuración
curl https://tu-proyecto.vercel.app/api/configuracion \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Ver logs de Vercel

```bash
# Logs en tiempo real
vercel logs

# Logs filtrados
vercel logs --limit 50

# Logs de función específica
vercel logs /api/auth/login
```

---

## 📝 Desarrollo local sin Vercel CLI

```bash
# Si prefieres Express backend tradicional
cd backend
npm install
npm start
# Abre http://localhost:3001
```

---

## 🔄 Git workflow

```bash
# Commit y push
git add .
git commit -m "feat: Tu cambio aquí"
git push

# Redeploy a Vercel
vercel --prod

# O si configuraste auto-deploy, se hace automáticamente
```

---

## 🗑️ Limpiar y resetear

```bash
# Eliminar variables locales (empezar de cero)
rm .env.local

# Reinstalar dependencias
rm -rf node_modules
npm install

# Limpiar Vercel (si necesitas)
vercel remove tienda-mvp --confirm
```

---

## 🔍 Ver estado de deploy

```bash
# Listar todos tus deploys
vercel list

# Ver detalles de un deploy
vercel inspect [URL]

# Monitorear en tiempo real
vercel logs --follow
```

---

## 🎯 Crear tabla en Supabase (necesario una sola vez)

```bash
# Ejecutar el SQL en Supabase SQL Editor
# Copiar contenido de: backend/scripts/init_db.js
# O usar el export-supabase.sql existente
```

---

## 📱 Test desde móvil

```bash
# Desde Android/iOS en misma red WiFi
https://tu-proyecto.vercel.app

# O desde cualquier lado (está en internet)
https://tu-proyecto.vercel.app
```

---

## 💰 Monitorear costos

En Vercel Dashboard:
- Analytics → Usage
- Ver consumo de Functions, Database, etc.

---

## 🔐 Rotar secretos

Si necesitas cambiar JWT_SECRET:

```bash
# 1. En Vercel
vercel env add JWT_SECRET nuevo_secreto

# 2. Redeploy
vercel --prod

# 3. Todos los tokens viejos se invalidarán
```

---

## 🌐 Asociar dominio personalizado

```bash
# En Vercel Dashboard:
# Settings → Domains → Add domain
# Seguir instrucciones para DNS

# O desde CLI:
vercel domains add tudominio.com
```

---

## 📊 Analytics y monitoring

```bash
# Ver estadísticas
vercel analytics

# Configurar alertas en Dashboard
# Settings → Alerts → Add alert
```

---

## 🐛 Debug en producción

```bash
# Ver últimos 50 logs
vercel logs --limit 50

# Buscar error específico
vercel logs | grep "error"

# Seguir logs en tiempo real
vercel logs --follow
```

---

## 🎬 Casos de uso rápido

### Agregar nueva función serverless

```bash
# 1. Crear archivo
mkdir -p api/ruta/nueva
touch api/ruta/nueva/endpoint.js

# 2. Escribir función (copiar template de api/inventory/productos/index.js)

# 3. Deploy automático al hacer push
git add api/ruta/nueva/endpoint.js
git commit -m "feat: Nueva función"
git push
vercel --prod
```

### Actualizar variables de entorno

```bash
vercel env add MI_VARIABLE valor
vercel --prod
```

### Revertir a deploy anterior

```bash
# Ver historial
vercel list

# Revertir a URL anterior
vercel rollback [URL]
```

---

## 🎉 Resumen

| Tarea | Comando |
|-------|---------|
| Setup inicial | `vercel login && npm install && npm run dev` |
| Deploy | `vercel --prod` |
| Ver logs | `vercel logs` |
| Configurar vars | `vercel env add CLAVE valor` |
| Listar deploys | `vercel list` |
| Test | `curl https://...` |
| Dominio | Dashboard → Domains → Add domain |

---

**Todo está listo. ¡A producción!** 🚀

