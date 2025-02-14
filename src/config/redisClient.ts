import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ENV } from './constants/environment';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, DEFAULTS } from './constants';

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

const redisConfig = parseRedisUrl(ENV.REDIS.URL);

const redisClient = process.env.NODE_ENV === 'test' 
  ? new RedisMock() 
  : new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      retryStrategy: (times) => {
        return Math.min(times * DEFAULTS.REDIS.RETRY_MULTIPLIER, DEFAULTS.REDIS.RETRY_DELAY);
      }
    });

redisClient.on('connect', () => {
  console.log(SUCCESS_MESSAGES.REDIS_CONNECTION);
});

redisClient.on('error', (err) => {
  console.error(ERROR_MESSAGES.REDIS_CONNECTION, err);
});

export default redisClient;