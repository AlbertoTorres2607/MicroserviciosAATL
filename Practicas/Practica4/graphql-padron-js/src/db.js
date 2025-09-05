require("reflect-metadata");
const { DataSource } = require("typeorm");
const Padron = require("./entity/Padron");
const Mesa = require("./entity/Mesa");

const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "graphql_practica", // o el nombre que estés usando
  synchronize: true,
  logging: false,
  entities: [Padron, Mesa],
});

async function initDB() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log("✅ Conectado a MySQL");
  }
  return AppDataSource;
}

module.exports = { AppDataSource, initDB };
