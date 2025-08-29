# Usar una imagen base de Node.js
FROM node:20-alpine
# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app
# Copiar los archivos necesarios al contenedor
COPY package.json .
COPY package-lock.json .
# Instalar las dependencias
RUN npm install
# Copiar el resto de los archivos del proyecto
COPY . .
# Exponer el puerto 80
EXPOSE 8080
# Comando para iniciar el servidor
CMD ["node", "server.js"]