# ✅ CHECKLIST PRE-DEPLOYMENT

## 📋 Verificación Antes de Subir a GitHub

### 1. Funcionamiento Local

- [ ] Login funciona en `frontend/index.html`
- [ ] Variables configuradas en localStorage (via `config.html`)
- [ ] Usuario creado en Supabase Auth
- [ ] Sin errores en consola del navegador
- [ ] API endpoints responden correctamente

### 2. Archivos Sensibles

- [ ] `.gitignore` existe y está configurado
- [ ] `.env` y `.env.local` están en `.gitignore`
- [ ] `frontend/env.js` está en `.gitignore`
- [ ] No hay credenciales hardcodeadas en el código

### 3. Documentación

- [ ] `README.md` está actualizado
- [ ] Guías de deployment creadas
- [ ] Instrucciones claras para otros desarrolladores

### 4. Código Limpio

- [ ] Sin `console.log()` innecesarios
- [ ] Sin código comentado innecesario
- [ ] Sin archivos temporales

---

## 🌐 Checklist GitHub

### Crear Repositorio

- [ ] Nombre: `tienda-mvp` (o tu preferencia)
- [ ] Visibilidad: Público o Privado
- [ ] NO marcar "Add README" (ya tienes uno)

### Primer Push

- [ ] `git init` ejecutado
- [ ] `git add .` agregó todos los archivos
- [ ] `git commit -m "mensaje"` creó el commit
- [ ] `git remote add origin URL` conectó con GitHub
- [ ] `git push -u origin main` subió el código

### Verificación en GitHub

- [ ] README.md se ve correctamente
- [ ] Estructura de carpetas correcta
- [ ] No hay archivos `.env` visibles
- [ ] No hay `node_modules/` en el repo

---

## ☁️ Checklist Vercel

### Preparación

- [ ] Cuenta de Vercel creada
- [ ] Conectada con GitHub
- [ ] Credenciales de Supabase listas:
  - [ ] Project URL
  - [ ] anon public key
  - [ ] service_role key
  - [ ] JWT_SECRET generado

### Importar Proyecto

- [ ] Repositorio importado en Vercel
- [ ] Framework: "Other" o vacío
- [ ] Build Command: vacío
- [ ] Output Directory: `.` (punto)

### Variables de Entorno

#### Frontend (Públicas):
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada

#### Backend (Privadas):
- [ ] `SUPABASE_URL` configurada
- [ ] `SUPABASE_KEY` (service_role) configurada
- [ ] `JWT_SECRET` configurada

### Deploy

- [ ] Deploy exitoso (sin errores)
- [ ] URL de producción generada
- [ ] Build logs sin errores

---

## 🧪 Checklist Post-Deployment

### Verificar Producción

- [ ] La app carga correctamente
- [ ] No hay errores en consola
- [ ] CSS se carga correctamente
- [ ] Supabase SDK se carga desde CDN

### Login Funcional

- [ ] Formulario de login visible
- [ ] Login con `admin@example.com` funciona
- [ ] Token se guarda correctamente
- [ ] Dashboard se muestra después del login

### Variables en Producción

Opción A - Inyección automática:
- [ ] `frontend/env.js` se genera en build
- [ ] Variables cargadas desde `window.ENV`

Opción B - Manual:
- [ ] Configurar en consola del navegador:
  ```javascript
  localStorage.setItem('SUPABASE_URL', 'url');
  localStorage.setItem('SUPABASE_ANON_KEY', 'key');
  ```

### API Serverless

- [ ] `GET /api` responde correctamente
- [ ] `POST /api/auth/login` (si lo usas) funciona
- [ ] `GET /api/inventory/productos` requiere auth
- [ ] Headers CORS configurados

---

## 🔍 Tests de Verificación

### Test 1: Health Check

```bash
curl https://tu-app.vercel.app/api
```

**Esperado:**
```json
{
  "message": "API funciona correctamente",
  "version": "2.0",
  "timestamp": "..."
}
```

### Test 2: Login

```bash
curl -X POST https://tu-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpass"}'
```

**Esperado:**
```json
{
  "token": "eyJ...",
  "usuario": { ... }
}
```

### Test 3: Frontend Login

1. Abrir app en navegador
2. Abrir DevTools (F12)
3. Intentar login
4. Verificar en consola:
   - ✅ "Login exitoso"
   - ✅ Token guardado en localStorage

---

## ⚠️ Problemas Comunes

### En GitHub

| Problema | Solución |
|----------|----------|
| `.env` visible en repo | Agregarlo a `.gitignore` y hacer commit |
| `node_modules/` en repo | Agregarlo a `.gitignore`, eliminar cache Git |
| Push rechazado | Hacer pull primero: `git pull origin main` |

### En Vercel

| Problema | Solución |
|----------|----------|
| Build falla | Verificar `vercel.json` y `package.json` |
| 404 en API | Verificar que `/api` esté en la raíz |
| Variables no cargadas | Verificar Environment Variables en Settings |

### En Producción

| Problema | Solución |
|----------|----------|
| Login no funciona | Configurar variables en localStorage o `env.js` |
| Error CORS | Verificar `setCorsHeaders()` en funciones API |
| Token inválido | Verificar JWT_SECRET en Vercel |

---

## 📊 Resumen Final

### ✅ Listo para GitHub cuando:
- [x] Login funciona localmente
- [x] `.gitignore` configurado
- [x] Sin credenciales en código
- [x] Documentación completa

### ✅ Listo para Vercel cuando:
- [x] Código en GitHub
- [x] Variables de entorno preparadas
- [x] Usuarios creados en Supabase Auth
- [x] Configuración de proyecto lista

### ✅ Deploy exitoso cuando:
- [x] Build completa sin errores
- [x] URL de producción accesible
- [x] Login funciona en producción
- [x] API responde correctamente

---

## 🎉 ¡Todo Listo!

Si todos los checkboxes están marcados, estás listo para:

```bash
# 1. Push a GitHub
git add .
git commit -m "Ready for production deployment"
git push origin main

# 2. Deploy en Vercel
# Ve a vercel.com/new y sigue los pasos
```

**Ver guías detalladas:**
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guía paso a paso
- [GIT_COMMANDS.md](GIT_COMMANDS.md) - Comandos Git
- [QUICK_START_AUTH.md](QUICK_START_AUTH.md) - Setup de autenticación

---

**¿Problemas?** Revisa [TROUBLESHOOTING.md](TROUBLESHOOTING.md) o consulta las guías específicas. 🚀
