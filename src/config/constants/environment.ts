import { DEFAULTS } from './defaults';
import { validateEnv } from '../validateEnv';

validateEnv();
// Llama a process.env para obtener las variables de entorno y asignarlas a las constantes
const {
    DATABASE_URL,
    NODE_ENV,
    PORT,
    RETRY_ATTEMPTS,
    REDIS_URL,
    REDIS_HOST,
    REDIS_PORT,
    CACHE_EXPIRY,
    RETRY_DELAY,
    PRODUCT_SERVICE_URL,
    DB_POOL_MAX,
    DB_POOL_MIN,
    DB_POOL_IDLE,
    DB_POOL_ACQUIRE,
    DB_RETRY_ATTEMPTS,
    DB_RETRY_DELAY,
    REDIS_RETRY_MULTIPLIER
} = process.env;
// Exporta las constantes de entorno
export const ENV = {
    NODE_ENV: NODE_ENV || DEFAULTS.NODE_ENV,
    PORT: Number(PORT) || DEFAULTS.PORT,
    RETRY_LIMIT: Number(RETRY_ATTEMPTS) || DEFAULTS.RETRY_ATTEMPTS,
    REDIS: {
        URL: REDIS_URL || DEFAULTS.REDIS.URL,
        HOST: REDIS_HOST || DEFAULTS.REDIS.HOST,
        PORT: Number(REDIS_PORT) || DEFAULTS.REDIS.PORT,
        CACHE_EXPIRY: Number(CACHE_EXPIRY) || DEFAULTS.REDIS.CACHE_EXPIRY,
        RETRY_DELAY: Number(RETRY_DELAY) || DEFAULTS.REDIS.RETRY_DELAY,
        RETRY_MULTIPLIER: Number(REDIS_RETRY_MULTIPLIER) || DEFAULTS.REDIS.RETRY_MULTIPLIER
    },
    DATABASE: {
        URL: DATABASE_URL || DEFAULTS.DATABASE.URL,
        POOL: {
            MAX: Number(DB_POOL_MAX) || DEFAULTS.DATABASE.POOL.MAX,
            MIN: Number(DB_POOL_MIN) || DEFAULTS.DATABASE.POOL.MIN,
            IDLE: Number(DB_POOL_IDLE) || DEFAULTS.DATABASE.POOL.IDLE,
            ACQUIRE: Number(DB_POOL_ACQUIRE) || DEFAULTS.DATABASE.POOL.ACQUIRE
        },
        RETRY: {
            MAX_ATTEMPTS: Number(DB_RETRY_ATTEMPTS) || DEFAULTS.DATABASE.RETRY.MAX_ATTEMPTS,
            DELAY: Number(DB_RETRY_DELAY) || DEFAULTS.DATABASE.RETRY.DELAY
        }
    },
    PRODUCT_SERVICE_URL: PRODUCT_SERVICE_URL || DEFAULTS.PRODUCT_SERVICE_URL
};
