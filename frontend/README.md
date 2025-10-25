# Heladería – Frontend (React + TypeScript + Vite)

Este frontend usa React, Vite y Tailwind. Incluye autenticación basada en cookies httpOnly y refresh automático del access token.

## Configuración rápida

1) Copia el archivo `.env.example` a `.env` y ajusta las variables:

```
VITE_BASE_URL_ENDPOINT=http://localhost:3000/api/v1
VITE_CSRF_ENDPOINT=/auth/csrf
VITE_CSRF_COOKIE_NAME=csrf_token
```

2) Instala dependencias y arranca:

```
npm install
npm run dev
```

Scripts útiles:
- `npm run dev`: desarrollo
- `npm run build`: build de producción (TypeScript + Vite)
- `npm run preview`: previsualización del build
- `npm run lint`: lint del proyecto

## Autenticación (resumen)

- Cliente HTTP: `src/services/Api.ts`.
  - Envía cookies httpOnly (credentials: 'include').
  - No usa Authorization Bearer; el backend lee access_token desde cookie httpOnly.
  - CSRF Double Submit: añade `X-CSRF-Token` (lee de cookie `csrf_token` o del JSON de `GET /api/v1/auth/csrf`).
  - En `401`, hace `POST /api/v1/auth/refresh` con `X-CSRF-Token` y reintenta la petición original.

- Contexto de auth: `src/context/AuthContext.tsx`.
  - Al montar: intenta `getProfile()`; si 401, hace `refreshSession()` y reintenta.
  - `login()`: guarda usuario y navega al dashboard.
  - `logout()`: cierra sesión en servidor y limpia estado local.

- Rutas protegidas: `src/components/ProtectedRoute.tsx`.
  - Redirige a `/login` si no estás autenticado.
  - Guarda `returnUrl` para volver después del login.

## Reportes (calendario + día)

- Vista: `src/components/Empleado/layout/Reportes/index.tsx`.
- Llama al backend sólo por el mes visible (`/reportes/calendario?year=YYYY&month=MM`) y por el día seleccionado (`/reportes/dia?date=YYYY-MM-DD&includeDetalles=true`).
- Exporta el día a PDF/CSV desde el cliente.
- Manejo de fechas seguro: usa `toLocaleDateString('en-CA')` para evitar desfases por zona horaria.

## Estructura de rutas

`src/routes/routes.tsx` define rutas públicas y el dashboard protegido con subrutas para categorías, productos, ventas y reportes.

---

Notas:
- Tailwind se configura en `tailwind.config.js` y estilos base en `src/index.css`.
- Si cambias el nombre de la cookie CSRF en el backend, actualiza `VITE_CSRF_COOKIE_NAME` y el helper `getCSRFTokenFromCookie`.
