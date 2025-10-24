const express = require("express");
const app = express();
const PORT = 4000;

let personas = [
  { id: 1, nombre: "Carlos", edad: 30 },
  { id: 2, nombre: "Ana", edad: 25 }
];

let metrics = {
  totalRequests: 0,
  successCount: 0,
  errorCount: 0,
  avgResponseTime: 0
};

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    metrics.totalRequests++;
    metrics.avgResponseTime = (metrics.avgResponseTime + duration) / 2;
    if (res.statusCode >= 400) metrics.errorCount++;
    else metrics.successCount++;
  });
  next();
});

app.get("/personas", (req, res) => res.json(personas));

app.get("/personas/:id", (req, res) => {
  const persona = personas.find(p => p.id == req.params.id);
  if (!persona)
    return res.status(404).json({ error: "No encontrada" });
  res.json(persona);
});

app.get("/metrics", (req, res) => res.json(metrics));

app.listen(PORT, () => {
  console.log(`Microservicio corriendo en puerto ${PORT}`);
});
