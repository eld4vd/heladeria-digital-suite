# Heladeria Digital Suite

Plataforma full stack para la gestión integral de una heladería. Ofrece un catálogo público con carrito anónimo, proceso de checkout simulado y un panel interno para empleados que habilita ventas asistidas, reportes diarios y administración básica del inventario. Incluye autenticación segura con JWT en doble cookie, protección CSRF de doble envío y limitación de peticiones.

## Características principales

- **Catálogo público** con categorías, búsqueda reactiva y carrito persistente por visitante (IDs temporales).
- **Checkout web** con simulación de pagos QR o débito, registro de ventas y generación automática de detalles.
- **Panel interno** (dashboard) para empleados con métricas en tiempo real, registro manual de ventas, editor de detalles y reportes diarios exportables (CSV/PDF).
- **Seguridad reforzada**: JWT en cookies `httpOnly`, refresh transparente, CSRF middleware de doble cookie, Helmet con CSP/HSTS y rate limiting con `@nestjs/throttler`.
- **Arquitectura desacoplada**: backend NestJS (REST + TypeORM/PostgreSQL) y frontend React 19 + Vite + React Query.
- **Infraestructura Docker**: orquestación con `docker-compose.yml` (backend, frontend, PostgreSQL, Nginx) y variantes para producción.

## Estructura del repositorio

```
Heladeria-Simple-Project/
├─ backend/      # API NestJS + TypeORM
│  ├─ src/
│  │  ├─ auth/              # Autenticación JWT doble cookie
│  │  ├─ carrito-items/
│  │  ├─ carritos/
│  │  ├─ categorias/
│  │  ├─ common/            # Middlewares, filtros, utils
│  │  ├─ config/            # Validación de variables de entorno
│  │  ├─ pagos-simulados/
│  │  ├─ productos/
│  │  ├─ reportes/
│  │  ├─ seed/
│  │  └─ ventas/
│  └─ docs/, test/, Dockerfile, etc.
├─ frontend/    # SPA React + Vite
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ hooks/
│  │  ├─ models/
│  │  ├─ pages/
│  │  └─ services/
│  └─ public/, Dockerfile, docs/, etc.
├─ docker-compose.yml
└─ docker-compose.prod.yml
```

## Requisitos previos

- Node.js 20.x (para desarrollo local sin Docker).
- npm 10.x o superior.
- Docker + Docker Compose (opcional pero recomendado para entorno completo).
- PostgreSQL 14+ (si no se usa Docker).

## Puesta en marcha rápida

### Con Docker Compose

```bash
# Crear los archivos .env (ver sección "Variables de entorno")
cp backend/.env backend/.env.local   # ajusta valores reales
cp frontend/.env frontend/.env.local

# Levantar toda la pila
docker compose up --build

# Frontend disponible en http://localhost:5173
# Backend disponible en http://localhost:3000/api
```

### Entorno local (sin Docker)

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env .env.local   # ajusta credenciales locales
   npm run start:dev
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   cp .env .env.local
   npm run dev
   ```

## Variables de entorno destacadas

### Backend (`backend/.env`)

- `PORT`: puerto del API (por defecto `3000`).
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`: conexión PostgreSQL.
- `DB_SYNCHRONIZE`: `true` en desarrollo para sincronizar entidades; `false` en producción (usar migraciones).
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: claves para los tokens.
- `FRONTEND_URL`: origen permitido para CORS/CSRF.
- `COOKIE_SECURE`, `COOKIE_SAMESITE`, `CSRF_ENABLED`: banderas de seguridad.
- `THROTTLE_TTL`, `THROTTLE_LIMIT`: configuración del rate limiter global.
- `SEED_ON_BOOT` + `SEED_*`: habilitan la carga de datos iniciales.

### Frontend (`frontend/.env`)

- `VITE_API_URL`: URL base del backend (por ejemplo `http://localhost:3000/api`).
- `VITE_APP_NAME`: nombre de la aplicación mostrado en la UI.

> Los `.env` de cada paquete ya están listados en sus respectivos `.gitignore`.

## Seguridad y autenticación

- **Doble cookie JWT**: `access_token` (15 minutos) y `refresh_token` (7 días), ambas `httpOnly`.
- **Refresh automático**: el servicio `api.service.ts` reintenta y renueva tokens de forma transparente.
- **CSRF Double Submit Cookie**: middleware compara cabecera `X-CSRF-Token` con cookie `csrf_token` en todas las mutaciones.
- **Helmet**: CSP estricta, HSTS (en producción), desactivación de `x-powered-by`, políticas COEP/CORP.
- **Rate limiting**: guard global (`ThrottlerGuard`) + reglas específicas en login/refresh.

## Flujos clave

1. **Visitante web**
   - Explora categorías/productos (público).
   - Añade items al carrito (se crea `clienteTempId`).
   - En checkout elige QR o débito, se registra la venta, detalles y pago simulado.

2. **Empleado autenticado**
   - Inicia sesión (`/auth/login`) → panel dashboard.
   - Registra ventas manuales desde cajas (con control de stock y totales).
   - Consulta reportes diarios; exporta CSV/PDF.

## Scripts útiles

### Backend
- `npm run start:dev`: modo desarrollo con hot reload.
- `npm run lint`: lint con ESLint.
- `npm run test`: pruebas unitarias.
- `npm run test:e2e`: pruebas e2e con Jest.
- `npm run build`: compila a `dist/`.

### Frontend
- `npm run dev`: Vite en modo desarrollo.
- `npm run build`: build de producción.
- `npm run preview`: vista previa del build.
- `npm run lint`: lint con ESLint y TypeScript.

## Endpoints principales

- `POST /auth/login` – Login con throttling por IP.
- `POST /auth/refresh` – Refresh token (requiere cookie y CSRF token).
- `GET /auth/me` – Perfil del empleado actual.
- `POST /carritos`, `POST /carritos/checkout` – Flujo público del carrito.
- `GET /categorias`, `GET /productos` – Catálogo público.
- `GET /reportes/calendario`, `GET /reportes/dia` – Reportes diarios.
- `POST /ventas` y `PATCH /ventas/:id` – Registro/actualización manual desde el panel.


---

## Guía rápida: crear un empleado con Postman

1. **Preparar el entorno**
    - Define una variable de entorno `baseUrl` con `http://localhost:3000/api` (ajusta el host/puerto si aplica).
    - Asegúrate de que Postman tenga habilitado el manejo de cookies para persistir `csrf_token`, `access_token` y `refresh_token`.

2. **Obtener el token CSRF inicial**
    - Método: `GET {{baseUrl}}/auth/csrf`
    - En la pestaña *Tests* puedes guardar el token automáticamente:
       ```javascript
       const { csrfToken } = pm.response.json();
       pm.environment.set('csrfToken', csrfToken);
       ```
    - Verifica en la pestaña *Cookies* que existe la cookie `csrf_token`; ese valor debe coincidir con el header `X-CSRF-Token` en las peticiones mutadoras.

3. **Iniciar sesión para obtener las cookies JWT**
    - Método: `POST {{baseUrl}}/auth/login`
    - Headers: `Content-Type: application/json` y `X-CSRF-Token: {{csrfToken}}`
    - Body:
       ```json
       {
          "email": "admin@demo.com",
          "password": "admin123"
       }
       ```
    - Test sugerido para refrescar el header con el último token emitido:
       ```javascript
       pm.environment.set('csrfToken', pm.cookies.get('csrf_token'));
       ```
    - La respuesta establece las cookies `access_token`, `refresh_token` y un nuevo `csrf_token` (todas deben aparecer en Postman > Cookies).

4. **Crear el empleado (usuario) deseado**
    - Método: `POST {{baseUrl}}/empleados`
    - Headers: `Content-Type: application/json` y `X-CSRF-Token: {{csrfToken}}`
    - Body de ejemplo:
       ```json
       {
          "nombre": "Nuevo empleado",
          "email": "nuevo@heladeria.com",
          "password": "ClaveSegura123",
          "activo": true
       }
       ```
    - Respuesta esperada: `201 Created` con el JSON del nuevo empleado (el backend nunca devuelve la contraseña en claro).

5. **Verificar la sesión (opcional)**
    - Método: `GET {{baseUrl}}/auth/me`
    - Headers: `X-CSRF-Token: {{csrfToken}}`
    - Debe retornar `200 OK` con los datos del empleado autenticado si las cookies siguen vigentes.

- Si recibes `403 CSRF token inválido`, repite el paso 2 y confirma que el header `X-CSRF-Token` coincida con la cookie `csrf_token` que Postman envía.
- Para limpiar la sesión, ejecuta `POST {{baseUrl}}/auth/logout` usando el mismo header `X-CSRF-Token`.
