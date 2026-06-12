# Supabase setup

## Opción A: Usar el proyecto existente (recomendado)

Si otro miembro del equipo ya creó el proyecto Supabase, pedile las siguientes credenciales desde **Project Settings > API**:

- **Project URL** — `https://xxxxx.supabase.co`
- **anon public key** — Clave pública que empieza con `sb_publishable_...`

Luego creá `frontend/.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_tu_key_aqui
```

## Opción B: Crear un proyecto nuevo

1. Crear cuenta gratis en https://supabase.com
2. Crear un nuevo proyecto (elegí una región cercana)
3. Una vez creado, andá a **Project Settings > API**
4. Copiá **Project URL** y **anon public key**
5. Creá `frontend/.env` como en la Opción A

## Variables de entorno

| Variable | Requerida | Defecto | Descripción |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Sí | — | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sí | — | Anon public key |
| `VITE_API_BASE_URL` | No | `http://localhost:3000/api` | Solo si usás un backend custom |

## Seguridad

La **anon key** es segura para usar en el cliente porque Supabase usa **Row Level Security (RLS)** en las tablas. Si no configurás RLS, las tablas están protegidas por defecto. Consultá con el backend lead (@goanarbolkong) antes de modificar políticas de RLS.

## Backend

El backend es puro Supabase — no hay servidor que correr. Los esquemas de base de datos van en `supabase/` y las Edge Functions en `backend/src/`.
