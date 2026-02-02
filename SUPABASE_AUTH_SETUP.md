# 🔐 Configuración de Usuarios en Supabase Auth

## 1️⃣ Acceder a Supabase Dashboard

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Ingresa con tu cuenta
3. Selecciona tu proyecto

---

## 2️⃣ Crear Usuarios de Prueba

### Opción A: Desde la UI de Supabase

1. En el menú lateral, haz clic en **"Authentication"** → **"Users"**
2. Haz clic en **"Add user"** → **"Create new user"**
3. Completa el formulario:

#### Usuario Admin

```
Email: admin@example.com
Password: adminpass
Auto Confirm User: ✅ Activado
```

4. Después de crear el usuario, haz clic en el usuario creado
5. En la sección **"User Metadata"**, agrega:

```json
{
  "role": "admin",
  "nombre": "Admin"
}
```

#### Usuario Vendedor

```
Email: vendedor@example.com
Password: vendedorpass
Auto Confirm User: ✅ Activado
```

User Metadata:
```json
{
  "role": "vendedor",
  "nombre": "Vendedor"
}
```

#### Usuario Gabriel

```
Email: gabo@gmail.com
Password: gabo
Auto Confirm User: ✅ Activado
```

User Metadata:
```json
{
  "role": "admin",
  "nombre": "Gabriel"
}
```

---

### Opción B: Desde SQL Editor (más rápido)

1. Ve a **"SQL Editor"** en el menú lateral
2. Ejecuta este script:

```sql
-- Crear usuarios en auth.users
-- NOTA: Supabase Auth maneja las passwords de forma segura

-- Estos comandos requieren acceso administrativo
-- Ejecutar desde el SQL Editor del Dashboard de Supabase

-- Insertar usuario admin
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
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
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
  NOW(),
  '',
  '',
  '',
  ''
);

-- Insertar usuario vendedor
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
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'vendedor@example.com',
  crypt('vendedorpass', gen_salt('bf')),
  NOW(),
  '{"role": "vendedor", "nombre": "Vendedor"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Insertar usuario gabriel
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
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'gabo@gmail.com',
  crypt('gabo', gen_salt('bf')),
  NOW(),
  '{"role": "admin", "nombre": "Gabriel"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

---

## 3️⃣ Configurar Variables de Entorno en Vercel

### En Vercel Dashboard:

1. Ve a tu proyecto en [vercel.com/dashboard](https://vercel.com/dashboard)
2. Settings → Environment Variables
3. Agrega estas variables:

```bash
# Variable 1
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://tu-proyecto.supabase.co

# Variable 2
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE:** 
- Usa la **anon public key**, NO la service_role key
- La anon key es segura para usar en el frontend
- La service_role key NUNCA debe exponerse en el frontend

### Obtener las claves:

1. En Supabase Dashboard → Settings → API
2. **Project URL** → Copia para `NEXT_PUBLIC_SUPABASE_URL`
3. **anon public** → Copia para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 4️⃣ Desarrollo Local

Para probar en local sin Vercel, ejecuta en la consola del navegador (F12):

```javascript
// Configurar variables localmente
localStorage.setItem('NEXT_PUBLIC_SUPABASE_URL', 'https://tu-proyecto.supabase.co');
localStorage.setItem('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

// Recargar la página
location.reload();
```

---

## 5️⃣ Verificar Configuración

Después de configurar, verifica en la consola del navegador:

```
🔧 Supabase Config Check:
  📍 URL: ✅ Configurada
  🔑 Anon Key: ✅ Configurada
✅ Supabase Client cargado correctamente
```

Si ves ❌, revisa que las variables estén configuradas correctamente.

---

## 6️⃣ Testing de Login

Prueba el login con estos usuarios:

### Admin
```
Email: admin@example.com
Password: adminpass
```

### Vendedor
```
Email: vendedor@example.com
Password: vendedorpass
```

### Gabriel
```
Email: gabo@gmail.com
Password: gabo
```

---

## 7️⃣ Troubleshooting

### Error: "Invalid login credentials"

- Verifica que el usuario existe en Authentication → Users
- Verifica que la contraseña sea correcta
- Confirma que el usuario está activo (no baneado)

### Error: "Supabase Auth no está configurado"

- Verifica que `supabaseClient.js` esté cargado ANTES de `app.js` en `index.html`
- Revisa la consola del navegador para errores de carga

### Error: Variables no configuradas

- En Vercel: Verifica que las variables estén en Settings → Environment Variables
- En local: Ejecuta los comandos localStorage en la consola
- Recarga la página después de configurar

### Login funciona pero no muestra datos

- Verifica que el usuario tenga `user_metadata` con `role` y `nombre`
- Revisa la respuesta del login en la consola (debe incluir `user.user_metadata`)

---

## 8️⃣ Seguridad

✅ **Correcto:**
- Usar `NEXT_PUBLIC_SUPABASE_ANON_KEY` en frontend
- Row Level Security (RLS) activado en tablas
- Policies configuradas para cada tabla

❌ **Incorrecto:**
- Usar `service_role` key en frontend
- Exponer claves privadas
- Desactivar RLS sin configurar policies

---

## 9️⃣ Próximos Pasos

Una vez que el login funcione, considera:

1. **Configurar RLS (Row Level Security)** en tus tablas
2. **Crear policies** para restringir acceso según rol
3. **Migrar tabla users** de tu base de datos a `auth.users`
4. **Implementar recuperación de contraseña**
5. **Agregar autenticación de dos factores** (opcional)

---

¡Listo! Con esto tu autenticación con Supabase debería funcionar correctamente. 🚀
