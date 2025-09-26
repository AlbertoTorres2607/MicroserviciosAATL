# Usar la imagen oficial de Node.js como base
FROM node:18-alpine

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos de configuración de Node (package.json y package-lock.json)
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar todo el código fuente al contenedor
COPY . .

# Exponer el puerto en el que se ejecutará la app
EXPOSE 3000

# Ejecutar el archivo index.js cuando se inicie el contenedor
CMD ["npm", "run", "dev"]
