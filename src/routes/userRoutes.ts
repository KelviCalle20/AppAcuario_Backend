import express from "express";
import pool from "../config/db";
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT id, name, ap, am, email FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Actualizar usuario
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  const result = await pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
    [name, email, id]
  );

  if (result.rowCount === 0)
    return res.status(404).json({ error: "Usuario no encontrado" });

  res.json({ message: "Usuario actualizado correctamente" });
});

// Eliminar usuario
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
  if (result.rowCount === 0)
    return res.status(404).json({ error: "Usuario no encontrado" });

  res.json({ message: "Usuario eliminado correctamente" });
});

// Registro
router.post("/register", async (req, res) => {
  const { name, ap, am, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, ap, am, email, password) VALUES ($1, $2, $3, $4, $5)",
      [name, ap, am, email, hashedPassword]
    );
    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (err: unknown) {
    console.error("Error en registro:", err);

    if (err instanceof Error) {
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
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: unknown) {
    console.error("Error en login:", err);

    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Error desconocido" });
    }
  }
});

export default router;
