# Heladería Sucre · Digital Suite

Una tienda de helados para delivery, acompañada de un panel de administración y una API propia. El proyecto conecta la experiencia del cliente con la gestión del catálogo, el inventario y los pedidos en un monorepo pnpm.

**Prototipo de desarrollo: todos los pagos y reversos son simulados. No se realizan cobros reales ni se solicitan números de tarjeta o CVV.**

## Qué incluye

### Tienda pública

- Inicio visual con identidad rosa y blanca, tipografía expresiva y animaciones vinculadas al scroll.
- Páginas independientes para la heladería, contacto y catálogo.
- Catálogo con búsqueda, categorías, sabores, tamaños, precios y ordenamiento; los filtros se construyen a partir de los productos disponibles.
- Detalle de cada helado con tamaño, cantidad y extras opcionales con recargo.
- Carrito persistente en el navegador y compra directa mediante «Comprar ahora», sin borrar el carrito existente.
- Registro e inicio de sesión obligatorios al continuar al checkout; navegar y elegir productos no requieren una cuenta.
- Checkout con datos de entrega, cálculo de precios en el servidor y pago de demostración aprobado o rechazado.
- Perfil, direcciones guardadas, historial y consulta de pedidos asociados a la cuenta.
- Diseño adaptable a móvil, tablet y escritorio; estados de carga, error y página no encontrada.

### Administración

- Acceso interno separado de la tienda.
- Resumen operativo, catálogo de helados, categorías, sabores y extras.
- Gestión de precios y existencias por tamaño del producto.
- Pedidos con despacho y cancelación directamente desde el listado.
- Inventario con ajustes justificados e historial de movimientos.
- Clientes, intentos de pago, reportes de ventas simuladas y exportación CSV.
- Personal administrativo e información del negocio: contacto, horarios, moneda, cobertura y tarifa de delivery.

## Arquitectura

```text
heladeria-digital-suite/
├── web/                 Tienda pública · Next.js
├── admin/               Panel interno · Next.js
├── api/                 API REST · NestJS + Prisma
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .gitignore
└── README.md
```

Las tres aplicaciones conservan sus propios scripts y configuración. Comparten la instalación de dependencias mediante pnpm, pero la comunicación entre tienda, administración y backend se realiza por **API REST**. Los proyectos Next.js no acceden directamente a PostgreSQL ni importan módulos entre sí.

Cada frontend expone un proxy del mismo origen en `/api/v1/...`, dirigido a NestJS. La API es la única responsable de autenticación, permisos, validación, precios, pagos, pedidos y persistencia.

### Entorno del proyecto

| Tecnología | Versión fijada |
| --- | --- |
| Node.js | 24.21.0 |
| pnpm | 12.9.1 |
| Next.js · App Router | 16.3.8 |
| React | 19.3.0 |
| NestJS | 12.1.2 |
| Prisma, cliente y adaptador PostgreSQL | 7.10.0 |
| TypeScript | 7.0.2 |
| Tailwind CSS | 4.3.3 |

El repositorio incluye un único lockfile. No utiliza Turborepo, Nx ni una carpeta adicional de paquetes compartidos. La API utiliza el adaptador PostgreSQL de Prisma y genera su cliente desde `api/prisma/schema.prisma`.

## Instalación local

Necesitas las versiones de Node.js y pnpm indicadas arriba, además de una instancia de PostgreSQL accesible. Estos pasos preparan una copia nueva; **no cambian la configuración de una instalación local que ya funciona**.

### 1. Clonar e instalar

```bash
git clone https://github.com/eld4vd/heladeria-digital-suite.git
cd heladeria-digital-suite
pnpm install --frozen-lockfile
```

La instalación se realiza una vez desde la raíz. Después puedes trabajar dentro de cada aplicación; no necesitas `pnpm --filter`.

### 2. Configurar las variables de entorno

Los archivos privados de entorno **no están publicados**. En una copia nueva crea los siguientes archivos localmente. Estos ejemplos contienen únicamente valores públicos de desarrollo y marcadores ficticios: reemplaza el usuario, las contraseñas y el correo según tu entorno.

#### `api/.env`

```dotenv
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://TU_USUARIO_POSTGRES:TU_CLAVE_POSTGRES@127.0.0.1:5432/bd_heladeria?schema=public"
FRONTEND_ORIGIN=http://localhost:3000
ADMIN_ORIGIN=http://localhost:3001
SESSION_DAYS=7
SEED_ON_START=true
DEMO_ADMIN_EMAIL=admin@example.invalid
DEMO_ADMIN_PASSWORD=DEFINE_UNA_CLAVE_LOCAL_SEGURA
DEMO_ADMIN_NAME=Administración
```

El usuario de `DATABASE_URL` debe tener permisos para crear y utilizar las tablas de `bd_heladeria`. Ajusta el puerto si PostgreSQL no utiliza `5432`. Si la contraseña contiene caracteres especiales, codifícalos para una URL. La contraseña del administrador inicial debe tener al menos 10 caracteres y como máximo 72 bytes.

#### `web/.env.local`

```dotenv
API_INTERNAL_URL=http://127.0.0.1:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
SEO_INDEXABLE=false
```

`NEXT_PUBLIC_SITE_URL` debe contener sólo el origen de la tienda, sin rutas ni credenciales. `SEO_INDEXABLE=false` mantiene el entorno local fuera de indexación.

#### `admin/.env.local`

```dotenv
API_INTERNAL_URL=http://127.0.0.1:4000
NEXT_PUBLIC_STORE_URL=http://localhost:3000
```

No incluyas secretos en variables con el prefijo `NEXT_PUBLIC_`: Next.js puede incorporarlas al código enviado al navegador.

### 3. Preparar PostgreSQL y aplicar las migraciones

Crea primero una base vacía llamada **`bd_heladeria`** con tu gestor de PostgreSQL. Si trabajas desde una consola SQL con permisos suficientes:

```sql
CREATE DATABASE bd_heladeria;
```

Después, desde la raíz del repositorio:

```bash
cd api
pnpm db:migrate
```

Este comando aplica las migraciones versionadas y crea las tablas, relaciones e índices. No crea la base de datos, no importa ventas anteriores ni carga un catálogo de ejemplo.

Si ya tienes datos, realiza un respaldo y detén la API antes de aplicar migraciones pendientes. No necesitas resetear la base para actualizarla.

### 4. Arrancar las tres aplicaciones

Abre **tres terminales**, cada una inicialmente en la raíz del repositorio.

API:

```bash
cd api
pnpm start:dev
```

Tienda:

```bash
cd web
pnpm dev
```

Administración:

```bash
cd admin
pnpm dev
```

| Aplicación | Dirección |
| --- | --- |
| Tienda | http://localhost:3000 |
| Login administrativo | http://localhost:3001/login |
| Dashboard | http://localhost:3001 |
| API REST | http://localhost:4000/api/v1 |

`pnpm start:dev` ya ejecuta `prisma generate` antes de iniciar NestJS. No necesitas añadir `pnpm db:generate` al arranque habitual. En PowerShell con restricciones de ejecución de scripts puedes utilizar `pnpm.cmd`.

### 5. Administrador inicial y primeros productos

Con `SEED_ON_START=true`, el primer arranque sobre una base ya migrada crea **únicamente el administrador inicial**, usando `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD` y `DEMO_ADMIN_NAME`. Si ya existe un administrador, el arranque no modifica su cuenta ni su contraseña.

No se precargan helados, extras, existencias, pedidos ni configuración del negocio. Inicia sesión en el panel, completa la configuración del local y del delivery y carga tu propio catálogo. El delivery comienza deshabilitado mientras no se configure y habilite desde administración. Puedes desactivar la inicialización automática con `SEED_ON_START=false` después de crear la cuenta.

Las imágenes de productos y extras se guardan como URLs HTTPS. Puedes subirlas manualmente a Cloudinary y pegar su URL en los formularios, que muestran una vista previa. No hay subida automática a Cloudinary ni se necesitan sus credenciales para arrancar. Las imágenes estáticas utilizadas por las interfaces sí forman parte de cada aplicación.

## Modelo del catálogo

| Elemento | Función |
| --- | --- |
| Categoría | Agrupa productos: conos, copas, paletas, vasos u otros grupos definidos por el negocio. |
| Helado | Tiene nombre, descripción, categoría, imagen y un sabor de receta opcional. |
| Sabor | Registro reutilizable, relacionado con los helados y utilizado para filtrar el catálogo. Se puede crear desde el formulario del producto. No es una variante que el cliente deba escoger nuevamente. |
| Tamaño o presentación | Define el precio base y el stock del helado. Se gestiona dentro del producto. |
| Extra | Complemento independiente con precio e imagen opcional. El cliente lo añade durante la compra; su recargo se aplica por unidad de helado. |

Los nombres de sabores se normalizan para evitar duplicados por mayúsculas o espacios; no se corrigen erratas automáticamente. Las tablas, campos y enumeraciones de negocio tienen nombres en español en PostgreSQL. Los contratos REST conservan su nomenclatura propia.

Los precios se almacenan en unidades monetarias menores mediante enteros. NestJS recalcula tamaños, extras, cantidades y delivery: no confía en el total enviado por el navegador. Cada pedido conserva copias de los productos, opciones, precios y dirección para mantener su historial aunque después cambie el catálogo.

## Pedidos, pagos e inventario

El flujo habitual es **Pendiente de pago → Confirmado → Despachado**. Un pedido también puede cancelarse antes del despacho.

| Acción | Resultado |
| --- | --- |
| Crear pedido | Registra la compra pendiente, sin descontar existencias. |
| Rechazar un pago simulado | Permite reintentar sobre el mismo pedido, sin consumir stock. |
| Aprobar un pago simulado | Confirma el pedido y reserva sus unidades mediante un descuento transaccional de stock. |
| Despachar | Registra la venta simulada en los reportes, sin descontar unidades otra vez. |
| Cancelar antes del despacho | Devuelve las unidades reservadas y registra el reverso del pago aprobado una sola vez. |

Las claves de idempotencia y las transacciones protegen frente a dobles envíos y confirmaciones concurrentes. El stock se agrupa por presentación y no se permiten descuentos parciales cuando faltan unidades.

**Despachado significa que el pedido salió con el delivery, no que el cliente ya lo recibió.** La coordinación posterior con el repartidor queda fuera del sistema; no hay llamadas, WhatsApp ni notificaciones externas automáticas. El cliente puede cerrar el navegador y recuperar sus pedidos iniciando sesión en su cuenta.

Los reportes contabilizan pedidos despachados con pago aprobado según la fecha de despacho. La migración incluida adapta los estados antiguos sin borrar pedidos ni reconstruir existencias. Si un pedido histórico carece de una fecha de salida o entrega registrada, su fecha de despacho permanece vacía: aparece en el total general, pero no en series diarias ni períodos filtrados.

## Autenticación y seguridad

- NestJS administra sesiones opacas revocables mediante cookies `httpOnly`, con expiración configurable y protección CSRF.
- Las contraseñas se guardan con hash bcrypt; los endpoints validan los datos y comprueban permisos en la API.
- La tienda exige una cuenta de cliente para crear pedidos y simular pagos. El panel requiere una cuenta administradora; el rol operador histórico no habilita acceso en esta versión.
- Los clientes sólo acceden a sus datos y pedidos. Conocer un código o un correo no otorga acceso a compras ajenas.
- El carrito utiliza `localStorage` y la compra directa utiliza `sessionStorage`; no guardan los datos personales de entrega. Pedidos y pagos permanecen en PostgreSQL.
- Los orígenes permitidos son explícitos. Las páginas privadas y la administración no se indexan ni utilizan caché compartida.

La tienda incluye metadatos, URLs canónicas, sitemap, robots y vistas previas sociales. La indexación sólo se habilita si se configura expresamente para un dominio HTTPS público en producción.

## Comandos útiles

| Carpeta | Comando | Uso |
| --- | --- | --- |
| Raíz | `pnpm install --frozen-lockfile` | Instalar las dependencias respetando el lockfile. |
| `web` o `admin` | `pnpm dev` | Iniciar Next.js en desarrollo. |
| `api` | `pnpm start:dev` | Generar el cliente Prisma, compilar y arrancar la API con recarga. |
| `api` | `pnpm db:migrate` | Aplicar las migraciones existentes. |
| `api` | `pnpm db:status` | Consultar el estado de las migraciones. |
| `api` | `pnpm db:generate` | Regenerar únicamente el cliente Prisma; no cambia tablas. |
| `api` | `pnpm db:seed` | Crear manualmente el administrador inicial de forma idempotente. |
| `api` | `pnpm db:studio` | Abrir Prisma Studio para consultar o editar datos. |
| Cada aplicación | `pnpm lint` / `pnpm typecheck` | Revisar el código y los tipos. |
| Cada aplicación | `pnpm build` y luego `pnpm start` | Generar y ejecutar su compilación. |

Los atajos de la raíz `dev:web`, `dev:admin`, `dev:api`, `build`, `lint` y `typecheck` son opcionales. No sustituyen el trabajo dentro de cada carpeta.

## Alcance de esta publicación

Este repositorio publica el código de las dos aplicaciones Next.js, la API NestJS, el esquema y las migraciones Prisma, la configuración pnpm y los recursos estáticos utilizados. El README es la guía pública central.

Quedan fuera de Git los archivos `.env`, credenciales, dependencias instaladas, compilaciones, cachés, respaldos, colecciones de imágenes para carga manual, snapshots de la base de datos, agentes, skills y documentación interna. Estos archivos pueden conservarse localmente sin publicarse. La base de datos y sus registros **no se incluyen** en el repositorio.

Los archivos de Docker y despliegue VPS no forman parte de esta publicación; el arranque descrito aquí es local con pnpm y PostgreSQL. No se incluyen pasarela de pago real, facturación fiscal, caja presencial, mesas, inventario por recetas, GPS ni aplicación de repartidores. La recuperación de contraseñas por correo tampoco está implementada.
