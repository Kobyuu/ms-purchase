import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ENV } from './constants/environment';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, DEFAULTS } from './constants';

// Parsea la URL de Redis y extrae host y puerto
const parseRedisUrl = (url: string) => {
  try {
    const redisUrl = new URL(url);
    return {
      host: redisUrl.hostname || DEFAULTS.REDIS.HOST,
      port: parseInt(redisUrl.port || DEFAULTS.REDIS.PORT.toString(), 10)
    };
  } catch (error) {
    console.error('Error parsing Redis URL:', error);
    // Valores por defecto si hay error en el parsing
    return {
      host: DEFAULTS.REDIS.HOST,
      port: DEFAULTS.REDIS.PORT
    };
  }
};

// Obtiene la configuración de Redis
const redisConfig = parseRedisUrl(ENV.REDIS.URL);

// Crea cliente Redis o Mock según el entorno
const redisClient = process.env.NODE_ENV === 'test' 
  ? new RedisMock() 
  : new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      retryStrategy: (times) => {
        return Math.min(times * DEFAULTS.REDIS.RETRY_MULTIPLIER, DEFAULTS.REDIS.RETRY_DELAY);
      }
    });

// Manejo de eventos de conexión
redisClient.on('connect', () => {
  console.log(SUCCESS_MESSAGES.REDIS_CONNECTION);
});

// Manejo de errores de conexión
redisClient.on('error', (err) => {
  console.error(ERROR_MESSAGES.REDIS_CONNECTION, err);
});

export default redisClient;