import { pool } from "./db.js";
import bcrypt from "bcryptjs";
import { signJwt } from "./jwt.js";

export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) return res.status(400).json({ msg: "correo y password requeridos" });

    const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ msg: "Credenciales inválidas" });

    const token = signJwt({ sub: user.id, correo: user.correo });
    res.json({ token, user: { id: user.id, correo: user.correo } });
  } catch (e) {
    res.status(500).json({ msg: "Error server: " + e.message });
  }
};

// (Opcional) registrar usuario de prueba
export const register = async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) return res.status(400).json({ msg: "correo y password requeridos" });
  const hash = bcrypt.hashSync(password, 8);
  await pool.query("INSERT INTO usuarios (correo, password) VALUES (?, ?)", [correo, hash]);
  res.status(201).json({ msg: "registrado" });
};
