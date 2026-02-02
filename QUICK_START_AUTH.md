# 🎯 QUICK START - Login con Supabase Auth

## ⚡ TL;DR - Configuración Rápida (5 minutos)

### 1️⃣ Configurar Supabase

```bash
# 1. Ve a https://supabase.com/dashboard
# 2. Crea un proyecto (o usa el existente)
# 3. Ve a Settings → API
# 4. Copia:
#    - Project URL
#    - anon public key
```

### 2️⃣ Crear Usuario de Prueba

```sql
-- En Supabase → SQL Editor, ejecuta:

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('adminpass', gen_salt('bf')),
  NOW(),
  '{"role": "admin", "nombre": "Admin"}',
  NOW(),
  NOW()
);
```

### 3️⃣ Desarrollo Local

**Opción A - Usar página de configuración (RECOMENDADO):**
```bash
# Abre en el navegador:
frontend/config.html

# Completa el formulario con:
# - SUPABASE_URL: https://tu-proyecto.supabase.co
# - SUPABASE_ANON_KEY: eyJ...
```

**Opción B - Consola del navegador (F12):**
```javascript
localStorage.setItem('SUPABASE_URL', 'https://tu-proyecto.supabase.co');
localStorage.setItem('SUPABASE_ANON_KEY', 'eyJ...');
location.reload();
```

### 4️⃣ Verificar

Abre `frontend/index.html` y verifica en consola:
```
🔧 Supabase Config Check:
  📍 URL: ✅ Configurada
  🔑 Anon Key: ✅ Configurada
✅ Supabase Client cargado correctamente
💡 Usa window.supabaseAuth.login(email, password) para autenticar
```

### 5️⃣ Login

```
Email: admin@example.com
Password: adminpass
```

---

## 🚀 Deploy a Vercel (5 minutos)

### 1️⃣ Configurar Variables

En Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL = https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_URL = https://tu-proyecto.supabase.co
SUPABASE_KEY = eyJ... (service_role key)
JWT_SECRET = secreto_aleatorio_aqui
```

### 2️⃣ Deploy

```bash
vercel --prod
```

### 3️⃣ Verificar

Abre tu app en Vercel e intenta hacer login.

---

## 📋 Archivos Creados/Modificados

### ✨ Nuevos Archivos

- `frontend/supabaseClient.js` - Cliente Supabase para navegador
- `frontend/config.html` - Página de configuración local
- `SUPABASE_AUTH_SETUP.md` - Guía completa de setup
- `SUPABASE_AUTH_MIGRATION.md` - Resumen de cambios
- `.env.example` - Template de variables
- `QUICK_START_AUTH.md` - Esta guía

### 📝 Archivos Modificados

- `frontend/index.html` - Carga Supabase SDK y supabaseClient.js
- `frontend/app.js` - Login usa Supabase Auth
- `vercel.json` - Removida sección env
- `.env.local` - Agregadas variables NEXT_PUBLIC_*

---

## 🔍 Troubleshooting Rápido

### Error: "Supabase Auth no está configurado"

```bash
# Verifica que index.html cargue supabaseClient.js ANTES de app.js
# Debe verse así:
<script src="supabaseClient.js"></script>
<script type="text/babel" src="app.js"></script>
```

### Error: "Invalid login credentials"

```bash
# El usuario no existe en Supabase Auth
# Créalo desde: Dashboard → Authentication → Users → Add user
```

### Error: Variables no configuradas

```bash
# En consola verás: ❌ Faltante
# Opción 1: Abre frontend/config.html y completa el formulario
# Opción 2: En consola del navegador ejecuta:
localStorage.setItem('SUPABASE_URL', 'https://tu-proyecto.supabase.co');
localStorage.setItem('SUPABASE_ANON_KEY', 'eyJ...');
location.reload();
```

### Error: "Unexpected token" o "import/export"

```bash
# ✅ Ya resuelto - Babel eliminado
# Si aún lo ves, verifica que index.html NO tenga:
# - <script src="babel.min.js"></script>
# - type="text/babel"
```

---

## 📚 Documentación Completa

- `SUPABASE_AUTH_SETUP.md` - Guía paso a paso completa
- `SUPABASE_AUTH_MIGRATION.md` - Detalles técnicos de la migración
- `CODE_EXAMPLES.md` - Ejemplos de código
- `.env.example` - Variables de entorno

---

## ✅ Checklist

- [ ] Proyecto Supabase creado
- [ ] URL y anon key copiadas
- [ ] Usuario admin creado en Supabase Auth
- [ ] Variables configuradas en localStorage (local) o Vercel (prod)
- [ ] Login probado exitosamente
- [ ] Consola muestra "✅ Login exitoso"

---

## 🎉 ¡Listo!

Si todo está configurado correctamente, deberías poder:

1. Abrir la aplicación
2. Ver el formulario de login
3. Ingresar con `admin@example.com` / `adminpass`
4. Ver en consola: "✅ Login exitoso"
5. Acceder al dashboard

---

## 🆘 ¿Problemas?

1. Revisa la consola del navegador (F12)
2. Verifica que las variables estén configuradas
3. Confirma que el usuario existe en Supabase Auth
4. Lee `SUPABASE_AUTH_SETUP.md` para más detalles

---

**Happy coding! 🚀**
