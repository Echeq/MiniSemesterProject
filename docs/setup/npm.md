# npm setup

## Para nuevos desarrolladores (clonando el repo)

```bash
cd frontend
npm install
npm run dev
```

Esto instala todas las dependencias ya declaradas en `package.json` y levanta el servidor de desarrollo en `http://localhost:5173`.

## Comandos disponibles

| Comando | Acción |
|---|---|
| `npm run dev` | Inicia servidor de desarrollo Vite |
| `npm run build` | Typecheck (`tsc -b`) + build producción (`vite build`) |
| `npm run preview` | Previsualiza el build de producción |

## Notas

- Todos los comandos se ejecutan desde `frontend/`. No hay `package.json` en la raíz del proyecto.
- `.env` va en `frontend/` (ver [Supabase setup](supabase.md)).
