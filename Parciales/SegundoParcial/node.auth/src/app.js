import "dotenv/config";
import express from "express";
import { login, register } from "./authController.js";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, service: "auth" }));
app.post("/login", login);
app.post("/register", register); 

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Auth on :${PORT}`));
