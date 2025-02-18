export const CACHE_KEYS = {
    PRODUCT: {
        PREFIX: 'product',
        BY_ID: (id: number) => `product:${id}`
    }
};

export const CACHE_CONFIG = {
    PREFIX: 'cache:',
    CACHEABLE_METHODS: {
      GET: 'get'
    }
  } as const;
  
  export const REDIS_CONFIG = {
    ENVIRONMENTS: {
      TEST: 'test'
    },
    EVENTS: {
      CONNECT: 'connect',
      ERROR: 'error'
    }
  } as const;