import 'dotenv/config';
import { ERROR_MESSAGES } from './constants';


export function validateEnv(): void {
    // Definir las variables de entorno requeridas
    const requiredEnvVars = [
        'NODE_ENV',
        'DATABASE_URL',
        'PORT',
        'REDIS_URL',
        'REDIS_HOST',
        'REDIS_PORT',
        'CACHE_EXPIRY',
        'RETRY_ATTEMPTS',
        'RETRY_DELAY',
        'PRODUCT_SERVICE_URL',
        // Configuración de los pools de conexión a la base de datos
        'DB_POOL_MAX',
        'DB_POOL_MIN',
        'DB_POOL_IDLE',
        'DB_POOL_ACQUIRE',
        // Configuración de reintento de conexión a la base de datos
        'DB_RETRY_ATTEMPTS',
        'DB_RETRY_DELAY',
        // Configuración de reintento de conexión a Redis
        'REDIS_RETRY_MULTIPLIER'
    ];

    // Verificar que todas las variables de entorno requeridas estén definidas
    requiredEnvVars.forEach((env) => {
        if (!process.env[env]) {
            throw new Error(`${ERROR_MESSAGES.ENV_VAR_NOT_DEFINED}: ${env}`);
        }
    });
}