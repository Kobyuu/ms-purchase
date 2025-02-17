# Microservicio de Compras

Microservicio para gestionar compras de productos con caché, mecanismos de reintento y soporte para transacciones en base de datos.

## Características

- Gestión de compras (crear, eliminar, listar)
- Validación de productos mediante servicio externo
- Caché con Redis y TTL
- Base de datos PostgreSQL con pool de conexiones y reintentos
- Limitación de tasa para endpoints de API
- Mecanismos de reintento automático para servicios externos
- Configuración basada en entorno
- Containerización con Docker
- Pruebas de carga con k6

## Stack Tecnológico

- Node.js 18 con TypeScript
- Express.js con express-validator
- PostgreSQL 15 con Sequelize ORM
- Redis 7 para caché
- Docker y Docker Compose
- Axios con axios-retry
- Jest y Supertest para pruebas
- K6 para pruebas de carga

## Prerrequisitos

- Node.js 18+
- Docker y Docker Compose
- PostgreSQL 15
- Redis 7

## Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
NODE_ENV=development
PORT=4004

# Configuración Base de Datos
DATABASE_URL=postgres://postgres:1234@postgres:5432/ms-purchase
DB_POOL_MAX=5
DB_POOL_MIN=1
DB_POOL_IDLE=600000
DB_POOL_ACQUIRE=30000
DB_RETRY_ATTEMPTS=5
DB_RETRY_DELAY=5000

# Configuración Redis
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
CACHE_EXPIRY=3600
REDIS_RETRY_MULTIPLIER=50

# Servicios Externos
PRODUCT_SERVICE_URL=http://ms-catalog_app:4001/api/product
RETRY_ATTEMPTS=3
RETRY_DELAY=1000
```

## Instalación

1. Clona el repositorio
2. Instala dependencias:
```bash
npm install
```

## Ejecutar la Aplicación

Con Docker:
```bash
docker-compose up -d
```

Para desarrollo local:
```bash
npm run dev
```

## Pruebas

Ejecutar pruebas unitarias:
```bash
npm test
```

Ejecutar pruebas de carga con k6:
```bash
docker-compose --profile k6 up k6
```

## Endpoints de API

### Compras
- GET /api/purchase - Obtener todas las compras
- POST /api/purchase - Crear una nueva compra
- DELETE /api/purchase/:id - Eliminar una compra

## Scripts

- `npm run dev` - Iniciar servidor de desarrollo con recarga en caliente
- `npm start` - Iniciar servidor de producción
- `npm test` - Ejecutar pruebas
- `npm run db:migrate` - Ejecutar migraciones de base de datos
- `npm run db:rollback` - Revertir migraciones de base de datos