FROM node:20-alpine

WORKDIR /app

# Instalar dependencias a partir de los manifests
COPY package*.json ./
RUN npm ci --omit=dev || npm install --only=production

# Copiar el resto del código
COPY . .

# Crear directorios de runtime y asignar al usuario 'node'
RUN mkdir -p /app/uploads /app/logs && chown -R node:node /app

# Exponer puerto de la app
EXPOSE 3000

# Ejecutar como usuario no root
USER node

# Arranque
CMD ["npm", "start"]
