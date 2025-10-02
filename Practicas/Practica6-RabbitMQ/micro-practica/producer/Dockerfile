FROM node:20-alpine

WORKDIR /app

# Instala deps primero para aprovechar cache
COPY package*.json ./
RUN npm ci --only=production

# Copia el código
COPY . .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "index.js"]
