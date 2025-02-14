# Purchase Microservice

A microservice for managing product purchases with caching, retry mechanisms, and database transaction support.

## Features

- Purchase management (create, delete, list)
- Product validation through external service
- Redis caching
- PostgreSQL database with connection pooling
- Automatic retry mechanisms for external services
- Environment-based configuration
- Docker containerization

## Tech Stack

- Node.js with TypeScript
- Express.js
- PostgreSQL with Sequelize ORM
- Redis for caching
- Docker & Docker Compose
- Axios with retry mechanism

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15
- Redis 7

## Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development

DATABASE_URL=postgres://postgres:1234@postgres:5432/ms-purchase
PORT=4004
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
CACHE_EXPIRY=3600
RETRY_ATTEMPTS=3
RETRY_DELAY=1000
PRODUCT_SERVICE_URL=http://ms-catalog_app:4001/api/product

# Database Pool Configuration
DB_POOL_MAX=5
DB_POOL_MIN=1
DB_POOL_IDLE=600000
DB_POOL_ACQUIRE=30000

# Database Retry Configuration
DB_RETRY_ATTEMPTS=5
DB_RETRY_DELAY=5000

REDIS_RETRY_MULTIPLIER=50
```

### Installation
Clone the repository
Install dependencies:
```bash
npm install
```

### Running the Application
Using Docker
```bash
docker-compose up -d
```
Local Develpment
```bash
docker-compose up -d
```

### API Endpoints
Purchases
- GET /api/purchase - Get all purchases
- POST /api/purchase - Create a new purchase
- DELETE /api/purchase/:id - Delete a purchase

### Project Structure
```
src/
├── config/             # Configuration files
│   ├── constants/      # Constants and environment variables
│   ├── axiosClient.ts  # Axios configuration with retry
│   ├── db.ts          # Database configuration
│   └── redisClient.ts # Redis configuration
├── controllers/        # Route controllers
├── middleware/        # Express middleware
├── models/           # Sequelize models
├── services/         # Business logic
└── types/           # TypeScript interfaces
```

### Scripts
- npm run dev - Start development server with hot reload
- npm start - Start production server
- npm test - Run tests
- npm run db:migrate - Run database migrations
- npm run db:rollback - Rollback database migrations