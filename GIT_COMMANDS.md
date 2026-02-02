# 🚀 Comandos Git Rápidos

## Primer Push a GitHub

```bash
# 1. Inicializar repositorio (si no lo has hecho)
git init

# 2. Agregar todos los archivos
git add .

# 3. Commit inicial
git commit -m "Initial commit - Sistema Tienda MVP con Supabase Auth"

# 4. Conectar con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/tienda-mvp.git

# 5. Cambiar a rama main
git branch -M main

# 6. Push
git push -u origin main
```

---

## Actualizaciones Futuras

```bash
# Después de hacer cambios en tu código:

# 1. Ver cambios
git status

# 2. Agregar archivos modificados
git add .

# 3. Commit con mensaje descriptivo
git commit -m "Descripción de lo que cambiaste"

# 4. Push a GitHub
git push origin main

# ✅ Vercel detecta cambios y redeploya automáticamente
```

---

## Comandos Útiles

### Ver estado del repositorio
```bash
git status
```

### Ver historial de commits
```bash
git log --oneline
```

### Ver diferencias antes de commit
```bash
git diff
```

### Ver qué archivos están ignorados
```bash
git status --ignored
```

### Deshacer cambios locales (antes de commit)
```bash
git checkout -- nombre_archivo.js
```

### Ver ramas
```bash
git branch
```

### Crear nueva rama
```bash
git checkout -b nombre-de-rama
```

---

## Verificar Configuración Git

```bash
# Ver configuración global
git config --list

# Configurar nombre (si no lo has hecho)
git config --global user.name "Tu Nombre"

# Configurar email
git config --global user.email "tu@email.com"
```

---

## ⚠️ Archivos que NO se subirán (están en .gitignore)

- ❌ `node_modules/`
- ❌ `.env` y `.env.local`
- ❌ `frontend/env.js`
- ❌ `*.db` (base de datos SQLite)
- ❌ Archivos temporales

---

## ✅ Archivos que SÍ se subirán

- ✅ Todo el código fuente (`frontend/`, `api/`)
- ✅ Configuración (`vercel.json`, `package.json`)
- ✅ Documentación (`*.md`)
- ✅ `.gitignore`

---

## 🆘 Errores Comunes

### Error: "fatal: remote origin already exists"

**Solución:**
```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/tienda-mvp.git
```

### Error: "src refspec main does not match any"

**Solución:**
```bash
# Crear primer commit
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Error: Authentication failed

**Solución:**
- Usa token de acceso personal en lugar de password
- Ve a GitHub → Settings → Developer settings → Personal access tokens
- Genera uno nuevo con permisos de `repo`

---

## 🔗 Conectar con Vercel

Después de hacer push a GitHub:

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Selecciona tu repositorio
3. Configura variables de entorno
4. Deploy

**Ver guía completa:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

**¡Listo para tu primer push! 🚀**

```bash
git add .
git commit -m "Initial commit - Sistema Tienda MVP"
git push origin main
```
