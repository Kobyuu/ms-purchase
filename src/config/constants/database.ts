//Constantes 
export const DATABASE = {
    EXCLUDED_ATTRIBUTES: ["createdAt", "updatedAt"],
    SORT_CONFIG: {
      FIELD: "id",
      ORDER: "DESC"
    }
  };
  export const DATABASE_CONFIG = {
    DIALECT: 'postgres',
    MODELS_PATH: '/../models/**/*.ts',
    HOOKS: {
      AFTER_DISCONNECT: 'afterDisconnect'
    }
  } as const;