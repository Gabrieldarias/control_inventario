# 🚀 INSTALACIÓN RÁPIDA PARA GITHUB

## Paso 1: Clonar repositorio
```bash
git clone https://github.com/tu-usuario/tienda-mvp.git
cd tienda-mvp
```

## Paso 2: Instalar backend
```bash
cd backend
npm install
```

## Paso 3: Configurar .env
Crear archivo `backend/.env`:
```env
DB_CLIENT=sqlite3
DB_FILENAME=tienda_mvp.db
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=8h
ALERTA_DIAS_VENCIMIENTO=7
PORT=3001
```

## Paso 4: Inicializar base de datos
```bash
npm run init-db
npm run seed
```

## Paso 5: Iniciar servidor
```bash
npm start
```

## Paso 6: Abrir en navegador
```
http://localhost:3001
```

## ✅ Credenciales de prueba
- **Admin**: admin@example.com / adminpass
- **Vendedor**: vendedor@example.com / vendedorpass
- **Gabriel**: gabo@gmail.com / gabo

---

## 📝 Estructura mínima para GitHub

```
backend/
├── src/
│   ├── routes/
│   ├── services/
│   ├── db/
│   │   ├── config.js
│   │   ├── init_db.js
│   │   └── seeds.js
│   └── server.js
├── package.json
├── knexfile.js
└── .env.example

frontend/
├── app.js
├── index.html
└── styles.css

.gitignore
README.md
QUICK_START.md (este archivo)
```

## 🐛 Troubleshooting

**Error: Port 3001 in use**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Error: Database not found**
```bash
npm run reset-db
npm run init-db
```

**Error: CORS issues**
Asegurar que frontend apunta a `http://localhost:3001`

## ✨ Características principales

✅ Autenticación JWT  
✅ Gestión de productos  
✅ Control de inventario  
✅ Registro de ventas  
✅ Seguimiento de stock  
✅ Devoluciones  
✅ Configuración de márgenes  

---

**¿Problemas?** Ver README.md para documentación completa.
