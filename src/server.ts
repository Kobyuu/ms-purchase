import express from 'express'
import router from './router'
import limiter from './middleware/rateLimiter';

// Instancia de express
const server = express()

// Aplicar ratelimtier a todas las rutas

//Leer datos de formularios
server.use(express.json())

// Configuración de limitador de tasa
server.use(limiter);

// Configuración de rutas
server.use('/api/purchase', router)

export default server