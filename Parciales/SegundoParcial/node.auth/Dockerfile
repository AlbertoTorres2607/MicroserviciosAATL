FROM node:20-alpine
WORKDIR /app

# copio manifest + lock y la carpeta ya instalada en tu host
COPY package.json package-lock.json ./
COPY node_modules ./node_modules
COPY src ./src

ENV PORT=8081
EXPOSE 8081
CMD ["node","src/app.js"]
