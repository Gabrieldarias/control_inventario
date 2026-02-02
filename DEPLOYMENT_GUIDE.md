# 🚀 GUÍA DE DEPLOYMENT - GitHub + Vercel

## ✅ Prerequisitos

Antes de subir a GitHub, asegúrate de que funciona localmente:

- [x] Login funciona en `frontend/index.html`
- [x] Variables configuradas en `localStorage` (via `config.html`)
- [x] Usuario creado en Supabase Auth
- [x] Sin errores en consola del navegador

---

## 📦 PASO 1: Preparar el Proyecto para GitHub

### 1.1 Verificar .gitignore

El archivo `.gitignore` ya está configurado para NO subir:
- ❌ `node_modules/`
- ❌ `.env` y `.env.local`
- ❌ Base de datos SQLite (`*.db`)
- ❌ Archivos temporales

✅ **Esto está correcto** - No subirás datos sensibles.

### 1.2 Verificar Archivos Necesarios

Asegúrate de que estos archivos ESTÉN en el repositorio:

```
✅ frontend/
   ✅ index.html
   ✅ app.js
   ✅ supabaseClient.js
   ✅ config.html
   ✅ styles.css

✅ api/
   ✅ utils.js
   ✅ middleware/auth.js
   ✅ auth/login.js
   ✅ inventory/productos/index.js
   ✅ ... (todas las funciones serverless)

✅ Configuración:
   ✅ vercel.json
   ✅ package.json
   ✅ .gitignore

✅ Documentación:
   ✅ README.md
   ✅ QUICK_START_AUTH.md
   ✅ NO_BABEL_SETUP.md
   ✅ SUPABASE_AUTH_SETUP.md
```

---

## 🌐 PASO 2: Subir a GitHub

### 2.1 Inicializar Git (si no lo has hecho)

```bash
# Dentro de la carpeta Tienda/
git init
git add .
git commit -m "Initial commit - Sistema Tienda MVP con Supabase Auth"
```

### 2.2 Crear Repositorio en GitHub

1. Ve a [https://github.com/new](https://github.com/new)
2. Nombre: `tienda-mvp` (o el que prefieras)
3. Descripción: `Sistema de gestión de inventario con Vercel + Supabase`
4. **NO marques** "Add README" (ya tienes uno)
5. Haz clic en "Create repository"

### 2.3 Conectar y Subir

```bash
# Reemplaza TU_USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/tienda-mvp.git
git branch -M main
git push -u origin main
```

✅ **Tu código ya está en GitHub**

---

## ☁️ PASO 3: Desplegar en Vercel

### 3.1 Conectar GitHub con Vercel

1. Ve a [https://vercel.com/login](https://vercel.com/login)
2. Inicia sesión con GitHub
3. Haz clic en **"Add New..."** → **"Project"**
4. Selecciona tu repositorio `tienda-mvp`
5. Haz clic en **"Import"**

### 3.2 Configurar el Proyecto

En la pantalla de configuración:

```
Framework Preset: Other (o déjalo en blanco)
Build Command: (dejar vacío)
Output Directory: . (punto)
Install Command: npm install
```

**⚠️ NO hagas deploy todavía** - Primero configura las variables de entorno.

### 3.3 Configurar Variables de Entorno

En la misma pantalla, ve a **"Environment Variables"** y agrega:

#### Variables para FRONTEND (Públicas):

```bash
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://db.rsujclfftqfbudbirsxj.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [tu_anon_key_aqui]
```

#### Variables para BACKEND (Privadas):

```bash
Name: SUPABASE_URL
Value: https://db.rsujclfftqfbudbirsxj.supabase.co

Name: SUPABASE_KEY
Value: [tu_service_role_key_aqui]

Name: JWT_SECRET
Value: [genera_uno_aleatorio]
```

**📝 Dónde obtener las claves:**

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Settings → API
4. Copia:
   - **Project URL** → `SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_KEY`

**🔐 Generar JWT_SECRET:**

En tu terminal local:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.4 Deploy

1. Haz clic en **"Deploy"**
2. Espera 1-2 minutos
3. ✅ ¡Listo!

---

## 🧪 PASO 4: Probar en Producción

### 4.1 Abrir la App

Vercel te dará una URL como:
```
https://tienda-mvp-tu-usuario.vercel.app
```

### 4.2 Configurar Variables de Frontend

**⚠️ IMPORTANTE:** En producción, las variables NO se cargan desde `localStorage` automáticamente.

Tienes dos opciones:

#### Opción A: Configurar en Vercel Build (Recomendado)

Crea un archivo `frontend/env.js`:

```javascript
// Este archivo se genera automáticamente en build
window.ENV = {
  SUPABASE_URL: 'https://db.rsujclfftqfbudbirsxj.supabase.co',
  SUPABASE_ANON_KEY: 'tu_anon_key_aqui'
};
```

Luego en `index.html` carga este archivo ANTES de `supabaseClient.js`:

```html
<script src="env.js"></script>
<script src="supabaseClient.js"></script>
```

**⚠️ NO subas `env.js` a GitHub** - Agrégalo a `.gitignore`

#### Opción B: Usar Consola del Navegador (Temporal)

En la app de producción, abre consola (F12):

```javascript
localStorage.setItem('SUPABASE_URL', 'https://db.rsujclfftqfbudbirsxj.supabase.co');
localStorage.setItem('SUPABASE_ANON_KEY', 'tu_anon_key_aqui');
location.reload();
```

### 4.3 Verificar Login

1. Intenta hacer login con `admin@example.com` / `adminpass`
2. Verifica en consola:
   ```
   ✅ Login exitoso
   👤 Usuario: admin@example.com
   ```

---

## 🔄 PASO 5: Actualizar el Código (Futuro)

Cuando hagas cambios:

```bash
# 1. Hacer cambios en tu código local
# 2. Commit
git add .
git commit -m "Descripción de cambios"

# 3. Push a GitHub
git push origin main

# 4. Vercel detecta cambios automáticamente y redeploya
```

✅ **Deploy automático** - No necesitas hacer nada en Vercel.

---

## 🛠️ SOLUCIÓN MEJOR: Variables Inyectadas por Vercel

Para que las variables funcionen automáticamente en producción, modifica `supabaseClient.js`:

```javascript
// Leer desde window.ENV (inyectado por Vercel) o localStorage
function getEnvVar(key, fallback = null) {
  // Producción: Variables inyectadas
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
    return window.ENV[key];
  }
  
  // Desarrollo: localStorage
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored) return stored;
  }
  
  return fallback;
}

const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY');
```

Y en `vercel.json`, inyecta las variables públicas:

```json
{
  "buildCommand": "echo 'window.ENV={SUPABASE_URL:\"$NEXT_PUBLIC_SUPABASE_URL\",SUPABASE_ANON_KEY:\"$NEXT_PUBLIC_SUPABASE_ANON_KEY\"}' > frontend/env.js",
  "outputDirectory": ".",
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

---

## ✅ Checklist Final

### Antes de GitHub:
- [x] Login funciona localmente
- [x] `.gitignore` configurado
- [x] Sin archivos sensibles (`.env`)

### En GitHub:
- [ ] Repositorio creado
- [ ] Código subido con `git push`
- [ ] README.md visible

### En Vercel:
- [ ] Proyecto importado desde GitHub
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] URL de producción funcional

### En Producción:
- [ ] Login funciona en URL de Vercel
- [ ] Variables cargadas correctamente
- [ ] Sin errores en consola

---

## 🆘 Troubleshooting en Producción

### Error: Variables no definidas

**En consola verás:**
```
❌ ERROR: Variables de Supabase no configuradas
```

**Solución:**
- Verifica que configuraste las variables en Vercel Dashboard
- O usa la consola del navegador para configurar `localStorage`

### Error: API no responde

**Posible causa:** Variables privadas no configuradas

**Solución:**
- Ve a Vercel Dashboard → Settings → Environment Variables
- Verifica que `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET` estén configuradas

### Error 404 en funciones API

**Posible causa:** `vercel.json` no detecta las funciones

**Solución:**
- Verifica que `api/` esté en la raíz del proyecto
- Redeploya manualmente desde Vercel Dashboard

---

## 📚 Recursos

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [GitHub Docs](https://docs.github.com)

---

## 🎉 ¡Listo!

Tu aplicación estará disponible en:
```
https://tu-proyecto.vercel.app
```

**Próximos pasos opcionales:**
- Configurar dominio personalizado
- Configurar CI/CD
- Habilitar preview deployments
- Configurar SSL

¿Problemas? Revisa la sección de Troubleshooting o pregunta. 🚀
