import jwt from "jsonwebtoken";
export const signJwt = (payload) =>
  jwt.sign(payload, process.env.JWT_KEY || "supersecreto", { expiresIn: "1h" });
