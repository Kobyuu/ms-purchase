import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import colors from 'colors';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ENV } from './constants';

dotenv.config();

// Verificar que la variable de entorno DATABASE_URL esté definida
if (!process.env.DATABASE_URL) {
    throw new Error(ERROR_MESSAGES.DB_URL_NOT_DEFINED);
}

// Crear una instancia de Sequelize con la URL de la base de datos
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    models: [__dirname + '/../models/**/*.ts'],
    logging: false,
    pool: {
        max: ENV.DATABASE.POOL.MAX,
        min: ENV.DATABASE.POOL.MIN,
        idle: ENV.DATABASE.POOL.IDLE,
        acquire: ENV.DATABASE.POOL.ACQUIRE
    }
});

// Hook para intentar reconectar automáticamente si la conexión se pierde
sequelize.addHook('afterDisconnect', async () => {
  console.log(ERROR_MESSAGES.DB_CONNECTION_LOST);
  try {
    await sequelize.authenticate();
    console.log(ERROR_MESSAGES.DB_RECONNECTED);
  } catch (err) {
    console.error(ERROR_MESSAGES.DB_RECONNECT_ERROR, err);
  }
});

// Conectar a la base de datos
export async function connectDb(): Promise<void> {
    const maxRetries = ENV.DATABASE.RETRY.MAX_ATTEMPTS;
    let currentTry = 1;

    while (currentTry <= maxRetries) {
        try {
            await sequelize.authenticate();
            await sequelize.sync();
            console.log(colors.bgGreen.white(SUCCESS_MESSAGES.DB_CONNECTION));
            return;
        } catch (error) {
            console.error(colors.bgRed.white(`Intento ${currentTry} de ${maxRetries}: ${ERROR_MESSAGES.DB_CONNECTION}`), error);
            if (currentTry === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, ENV.DATABASE.RETRY.DELAY));
            currentTry++;
        }
    }
}

export default sequelize;
