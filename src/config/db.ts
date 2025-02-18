import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import colors from 'colors';
import { 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES, 
  DYNAMIC_MESSAGES,
  ENV, 
  DATABASE_CONFIG 
} from './constants';

dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error(ERROR_MESSAGES.DB_URL_NOT_DEFINED);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: DATABASE_CONFIG.DIALECT,
    models: [__dirname + DATABASE_CONFIG.MODELS_PATH],
    logging: false,
    pool: {
        max: ENV.DATABASE.POOL.MAX,
        min: ENV.DATABASE.POOL.MIN,
        idle: ENV.DATABASE.POOL.IDLE,
        acquire: ENV.DATABASE.POOL.ACQUIRE
    }
});

sequelize.addHook(DATABASE_CONFIG.HOOKS.AFTER_DISCONNECT, async () => {
  console.log(ERROR_MESSAGES.DB_CONNECTION_LOST);
  try {
    await sequelize.authenticate();
    console.log(ERROR_MESSAGES.DB_RECONNECTED);
  } catch (err) {
    console.error(ERROR_MESSAGES.DB_RECONNECT_ERROR, err);
  }
});

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
            console.error(
                colors.bgRed.white(
                    DYNAMIC_MESSAGES.DB_RETRY_ATTEMPT(currentTry, maxRetries)
                ), 
                error
            );
            if (currentTry === maxRetries) throw error;
            await new Promise(resolve => 
                setTimeout(resolve, ENV.DATABASE.RETRY.DELAY)
            );
            currentTry++;
        }
    }
}

export default sequelize;
