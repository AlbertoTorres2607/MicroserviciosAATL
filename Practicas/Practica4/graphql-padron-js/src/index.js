require("reflect-metadata");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { initDB, AppDataSource } = require("./db");
const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");

async function start() {
  await initDB(); // <--- IMPORTANTE

  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ dataSource: AppDataSource }), // <--- pasa el DS
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  const PORT = 4000;
  app.listen(PORT, () =>
    console.log(`🚀 GraphQL en http://localhost:${PORT}/graphql`)
  );
}
start();
