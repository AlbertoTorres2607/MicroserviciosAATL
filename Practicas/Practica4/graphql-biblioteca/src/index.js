// src/index.js
require("reflect-metadata");
const { DataSource } = require("typeorm");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");
const Libro = require("./entity/Libro");
const Prestamo = require("./entity/Prestamo");

const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "", // Cambia por tu password si tienes
  database: "biblioteca_practica",
  synchronize: true,
  logging: false,
  entities: [Libro, Prestamo]
});

async function startServer() {
  const app = express();
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Agregamos el contexto para pasar AppDataSource a los resolvers
    context: () => ({
      dataSources: {
        AppDataSource
      }
    })
  });
  
  await server.start();
  server.applyMiddleware({ app });
  
  await AppDataSource.initialize();
  console.log("✅ Conectado a la base de datos");
  
  app.listen(4000, () => {
    console.log(`🚀 Servidor listo en http://localhost:4000${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error("Error starting server:", error);
});