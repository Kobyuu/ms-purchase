import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ENV } from './constants/environment';
import { 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES, 
  REDIS_CONFIG 
} from './constants';

// Parsea la URL de Redis y extrae host y puerto
const parseRedisUrl = (url: string) => {
  try {
    const redisUrl = new URL(url);
    return {
      host: redisUrl.hostname || ENV.REDIS.HOST,
      port: parseInt(redisUrl.port || ENV.REDIS.PORT.toString(), 10)
    };
  } catch (error) {
    console.error(ERROR_MESSAGES.REDIS_URL_PARSE, error);
    // Valores por defecto si hay error en el parsing
    return {
      host: ENV.REDIS.HOST,
      port: ENV.REDIS.PORT
    };
  }
};

// Obtiene la configuración de Redis
const redisConfig = parseRedisUrl(ENV.REDIS.URL);

// Crea cliente Redis o Mock según el entorno
const redisClient = process.env.NODE_ENV === REDIS_CONFIG.ENVIRONMENTS.TEST
  ? new RedisMock() 
  : new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      retryStrategy: (times) => {
        return Math.min(times * ENV.REDIS.RETRY_MULTIPLIER, ENV.REDIS.RETRY_DELAY);
      }
    });

// Manejo de eventos de conexión
redisClient.on(REDIS_CONFIG.EVENTS.CONNECT, () => {
  console.log(SUCCESS_MESSAGES.REDIS_CONNECTION);
});

// Manejo de errores de conexión
redisClient.on(REDIS_CONFIG.EVENTS.ERROR, (err) => {
  console.error(ERROR_MESSAGES.REDIS_CONNECTION, err);
});

export default redisClient;