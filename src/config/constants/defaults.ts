export const DEFAULTS = {
    NODE_ENV: 'development',
    PORT: 4004,
    REDIS: {
        HOST: 'localhost',
        PORT: 6379,
        URL: 'redis://localhost:6379',
        CACHE_EXPIRY: 3600,
        RETRY_DELAY: 1000
    },
    RETRY_ATTEMPTS: 3,
    PRODUCT_SERVICE_URL: 'http://localhost:4001/products',
};