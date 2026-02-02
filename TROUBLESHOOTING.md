# 🚀 GUÍA POST-GITHUB - Solución de errores comunes

## ⚠️ Error: "Network Error" o "ERR_CONNECTION_REFUSED"

Este error aparece cuando **el servidor backend no está corriendo**.

### Solución rápida:

```powershell
cd backend
npm start
```

Luego abre en navegador: `http://localhost:3001`

---

## 📋 Checklist de instalación desde GitHub

### 1️⃣ Clonar repositorio
```bash
git clone https://github.com/tu-usuario/tienda-mvp.git
cd tienda-mvp
```

### 2️⃣ Instalar dependencias
```bash
cd backend
npm install
```

### 3️⃣ Crear archivo .env
Copiar contenido de `.env.example` a `.env`:
```bash
cp .env.example .env
```

O crear manualmente `backend/.env`:
```env
DB_CLIENT=sqlite3
DB_FILENAME=tienda_mvp.db
JWT_SECRET=mi_secreto_super_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=8h
ALERTA_DIAS_VENCIMIENTO=7
PORT=3001
```

### 4️⃣ Inicializar base de datos
```bash
npm run init-db
npm run seed
```

### 5️⃣ Iniciar servidor
```bash
npm start
```

✅ Deberías ver: `Tienda backend escuchando en puerto 3001`

### 6️⃣ Abrir navegador
```
http://localhost:3001
```

---

## 🔑 Credenciales de prueba

| Usuario | Email | Contraseña |
|---------|-------|-----------|
| Admin | admin@example.com | adminpass |
| Vendedor | vendedor@example.com | vendedorpass |
| Gabriel | gabo@gmail.com | gabo |

---

## 🐛 Errores y soluciones

### ❌ "Port 3001 already in use"
```powershell
# Encontrar el proceso
netstat -ano | findstr :3001

# Eliminar el proceso (reemplazar <PID>)
taskkill /PID <PID> /F
```

### ❌ "Database not found"
```bash
npm run init-db
npm run reset-db
```

### ❌ "ENOENT: no such file or directory"
Asegurate de que existe la carpeta `backend/`. Si no, ejecutar desde la raíz del proyecto.

### ❌ "Cannot find module 'express'"
```bash
cd backend
npm install
```

### ❌ "ERR_CONNECTION_REFUSED"
✅ **El servidor NO está corriendo** → Ejecutar `npm start`

---

## 📝 Estructura esperada

```
tienda-mvp/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   └── db/
│   ├── package.json
│   ├── .env
│   └── .env.example
├── frontend/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── .gitignore
└── README.md
```

---

## 🆘 Si nada funciona

1. **Verificar que Node.js está instalado:**
   ```bash
   node --version
   npm --version
   ```

2. **Eliminar node_modules y reinstalar:**
   ```bash
   rm -r backend/node_modules
   cd backend
   npm install
   ```

3. **Limpiar y reiniciar base de datos:**
   ```bash
   npm run reset-db
   npm run init-db
   npm run seed
   ```

4. **Iniciar servidor con debug:**
   ```bash
   node src/server.js
   ```

---

## ✨ Desarrollo

Para desarrollo con hot-reload (requiere nodemon):
```bash
npm run dev
```

Para producción:
```bash
npm start
```

---

**¿Aún tienes problemas?** Revisa la consola del servidor para mensajes de error específicos.
