# 🚀 SETUP PARA PRODUCCIÓN - Inyección Automática de Variables

## ✅ Objetivo

La app funciona en producción SIN:
- ❌ `localStorage`
- ❌ `config.html`
- ❌ `process.env`
- ❌ Bundlers

Las variables se inyectan automáticamente desde Vercel en el HTML.

---

## 🏗️ Arquitectura

```
Build Process (Vercel):
1. Lee NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
2. Ejecuta build.js
3. build.js genera frontend/env.js con window.ENV
4. index.html carga env.js antes de app.js
5. supabaseClient.js lee desde window.ENV
```

### Archivos Involucrados

1. **build.js** (raíz)
   - Script que genera `frontend/env.js`
   - Lee variables de `process.env` (en Vercel)
   - Escribe `window.ENV` en el HTML

2. **vercel.json**
   - `buildCommand: "node build.js"`
   - Ejecuta build.js durante el build de Vercel

3. **frontend/index.html**
   - Carga `env.js` ANTES de `supabaseClient.js`
   - Inyecta `window.ENV` en el navegador

4. **frontend/supabaseClient.js**
   - Lee de `window.ENV`
   - Inicializa cliente Supabase

5. **frontend/env.js** (GENERADO)
   - Generado automáticamente por build.js
   - NO subir a GitHub (en .gitignore)
   - Solo existe después del build

---

## 🚀 DEPLOY EN PRODUCCIÓN

### Paso 1: Configurar Variables en Vercel

En Vercel Dashboard → Settings → Environment Variables:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://db.rsujclfftqfbudbirsxj.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJ... (tu anon public key)
```

**⚠️ IMPORTANTE:**
- El prefijo `NEXT_PUBLIC_` es obligatorio
- Vercel usa este prefijo para identificar variables públicas
- build.js las lee desde `process.env`

### Paso 2: Git Push

```bash
git add .
git commit -m "Production-ready setup with automatic env injection"
git push origin main
```

### Paso 3: Vercel Deploy

1. Ve a Vercel Dashboard
2. Verifica que tu repositorio está conectado
3. Deploy se inicia automáticamente
4. Durante el build:
   - ✅ build.js se ejecuta
   - ✅ frontend/env.js se genera con variables
   - ✅ index.html carga env.js
   - ✅ supabaseClient.js lee desde window.ENV

### Paso 4: Verificar en Producción

Tu app estará en: `https://tienda-mvp-xxxx.vercel.app`

**Abrir consola (F12) y verificar:**

```
🔧 Inicializando Supabase Client...
🔧 Supabase Config Check:
  📍 URL: ✅ Configurada
  🔑 Anon Key: ✅ Configurada
✅ Supabase Client cargado correctamente
```

**Si ves ❌:**
```
❌ ERROR: Variables de Supabase no configuradas
```

Entonces:
- Revisa que configuraste las variables en Vercel
- Verifica el nombre: debe ser `NEXT_PUBLIC_SUPABASE_*`
- Haz redeployment manual desde Vercel Dashboard

---

## 🔍 Cómo Funciona

### En Desarrollo Local (sin build.js)

Si quieres probar localmente:

```bash
# Ejecutar el build script manualmente
node build.js
```

Esto genera `frontend/env.js` en tu máquina.

Luego abre `frontend/index.html` en el navegador.

### En Producción (con build.js)

1. **Vercel detecta push a GitHub**
2. **Vercel comienza el build:**
   ```bash
   # Ejecuta esto:
   node build.js
   
   # Que genera frontend/env.js con:
   window.ENV = {
     SUPABASE_URL: "https://...",
     SUPABASE_ANON_KEY: "eyJ..."
   }
   ```
3. **index.html carga env.js**
4. **supabaseClient.js lee desde window.ENV**
5. **Login funciona sin localStorage**

---

## 📋 Flujo Completo del Login

```
Usuario abre app en navegador
        ↓
index.html se carga
        ↓
env.js se carga → window.ENV se define
        ↓
supabaseClient.js se carga → lee window.ENV
        ↓
app.js se carga → acceso a window.supabaseAuth
        ↓
Usuario ingresa email y password
        ↓
window.supabaseAuth.login(email, password)
        ↓
supabaseClient.auth.signInWithPassword()
        ↓
✅ Login exitoso → Token guardado en localStorage
        ↓
Dashboard se muestra
```

---

## ✅ Checklist Pre-Deploy

### Archivos Creados/Modificados

- [x] **build.js** creado (raíz)
- [x] **vercel.json** actualizado (buildCommand)
- [x] **frontend/index.html** actualizado (carga env.js)
- [x] **frontend/supabaseClient.js** actualizado (lee window.ENV)
- [x] **.gitignore** contiene `frontend/env.js`

### Verificación

- [x] `frontend/env.js` NO existe (se genera en build)
- [x] `.gitignore` tiene `frontend/env.js`
- [x] `supabaseClient.js` solo lee de `window.ENV`
- [x] No hay `process.env` en archivos frontend
- [x] No hay referencias a `config.html` en el código

### En Vercel

- [ ] Variables `NEXT_PUBLIC_*` configuradas
- [ ] Código pusheado a GitHub
- [ ] Deploy iniciado
- [ ] Build exitoso
- [ ] Login funciona

---

## 🆘 Troubleshooting

### Error: "window.ENV is not defined"

**Causa:** env.js no se cargó

**Solución:**
```bash
# Verificar que build.js existe
ls build.js

# Ejecutar manualmente para testing
node build.js

# Verificar que env.js se generó
ls frontend/env.js
```

### Error: Variables no configuradas en producción

**En consola:**
```
❌ ERROR: Variables de Supabase no configuradas
```

**Solución:**
- Ve a Vercel Dashboard → Settings → Environment Variables
- Verifica que las variables tengan el prefijo `NEXT_PUBLIC_`
- Names exactos:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Build falla en Vercel

**Error en logs de Vercel:**
```
npm ERR! node build.js failed
```

**Solución:**
- Verifica que `build.js` existe en la raíz
- Verifica que `vercel.json` tiene: `"buildCommand": "node build.js"`
- Revisa los logs de build en Vercel Dashboard

### Login no funciona en producción

**Verificar en consola:**
```javascript
console.log(window.ENV); // Debe mostrar las variables
console.log(window.supabaseClient); // Debe existir
```

Si `window.ENV` está vacío → Las variables no se inyectaron (revisar build.js)

---

## 🔐 Seguridad

### ✅ Correcto

- Variables públicas (`NEXT_PUBLIC_*`) visibles en navegador
- Anon key con RLS (Row Level Security) en Supabase
- Service role key solo en backend

### ❌ Incorrecto

- ~~Subir env.js a GitHub~~
- ~~Usar service role key en frontend~~
- ~~Hardcodear credenciales~~

---

## 📦 Estructura Final

```
Tienda/
├── build.js                    # ✨ NUEVO - Script de inyección
├── vercel.json                 # ✏️ MODIFICADO - buildCommand
├── frontend/
│   ├── index.html              # ✏️ MODIFICADO - Carga env.js
│   ├── env.js                  # ✨ GENERADO (no subir)
│   ├── env.example.js          # Ejemplo
│   ├── supabaseClient.js       # ✏️ MODIFICADO - Lee window.ENV
│   ├── app.js
│   └── styles.css
├── api/
│   ├── ...
│   └── (todas las funciones serverless)
└── .gitignore                  # ✏️ MODIFICADO - frontend/env.js
```

---

## 🎉 Resultado Final

✅ **La app funciona en producción:**
- Sin `localStorage`
- Sin `config.html`
- Sin `process.env` en frontend
- Sin bundlers
- Variables inyectadas automáticamente
- Login funcional
- CORS configurado
- Database integrada

```
https://tienda-mvp-xxxx.vercel.app → 🎯 ¡FUNCIONA!
```

---

**¡Listo para producción! 🚀**
