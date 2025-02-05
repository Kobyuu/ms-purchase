# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el package.json y el package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Instala nodemon globalmente
RUN npm install -g nodemon

# Copia el resto de la aplicación
COPY . .

# Copia el archivo .env
COPY .env .env

# Expone el puerto en el que la aplicación correrá
EXPOSE 4001

# Define el comando para correr la aplicación
CMD ["npm","run","dev"]