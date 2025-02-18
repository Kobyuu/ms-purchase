export const ERROR_MESSAGES = {
    // Errores de Base de Datos
    DB_CONNECTION: "Error al conectar la base de datos",
    DB_URL_NOT_DEFINED: "DATABASE_URL no está definida en las variables de entorno",
    DB_RECONNECT_ERROR: 'Error al intentar reconectar:',
    DB_CONNECTION_LOST: 'Conexión a la base de datos perdida. Intentando reconectar...',
    DB_RECONNECTED: 'Reconectado a la base de datos con éxito.',
    
    // Errores de Redis/Cache
    REDIS_CONNECTION: "Error al conectar a Redis",
    CACHE_CLEARED: 'Cache cleared for key:',
    REDIS_URL_PARSE: 'Error al analizar la URL de Redis:',

    // Errores de Compras
    GET_PURCHASES_ERROR: 'Error al obtener compras',
    CREATE_ERROR: 'Error al crear la compra',
    PURCHASE_NOT_FOUND: 'Compra no encontrada',
    PURCHASE_CREATION_ERROR: 'Purchase creation error:',
    CREATING_PURCHASE: 'Error creating purchase:',
    CREATE_PURCHASE_ERROR: 'Error in purchase creation:',
    PURCHASE_DELETE_ERROR: 'Error deleting purchase:',
    DELETE_PURCHASE_ERROR: 'Error al eliminar la compra',
    
    // Errores de Productos
    PRODUCT_NOT_FOUND: 'Producto no encontrado',
    PRODUCT_REQUEST: 'Requesting product from:',
    PRODUCT_FETCH_ERROR:'Error fetching product:',
    FETCHING_PRODUCT: 'Error fetching product with ID:',
    
    // Errores de Validación
    INVALID_DATA: 'Datos inválidos',
    INVALID_PRODUCT_ID: 'ID de producto inválido',
    INVALID_PURCHASE_ID: 'ID de compra inválido',
    ENV_VAR_NOT_DEFINED: "Variable de entorno no definida",
    
    // Errores HTTP
    HTTP_REQUEST: 'Error en la solicitud HTTP',
    RATE_LIMIT_EXCEEDED: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde.'
};

export const SUCCESS_MESSAGES = {
    // Conexiones Exitosas
    DB_CONNECTION: "Conexión exitosa a la base de datos",
    REDIS_CONNECTION: "Conexión exitosa a Redis",
    
    // Operaciones de Compras Exitosas
    PURCHASE_CREATED: 'Compra creada',
    GET_PURCHASES: 'Compras obtenidas con éxito',
    PURCHASE_DELETED: 'Purchase deleted successfully'
};

export const DYNAMIC_MESSAGES = {
    // Mensajes del Sistema
    SERVER_START: (port: number) => `REST API en el puerto ${port}`,
    RETRY_ATTEMPT: (retryCount: number) => `Intento de reintento: ${retryCount}`,
    DB_RETRY_ATTEMPT: (current: number, max: number) => 
    `Intento ${current} de ${max}: ${ERROR_MESSAGES.DB_CONNECTION}`,
};

export const LOG_MESSAGES = {
  SERVICE_ERROR: 'Service Error:',
  ROLLBACK_ERROR: 'Rollback error:',
};
