import axios from 'axios';
import axiosRetry from 'axios-retry';
import { ERROR_MESSAGES, DYNAMIC_MESSAGES, ENV, CACHE_CONFIG, HTTP } from './constants';
import { cacheService } from '../services/redisCacheService';

const axiosClient = axios.create({
  baseURL: ENV.PRODUCT_SERVICE_URL,
  timeout: ENV.REQUEST_TIMEOUT,
});

// Configurar axios-retry
axiosRetry(axiosClient, {
  retries: ENV.RETRY_LIMIT,
  retryDelay: (retryCount) => {
    console.log(DYNAMIC_MESSAGES.RETRY_ATTEMPT(retryCount, ENV.RETRY_LIMIT));
    return retryCount * ENV.REDIS.RETRY_DELAY;
  },
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response?.status ?? 0) >= HTTP.SERVER_ERROR;
  },
});

// Interceptor para cache con Redis
axiosClient.interceptors.request.use(async (config) => {
  const cacheKey = `${CACHE_CONFIG.PREFIX}${config.url}`;
  const cachedData = await cacheService.getFromCache(cacheKey);

  if (cachedData && config.method === CACHE_CONFIG.CACHEABLE_METHODS.GET) {
    config.adapter = async () => {
      return {
        data: cachedData,
        status: HTTP.OK,
        statusText: HTTP.OK_TEXT,
        headers: {},
        config,
        request: {},
      };
    };
  }

  return config;
});

// Interceptor para cache con Redis
axiosClient.interceptors.response.use(async (response) => {
  if (response.config.method === CACHE_CONFIG.CACHEABLE_METHODS.GET) {
    const cacheKey = `${CACHE_CONFIG.PREFIX}${response.config.url}`;
    await cacheService.setToCache(cacheKey, response.data);
  }
  return response;
}, (error) => {
  console.error(ERROR_MESSAGES.HTTP_REQUEST, error);
  return Promise.reject(error);
});

export default axiosClient;