# Gestion Comercial

Aplicacion web para gestion comercial con autenticacion y roles. Construida con Next.js y Supabase para habilitar un panel administrativo y flujos separados para administradores y vendedores.

## Caracteristicas

- Autenticacion con Supabase Auth.
- Redireccion por rol (admin y vendedor) desde el inicio de la aplicacion.
- App Router de Next.js con componentes en cliente y servidor.
- Integracion con Supabase SSR para sesiones via cookies.

## Stack tecnologico

- Next.js 16
- React 19
- Supabase (Auth y Postgres)
- Tailwind CSS 4

## Requisitos

- Node.js 20+ (LTS) y npm
- Credenciales de un proyecto Supabase

## Configuracion

Crea un archivo `.env.local` en la raiz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_PROJECT_ID=...
```

> La clave `SUPABASE_SERVICE_ROLE_KEY` se usa solo en el servidor. No la expongas en el cliente.

## Configuracion de Supabase

Ejecuta este SQL en tu proyecto de Supabase para crear el perfil del usuario al registrarse:

```sql
create type public.user_role as enum ('admin', 'vendedor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'vendedor',
  created_at timestamp with time zone default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'vendedor');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
```

## Seguridad y middleware

El middleware de Next.js crea un cliente de Supabase SSR que lee y escribe cookies de sesion en cada request. Esto permite mantener la sesion sincronizada y disponible en el servidor. La aplicacion aplica la proteccion de rutas desde la UI, redirigiendo segun el rol del usuario.

## Instalacion y desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicacion.

## Scripts utiles

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run types:supabase
```

## Estructura del proyecto

- `app/`
  - `(auth)/` rutas publicas de autenticacion
  - `admin/` rutas protegidas para administradores
  - `dashboard/` rutas protegidas para vendedores
  - `api/` route handlers
  - `page.js` entrada y redireccion inicial
- `components/` componentes reutilizables
- `lib/` clientes de Supabase y utilidades
- `public/` recursos estaticos
- `styles/` estilos globales
- `middleware.js` gestion de sesiones SSR

## Despliegue

La forma recomendada es Vercel. Configura las mismas variables de entorno usadas en `.env.local` desde el panel de Vercel.

## Notas

- La pagina principal redirige segun el rol del usuario (admin o vendedor).
- La tabla `profiles` se usa para obtener el rol del usuario.
