export const ERROR_MESSAGES = {
    GET_PURCHASES_ERROR: 'Error al obtener compras',
    CREATE_ERROR: 'Error al crear la compra',
    PRODUCT_NOT_FOUND: 'Producto no encontrado',
    ENV_VAR_NOT_DEFINED: "Variable de entorno no definida",
    DB_URL_NOT_DEFINED: "DATABASE_URL no está definida en las variables de entorno",
    DB_CONNECTION: "Error al conectar la base de datos",
    REDIS_CONNECTION: "Error al conectar a Redis",
    PURCHASE_NOT_FOUND: 'Compra no encontrada',
    HTTP_REQUEST: 'Error en la solicitud HTTP',
    DB_RECONNECT_ERROR: 'Error al intentar reconectar:',
    DB_CONNECTION_LOST: 'Conexión a la base de datos perdida. Intentando reconectar...',
    PURCHASE_CREATION_ERROR: 'Purchase creation error:',
    DB_RECONNECTED: 'Reconectado a la base de datos con éxito.',
    PRODUCT_REQUEST: 'Requesting product from:',
    PRODUCT_FETCH_ERROR:'Error fetching product:',
    FETCHING_PRODUCT: 'Error fetching product with ID:',
    CREATING_PURCHASE: 'Error creating purchase:',
    CREATE_PURCHASE_ERROR: 'Error in purchase creation:',
    PURCHASE_DELETE_ERROR: 'Error deleting purchase:',
    INVALID_DATA: 'Datos inválidos',
    INVALID_PRODUCT_ID: 'ID de producto inválido',
    CACHE_CLEARED: 'Cache cleared for key:',
    INVALID_PURCHASE_ID: 'ID de compra inválido',
    DELETE_PURCHASE_ERROR: 'Error al eliminar la compra'
};

export const SUCCESS_MESSAGES = {
    PURCHASE_CREATED: 'Compra creada',
    DB_CONNECTION: "Conexión exitosa a la base de datos",
    REDIS_CONNECTION: "Conexión exitosa a Redis",
    GET_PURCHASES: 'Compras obtenidas con éxito',
    PURCHASE_DELETED: 'Purchase deleted successfully'
};

export const DYNAMIC_MESSAGES = {
    SERVER_START: (port: number) => `REST API en el puerto ${port}`,
    RETRY_ATTEMPT: (retryCount: number) => `Intento de reintento: ${retryCount}` 
};
