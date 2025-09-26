require("reflect-metadata");  // Necesario para que TypeORM funcione con JavaScript

const express = require("express");
const { createConnection } = require("typeorm");
const Medico = require("./entity/Medico");

const app = express();
app.use(express.json());

createConnection({
  type: "mysql",
  host: "mysql", 
  port: 3306,
  username: "root",
  password: "",  // La contraseña que configuraste en Docker
  database: "bd_medicos",
  synchronize: true,
  logging: false,
  entities: [Medico]
})
  .then(() => {
    console.log("Conectado a MySQL");

    // Rutas
    app.get("/medico", async (req, res) => {
      const repo = await app.getRepository(Medico);
      const medicos = await repo.find();
      res.json(medicos);
    });

    app.post("/medico", async (req, res) => {
      const repo = await app.getRepository(Medico);
      const medico = repo.create(req.body);
      await repo.save(medico);
      res.json(medico);
    });

    app.put("/medico/:id", async (req, res) => {
      const repo = await app.getRepository(Medico);
      const medico = await repo.findOneBy({ id: req.params.id });
      if (!medico) return res.status(404).json({ message: "No encontrado" });

      repo.merge(medico, req.body);
      await repo.save(medico);
      res.json(medico);
    });

    app.delete("/medico/:id", async (req, res) => {
      const repo = await app.getRepository(Medico);
      await repo.delete(req.params.id);
      res.status(204).send();
    });

    // Iniciar el servidor
    app.listen(3000, () => {
      console.log("Servidor corriendo en http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });
