# 🍦 Heladeria Digital Suite

Sistema completo de gestión para heladerías con punto de venta web, carrito anónimo, checkout simulado y dashboard administrativo en tiempo real. Arquitectura full-stack moderna con seguridad reforzada y actualización automática de inventario.

## ✨ Características Principales

### 🌐 **Frontend Público**
- **Catálogo interactivo** con categorías, búsqueda reactiva y filtros en tiempo real
- **Carrito anónimo persistente** con localStorage (sin registro de usuario)
- **Checkout simulado** con múltiples métodos de pago (QR, tarjeta, efectivo, transferencia)
- **Actualización automática de stock** cada 30 segundos mediante polling
- **UI/UX moderna** con Tailwind CSS, animaciones suaves y diseño responsive

### 🔐 **Dashboard Administrativo**
- **Panel de control en tiempo real** con métricas actualizadas automáticamente cada 5 segundos
- **Gestión de productos** con actualización automática de stock al realizar ventas
- **Sistema de ventas manuales** para atención en caja física
- **Reportes exportables** (CSV/PDF) con filtros por fecha y método de pago
- **Gestión de empleados** y categorías de productos

### 🛡️ **Seguridad Reforzada**
- **Autenticación JWT** con doble cookie (access + refresh tokens, httpOnly)
- **Protección CSRF** con doble envío de token en cookies y headers
- **Rate limiting** global y específico en endpoints críticos
- **Helmet.js** con CSP, HSTS, y headers de seguridad
- **Actualización automática de inventario** con descuento de stock transaccional

### 🔄 **Actualización en Tiempo Real**
- **Stock sincronizado**: Cada venta descuenta automáticamente del inventario
- **Polling inteligente**: 
  - Frontend público: 30s
  - Dashboard admin: 5s
  - Ventas: 5s
- **Invalidación de queries** en React Query al completar transacciones

## 🏗️ Stack Tecnológico

### Backend
- **NestJS 10** - Framework Node.js progresivo
- **TypeORM** - ORM con soporte para PostgreSQL
- **PostgreSQL 17** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **bcrypt** - Hash de contraseñas (salt 10)
- **Helmet** - Seguridad HTTP

### Frontend
- **React 19** - Biblioteca UI moderna
- **Vite 6** - Build tool ultrarrápido
- **TanStack Query (React Query)** - Gestión de estado servidor
- **Tailwind CSS** - Framework CSS utility-first
- **TypeScript 5** - Tipado estático
- **React Router 7** - Navegación SPA

### Infraestructura
- **Docker + Docker Compose** - Contenerización
- **Nginx** - Servidor web y proxy inverso
- **Multi-stage builds** - Optimización de imágenes Docker

## 📁 Estructura del Proyecto

```
heladeria-digital-suite/
├── backend/                    # API REST con NestJS
│   ├── src/
│   │   ├── auth/              # Sistema de autenticación JWT
│   │   ├── carritos/          # Gestión de carritos anónimos
│   │   ├── carrito-items/     # Items individuales del carrito
│   │   ├── categorias/        # Categorías de productos
│   │   ├── productos/         # CRUD de productos con stock
│   │   ├── ventas/            # Registro y gestión de ventas
│   │   ├── detalles-ventas/   # Detalles de cada venta
│   │   ├── pagos-simulados/   # Simulación de pagos
│   │   ├── empleados/         # Gestión de usuarios admin
│   │   ├── reportes/          # Reportes y estadísticas
│   │   ├── seed/              # Semilla de datos inicial
│   │   ├── common/            # Middlewares, filtros, utils
│   │   └── config/            # Validación de variables de entorno
│   ├── .env.local             # Configuración desarrollo local
│   ├── .env.pruebas           # Configuración Docker local
│   ├── .env.produccion        # Configuración producción
│   ├── Dockerfile             # Build multi-etapa optimizado
│   ├── docker-entrypoint.sh   # Script de inicio automático
│ 
│
├── frontend/                   # SPA React + Vite
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── Cart/          # Sistema de carrito
│   │   │   ├── dashboard/     # Componentes del admin
│   │   │   └── public/        # Componentes públicos
│   │   ├── context/           # Context API (Auth, Cart)
│   │   ├── hooks/             # Custom hooks con React Query
│   │   ├── models/            # Interfaces TypeScript
│   │   ├── pages/             # Páginas principales
│   │   ├── routes/            # Configuración de rutas
│   │   └── services/          # Servicios API
│   ├── Dockerfile             # Build Nginx + React
│   └── nginx.conf             # Configuración Nginx
│
├── docker-compose.yml         # Orquestación desarrollo
├── docker-compose.prod.yml    # Orquestación producción
└── README.md                  # Este archivo
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js 20+** y **npm 10+** (para desarrollo local)
- **Docker** y **Docker Compose** (recomendado)
- **PostgreSQL 17** (si no usas Docker)

### Opción 1: Docker Compose (Recomendado)

```bash
# 1. Clonar el repositorio
git clone <tu-repo>
cd heladeria-digital-suite

# 2. Levantar toda la infraestructura
docker-compose up -d

# 3. El admin se crea automáticamente (seed habilitado en .env.pruebas)
# Acceder a:
# - Frontend: http://localhost
# - Backend: http://localhost:3000/api
# - Login: http://localhost/login
#   Usuario: admin@heladeria.com
#   Password: admin123

# 4. Ver logs
docker-compose logs -f backend

# 5. Detener servicios
docker-compose down
```

### Opción 2: Desarrollo Local (sin Docker)

#### Backend

```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local .env
# Edita .env con tus credenciales de PostgreSQL

# 3. Habilitar seed para crear admin (primera vez)
# En .env, cambia: SEED_ON_BOOT=true

# 4. Iniciar servidor
npm run start:dev

# El backend corre en http://localhost:3000
```

#### Frontend

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
echo "VITE_API_URL=http://localhost:3000/api" > .env.local

# 3. Iniciar servidor de desarrollo
npm run dev

# El frontend corre en http://localhost:5173
```

### 🔑 Crear Usuario Administrador

#### Primera Vez

El sistema incluye un **seed automático** que crea el usuario admin:

1. **Configura el seed** en el archivo `.env` correspondiente:
   ```bash
   SEED_ON_BOOT=true
   SEED_ADMIN_NAME=Administrador
   SEED_ADMIN_EMAIL=admin@heladeria.com
   SEED_ADMIN_PASSWORD=admin123
   ```

2. **Inicia la aplicación**: El admin se crea automáticamente

3. **Inicia sesión** en: `http://localhost/login` o `http://localhost:5173/login`

4. **(Opcional) Desactiva el seed** por seguridad:
   ```bash
   SEED_ON_BOOT=false
   ```

📖 **Para más detalles**: Lee [`backend/SEED_INSTRUCTIONS.md`](backend/SEED_INSTRUCTIONS.md)

> ⚠️ **IMPORTANTE**: En producción, cambia las credenciales antes del deploy y desactiva el seed después del primer inicio.

## ⚙️ Configuración

### Variables de Entorno - Backend

#### Archivos disponibles:
- `.env.local` - Desarrollo local (sin Docker)
- `.env.pruebas` - Docker Compose local
- `.env.produccion` - Deployment en servidor

#### Variables clave:

```bash
# Servidor
PORT=3000
NODE_ENV=development|production
HOST=0.0.0.0

# Base de datos
DB_HOST=localhost              # 'db' en Docker
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=heladeria_db
DB_SYNCHRONIZE=true            # false en producción
DB_LOGGING=true                # false en producción

# CORS
FRONTEND_URL=http://localhost:5173

# JWT (genera secretos seguros en producción)
JWT_ACCESS_SECRET=tu_secret_64_caracteres_minimo
JWT_REFRESH_SECRET=otro_secret_64_caracteres

# Seguridad
COOKIE_SECURE=false            # true en producción (HTTPS)
COOKIE_SAMESITE=lax            # strict en producción
CSRF_ENABLED=true
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# Seed (creación automática de admin)
SEED_ON_BOOT=false             # true para primera vez
SEED_ADMIN_NAME=Administrador
SEED_ADMIN_EMAIL=admin@heladeria.com
SEED_ADMIN_PASSWORD=admin123   # Cambiar en producción
```

### Variables de Entorno - Frontend

```bash
# API Backend
VITE_API_URL=http://localhost:3000/api

# Nombre de la aplicación
VITE_APP_NAME="Heladería Digital"
```

### 🔐 Generar Secretos JWT Seguros

```bash
# Ejecuta en tu terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copia el resultado para JWT_ACCESS_SECRET

node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copia el resultado para JWT_REFRESH_SECRET
```

## 🔒 Seguridad

### Autenticación JWT de Doble Cookie
- **Access Token**: 15 minutos, `httpOnly`, `secure` (en producción)
- **Refresh Token**: 7 días, `httpOnly`, `secure`
- **Renovación automática**: Transparente en el frontend con React Query

### Protección CSRF
- **Doble envío**: Cookie `csrf_token` + Header `X-CSRF-Token`
- **Validación**: Middleware en todas las mutaciones (POST, PUT, DELETE, PATCH)
- **Rotación**: Nuevo token en cada login/refresh

### Seguridad HTTP (Helmet.js)
- **CSP** (Content Security Policy): Políticas estrictas
- **HSTS**: HTTP Strict Transport Security (producción)
- **X-Frame-Options**: Prevención de clickjacking
- **Deshabilitación de X-Powered-By**

### Rate Limiting
- **Global**: 100 peticiones por minuto
- **Login**: 5 intentos por minuto por IP
- **Refresh**: 10 peticiones por minuto por IP

### Hash de Contraseñas
- **bcrypt** con salt factor 10
- **Prevención de rehashing**: Validación en hooks `@BeforeUpdate`
- **No se devuelven passwords** en ningún endpoint

## 🎯 Flujos de Usuario

### 👤 Cliente Web (Público)

1. **Explorar catálogo**: Navega categorías, busca productos, ve detalles
2. **Agregar al carrito**: Sin necesidad de registro (cliente temporal UUID)
3. **Checkout**: Elige método de pago (QR/tarjeta/efectivo/transferencia)
4. **Confirmación**: Se registra la venta y se descuenta el stock automáticamente
5. **Actualización**: El inventario se refleja en tiempo real (30s polling)

### 👨‍💼 Empleado Admin

1. **Login seguro**: Autenticación JWT con cookies httpOnly
2. **Dashboard**: Métricas en tiempo real (actualización cada 5s)
3. **Gestión de productos**: 
   - CRUD completo
   - Control de stock actualizado automáticamente
   - Ver ventas en tiempo real
4. **Ventas manuales**: Registro desde caja física con descuento de stock transaccional
5. **Reportes**: Exportar ventas diarias en CSV/PDF con filtros avanzados
6. **Gestión de empleados**: Crear/editar usuarios del sistema

## 🛠️ Scripts de Desarrollo

### Backend
```bash
npm run start:dev      # Desarrollo con hot-reload
npm run build          # Compilar a dist/
npm run start:prod     # Producción desde dist/
npm run lint           # Lint con ESLint
npm run test           # Tests unitarios con Jest
npm run test:e2e       # Tests end-to-end
```

### Frontend
```bash
npm run dev            # Vite dev server (http://localhost:5173)
npm run build          # Build de producción
npm run preview        # Preview del build
npm run lint           # Lint con ESLint + TypeScript
```

### Docker
```bash
# Desarrollo local
docker-compose up -d                    # Levantar servicios
docker-compose logs -f backend          # Ver logs del backend
docker-compose logs -f frontend         # Ver logs del frontend
docker-compose restart backend          # Reiniciar backend (recargar .env)
docker-compose down                     # Detener servicios
docker-compose down -v                  # Detener y borrar volúmenes (limpia BD)

# Producción
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml down
```

## 📡 API Endpoints Principales

### Autenticación
```
POST   /api/auth/login          # Login con rate limiting
POST   /api/auth/refresh        # Renovar tokens (requiere CSRF)
POST   /api/auth/logout         # Cerrar sesión
GET    /api/auth/me             # Perfil del usuario actual
GET    /api/auth/csrf           # Obtener token CSRF
```

### Catálogo Público
```
GET    /api/categorias          # Listar categorías
GET    /api/productos           # Listar productos con stock
GET    /api/productos/:id       # Detalle de producto
```

### Carrito y Checkout
```
POST   /api/carritos            # Crear carrito anónimo
GET    /api/carritos/:id        # Obtener carrito
POST   /api/carritos/:id/items  # Agregar item
PATCH  /api/carrito-items/:id   # Actualizar cantidad
DELETE /api/carrito-items/:id   # Eliminar item
POST   /api/carritos/:id/checkout # Finalizar compra (descuenta stock)
```

### Dashboard Admin (requiere autenticación)
```
GET    /api/productos           # Gestión de inventario
POST   /api/productos           # Crear producto (requiere CSRF)
PATCH  /api/productos/:id       # Actualizar producto
DELETE /api/productos/:id       # Eliminar producto

GET    /api/ventas              # Listar ventas (actualización cada 5s)
POST   /api/ventas              # Crear venta manual
GET    /api/ventas/:id          # Detalle de venta

GET    /api/reportes/calendario # Calendario de ventas
GET    /api/reportes/dia        # Reporte diario con exportación
```


## 🚢 Deployment en Producción

### Preparación

1. **Edita `backend/.env.produccion`**:
   ```bash
   # Cambiar TODAS estas variables:
   DB_PASSWORD=una_password_muy_segura
   JWT_ACCESS_SECRET=genera_un_secret_aleatorio_64_chars
   JWT_REFRESH_SECRET=genera_otro_secret_aleatorio_64_chars
   FRONTEND_URL=https://tudominio.com
   SEED_ADMIN_EMAIL=admin@tudominio.com
   SEED_ADMIN_PASSWORD=PasswordSegura123!
   
   # Primera vez: true, después: false
   SEED_ON_BOOT=true
   
   # Producción
   NODE_ENV=production
   COOKIE_SECURE=true
   COOKIE_SAMESITE=strict
   DB_SYNCHRONIZE=false
   ```

2. **SSL/TLS**: Configura certificados en `/etc/letsencrypt/` (Let's Encrypt)

### Deploy

```bash
# 1. En el servidor, clona el repositorio
git clone <tu-repo>
cd heladeria-digital-suite

# 2. Edita .env.produccion con tus valores reales

# 3. Levanta con Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# 4. Verifica que el admin se creó
docker-compose -f docker-compose.prod.yml logs backend | grep "ADMIN"

# 5. Accede y cambia la contraseña del admin

# 6. IMPORTANTE: Desactiva el seed
nano backend/.env.produccion
# Cambia: SEED_ON_BOOT=false
docker-compose -f docker-compose.prod.yml restart backend
```

### Mantenimiento

```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Backup de base de datos
docker exec -t postgres pg_dump -U postgres heladeria_db > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20241212.sql | docker exec -i postgres psql -U postgres heladeria_db

# Actualizar código
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🧪 Testing con Postman/API

### Flujo de Autenticación

El sistema usa **cookies httpOnly** y **tokens CSRF**, por lo que es más fácil usar el frontend. Pero si necesitas testear con Postman:

1. **Obtener CSRF Token**:
   ```
   GET http://localhost:3000/api/auth/csrf
   ```
   Guarda el `csrfToken` de la respuesta.

2. **Login**:
   ```
   POST http://localhost:3000/api/auth/login
   Headers: 
     Content-Type: application/json
     X-CSRF-Token: <token-del-paso-1>
   Body:
   {
     "email": "admin@heladeria.com",
     "password": "admin123"
   }
   ```
   Postman guardará las cookies automáticamente.

3. **Endpoints protegidos**:
   Incluye siempre `X-CSRF-Token` en el header para POST/PUT/DELETE/PATCH.

> 💡 **Recomendación**: Usa el frontend para operaciones normales. Postman es útil solo para debugging de la API.

---


## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

Desarrollado por [eld4vd](https://github.com/eld4vd)

---

## 🆘 Soporte y Problemas Comunes

### ❓ "No puedo crear usuarios desde Postman"
**Solución**: Usa el seed para crear el primer admin. El sistema usa cookies httpOnly que Postman no maneja bien.

### ❓ "El admin no se crea con el seed"
**Verifica**:
1. `SEED_ON_BOOT=true` en el `.env` correcto
2. La base de datos está vacía (no hay empleados)
3. Los logs del backend: `docker-compose logs backend`

### ❓ "Error CSRF token inválido"
**Solución**: 
1. Obtén un nuevo token con `GET /api/auth/csrf`
2. Incluye el header `X-CSRF-Token` en todas las mutaciones
3. Asegúrate de que Postman maneje cookies automáticamente

### ❓ "Stock no se actualiza en tiempo real"
**Verifica**:
1. React Query está configurado con `refetchInterval: 5000`
2. El backend descuenta stock en `carritos.service.ts`
3. Las queries se invalidan después del checkout

---
