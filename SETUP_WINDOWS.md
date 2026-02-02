# Tienda MVP - Quick Setup

## Setup automático (Windows)

```powershell
# 1. Navegar a backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Crear .env
@"
DB_CLIENT=sqlite3
DB_FILENAME=tienda_mvp.db
JWT_SECRET=mi_secreto_super_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=8h
ALERTA_DIAS_VENCIMIENTO=7
PORT=3001
"@ | Out-File -Encoding UTF8 .env

# 4. Inicializar base de datos
npm run init-db
npm run seed

# 5. Iniciar servidor
npm start
```

## Acceso
- URL: http://localhost:3001
- Usuario: admin@example.com
- Contraseña: adminpass

## Comandos útiles

```bash
npm start              # Iniciar servidor
npm run dev            # Modo desarrollo con nodemon
npm run init-db        # Crear base de datos
npm run seed           # Insertar datos iniciales
npm run reset-db       # Limpiar e inicializar DB
```
