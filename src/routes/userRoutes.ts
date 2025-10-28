import express from "express";
import pool from "../config/db";
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT id, nombre, apellido_paterno, apellido_materno, correo, estado FROM usuarios ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Actualizar usuario
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, correo } = req.body;

  const result = await pool.query(
    "UPDATE usuarios SET nombre = $1, correo = $2 WHERE id = $3 RETURNING *",
    [nombre, correo, id]
  );



  if (result.rowCount === 0)
    return res.status(404).json({ error: "Usuario no encontrado" });

  res.json({ message: "Usuario actualizado correctamente" });
});

// Eliminar usuario
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
  if (result.rowCount === 0)
    return res.status(404).json({ error: "Usuario no encontrado" });

  res.json({ message: "Usuario eliminado correctamente" });
});

// Registro
router.post("/register", async (req, res) => {
  const { nombre, apellido_paterno, apellido_materno, correo, contraseña } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    await pool.query(
      "INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo, contraseña) VALUES ($1, $2, $3, $4, $5)",
      [nombre, apellido_paterno, apellido_materno, correo, hashedPassword]
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
  const { correo, contraseña } = req.body;
  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Usuario no encontrado" });

    const user = result.rows[0];
    const match = await bcrypt.compare(contraseña, user.contraseña);
    if (!match) return res.status(400).json({ error: "Contraseña incorrecta" });

    res.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
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

// estado activo/inactivo
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // true = activo, false = inactivo

  try {
    const result = await pool.query(
      "UPDATE usuarios SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({
      message: `Usuario ${estado ? "activado" : "desactivado"} correctamente`,
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error al cambiar estado:", err);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
});

export default router;
