export const DEFAULTS = {
    NODE_ENV: 'development',
    PORT: 4004,
    REDIS: {
        HOST: 'redis',
        PORT: 6379,
        URL: 'redis://redis:6379',
        CACHE_EXPIRY: 3600,
        RETRY_DELAY: 1000,
        RETRY_MULTIPLIER: 50
    },
    RETRY_ATTEMPTS: 3,
    PRODUCT_SERVICE_URL: 'http://ms-catalog_app:4001/api/product',
    DATABASE: {
        URL: 'postgres://postgres:1234@postgres:5432/ms-purchase',
        POOL: {
            MAX: 5,
            MIN: 1,
            IDLE: 600000,
            ACQUIRE: 30000
        },
        RETRY: {
            MAX_ATTEMPTS: 5,
            DELAY: 5000
        }
    }
};