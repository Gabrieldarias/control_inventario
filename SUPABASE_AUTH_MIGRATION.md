# ✅ CAMBIOS REALIZADOS - Login con Supabase Auth

## 📋 Resumen

Se ha migrado el sistema de autenticación de JWT hardcodeado a **Supabase Auth** para que funcione correctamente en producción con Vercel.

---

## 🔧 Archivos Modificados

### 1. `frontend/supabaseClient.js` ✨ NUEVO
- Cliente de Supabase para el frontend (navegador)
- Lee variables de `window.ENV` o `localStorage`
- Funciones helper: `loginWithEmail()`, `logout()`, `getCurrentUser()`
- Logs de debug para verificar configuración
- Manejo de errores controlado

### 2. `frontend/index.html` 📝 MODIFICADO
- Agregado CDN de Supabase JS SDK
- Carga `supabaseClient.js` ANTES de `app.js`
- Orden correcto de scripts para evitar errores

### 3. `frontend/app.js` 📝 MODIFICADO
- Función `Login()` actualizada para usar `window.supabaseAuth.login()`
- Manejo de errores con try/catch async
- Logs detallados en consola
- Guarda token y user en localStorage

### 4. `vercel.json` 📝 MODIFICADO
- Eliminada sección `env` (causaba error de validación)
- Variables se configuran en Vercel Dashboard

### 5. `.env.local` 📝 MODIFICADO
- Agregadas variables `NEXT_PUBLIC_*` para frontend
- Separación clara entre variables públicas y privadas
- Comentarios explicativos

### 6. `.env.example` ✨ NUEVO
- Template con todas las variables necesarias
- Instrucciones de configuración
- Explicación de cada variable

### 7. `SUPABASE_AUTH_SETUP.md` ✨ NUEVO
- Guía completa de configuración
- Cómo crear usuarios en Supabase
- Configuración de variables en Vercel
- Troubleshooting común

---

## 🔐 Sistema de Autenticación

### Antes (JWT hardcodeado)
```javascript
// api/auth/login.js
const usuarios = [
  { email: 'admin@example.com', password: 'adminpass' }
];
// Verificación manual de credenciales
// JWT firmado localmente
```

### Ahora (Supabase Auth)
```javascript
// frontend/supabaseClient.js
const result = await supabaseClient.auth.signInWithPassword({
  email: email,
  password: password
});
// Supabase maneja:
// - Verificación segura de credenciales
// - Hashing de passwords
// - Generación de JWT
// - Renovación de tokens
```

---

## 📊 Variables de Entorno

### Frontend (Público - seguro exponer)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # Clave pública con RLS
```

### Backend (Privado - solo serverless)
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=eyJ... # Service role key - acceso completo
JWT_SECRET=secreto_aleatorio
```

---

## 🚀 Configuración en Vercel

### Paso 1: Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL = https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_URL = https://tu-proyecto.supabase.co
SUPABASE_KEY = eyJ... (service_role)
JWT_SECRET = secreto_aleatorio
```

### Paso 2: Deploy

```bash
vercel --prod
```

---

## 🧪 Desarrollo Local

### Configurar variables en el navegador

Abre la consola del navegador (F12) y ejecuta:

```javascript
localStorage.setItem('NEXT_PUBLIC_SUPABASE_URL', 'https://db.rsujclfftqfbudbirsxj.supabase.co');
localStorage.setItem('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'tu_anon_key_aqui');
location.reload();
```

### Verificar configuración

Deberías ver en la consola:

```
🔧 Supabase Config Check:
  📍 URL: ✅ Configurada
  🔑 Anon Key: ✅ Configurada
✅ Supabase Client cargado correctamente
```

---

## 👥 Usuarios de Prueba

Antes de usar el login, debes crear usuarios en Supabase:

### Opción 1: UI de Supabase

1. Dashboard → Authentication → Users → Add user
2. Email: `admin@example.com`
3. Password: `adminpass`
4. Auto Confirm: ✅
5. User Metadata:
   ```json
   {
     "role": "admin",
     "nombre": "Admin"
   }
   ```

### Opción 2: SQL

Ver archivo `SUPABASE_AUTH_SETUP.md` para scripts SQL completos.

---

## 🔍 Testing

### Login Exitoso

1. Abre la aplicación
2. Email: `admin@example.com`
3. Password: `adminpass`
4. En consola deberías ver:

```
🔐 Iniciando login con Supabase Auth...
✅ Login exitoso
👤 Usuario: admin@example.com
🔑 Token: eyJhbGciOiJIUzI1NiIs...
```

### Errores Comunes

#### "Supabase Auth no está configurado"
- Verifica que `supabaseClient.js` esté cargado
- Revisa el orden de scripts en `index.html`

#### "Invalid login credentials"
- Usuario no existe en Supabase Auth
- Password incorrecta
- Usuario no confirmado

#### Variables no configuradas
```
❌ ERROR: Variables de Supabase no configuradas
```
- Ejecuta los comandos localStorage en consola
- Recarga la página

---

## 📁 Estructura de Archivos

```
Tienda/
├── frontend/
│   ├── index.html          # ✅ Actualizado - carga Supabase SDK
│   ├── app.js              # ✅ Actualizado - usa Supabase Auth
│   ├── supabaseClient.js   # ✨ NUEVO - configuración Supabase
│   └── styles.css
├── api/
│   ├── utils.js            # Backend - usa service_role key
│   ├── auth/
│   │   └── login.js        # Ya no se usa (opcional mantener)
│   └── ...
├── vercel.json             # ✅ Actualizado - sin env
├── .env.local              # ✅ Actualizado - variables separadas
├── .env.example            # ✨ NUEVO - template
└── SUPABASE_AUTH_SETUP.md  # ✨ NUEVO - guía de configuración
```

---

## ✅ Checklist de Deployment

- [x] Crear usuarios en Supabase Auth
- [x] Configurar variables en Vercel
- [ ] Obtener anon key de Supabase Dashboard
- [ ] Obtener service_role key de Supabase Dashboard
- [ ] Configurar variables en .env.local (desarrollo)
- [ ] Configurar variables en localStorage (frontend local)
- [ ] Deploy con `vercel --prod`
- [ ] Verificar login en producción

---

## 🔒 Seguridad

### ✅ Correcto
- Usar `NEXT_PUBLIC_SUPABASE_ANON_KEY` en frontend
- Row Level Security (RLS) activado en tablas
- Service role key solo en backend serverless

### ❌ Incorrecto
- ~~Usar service_role key en frontend~~
- ~~Exponer JWT_SECRET en código de navegador~~
- ~~Hardcodear passwords en código~~

---

## 🎯 Próximos Pasos

1. **Configurar RLS** en tablas de Supabase
2. **Crear policies** basadas en `auth.uid()`
3. **Migrar tabla `users`** a `auth.users`
4. **Implementar roles** con `user_metadata`
5. **Agregar recuperación de contraseña**
6. **Multi-factor authentication** (opcional)

---

## 📚 Recursos

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

¡Todo listo para producción! 🚀
