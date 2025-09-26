const { Router } = require("express");
const { getRepository } = require("typeorm");
const Medico = require("./entity/Medico");

const router = Router();

router.get("/medico", async (req, res) => {
  const repo = getRepository(Medico);
  const medicos = await repo.find();
  res.json(medicos);
});

router.post("/medico", async (req, res) => {
  const repo = getRepository(Medico);
  const medico = repo.create(req.body);
  await repo.save(medico);
  res.json(medico);
});

router.put("/medico/:id", async (req, res) => {
  const repo = getRepository(Medico);
  const medico = await repo.findOne(req.params.id);
  if (!medico) return res.status(404).json({ message: "No encontrado" });

  repo.merge(medico, req.body);
  await repo.save(medico);
  res.json(medico);
});

router.delete("/medico/:id", async (req, res) => {
  const repo = getRepository(Medico);
  await repo.delete(req.params.id);
  res.status(204).send();
});

module.exports = router;
