import express from 'express'
import colors from 'colors'
import router from './router'
import db from './config/db'

// Instancia de express
const server = express()

// Aplicar ratelimtier a todas las rutas

//Leer datos de formularios
server.use(express.json())

// Configuración de rutas
server.use('/api/purchase', router)

export default server