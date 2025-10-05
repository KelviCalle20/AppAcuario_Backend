import express from "express";
import  pool  from "../config/db";
import bcrypt from "bcrypt";

const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (nombre, email, password) VALUES ($1, $2, $3)",
      [nombre, email, hashedPassword]
    );
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (err: unknown) {
    console.error("❌ Error en registro:", err);

    if (err instanceof Error) {
      // Casteo a cualquier objeto para acceder a code (Postgres)
      const pgError = err as any; 
      if (pgError.code === "23505") {
        res.status(400).json({ error: "El usuario ya existe" });
      } else {
        res.status(500).json({ error: pgError.message || "Error desconocido" });
      }
    } else {
      res.status(500).json({ error: "Error desconocido" });
    }
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Usuario no encontrado" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Contraseña incorrecta" });

    res.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
    });
  } catch (err: unknown) {
    console.error("❌ Error en login:", err);

    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Error desconocido" });
    }
  }
});

export default router;