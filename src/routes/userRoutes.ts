import express from "express";
import pool from "../config/db";
import bcrypt from "bcrypt";

const router = express.Router();
const INITIAL_ADMIN_ID = 1;// yo soy admin main

// Obtener todos los usuarios
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, apellido_paterno, apellido_materno, correo, rol, estado, 
              fechaCreacion, usuarioCreacion, fechaActualizacion, usuarioActualizacion 
       FROM usuarios ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Registro de usuario (auto o por admin)
router.post("/register", async (req, res) => {
  const { nombre, apellido_paterno, apellido_materno, correo, contrasena, rol = "cliente", usuarioCreacion = null } = req.body;
  const loggedUserId = Number(usuarioCreacion) || INITIAL_ADMIN_ID;

  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const result = await pool.query(
      `INSERT INTO usuarios
        (nombre, apellido_paterno, apellido_materno, correo, contrasena, rol, usuarioCreacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [nombre, apellido_paterno, apellido_materno, correo, hashedPassword, rol, loggedUserId]
    );

    const newUserId = result.rows[0].id;

    // Si se auto-registra, ponemos su propio ID como usuarioCreacion
    if (!usuarioCreacion) {
      await pool.query("UPDATE usuarios SET usuarioCreacion = $1 WHERE id = $1", [newUserId]);
    }

    res.status(201).json({ message: "Usuario registrado correctamente", id: newUserId });
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
  const { correo, contrasena } = req.body;

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);
    if (result.rows.length === 0) return res.status(400).json({ error: "Usuario no encontrado" });

    const user = result.rows[0];
    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) return res.status(400).json({ error: "Contraseña incorrecta" });

    res.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
      },
    });
  } catch (err: unknown) {
    console.error("Error en login:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Error desconocido" });
  }
});

// Actualizar usuario
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido_paterno, apellido_materno, correo, rol, usuarioActualizacion } = req.body;

  const updaterId = Number(usuarioActualizacion) || INITIAL_ADMIN_ID;

  try {
    const result = await pool.query(
      `UPDATE usuarios 
       SET nombre = $1, apellido_paterno = $2, apellido_materno = $3, correo = $4, rol = $5, usuarioActualizacion = $6, fechaActualizacion = NOW()
       WHERE id = $7
       RETURNING *`,
      [nombre, apellido_paterno, apellido_materno, correo, rol, updaterId, id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario actualizado correctamente", user: result.rows[0] });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ error: "No se pudo actualizar el usuario" });
  }
});

// Cambiar estado activo/inactivo
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { estado, usuarioActualizacion } = req.body;

  const updaterId = Number(usuarioActualizacion) || INITIAL_ADMIN_ID;

  try {
    const result = await pool.query(
      `UPDATE usuarios
       SET estado = $1, usuarioActualizacion = $2, fechaActualizacion = NOW()
       WHERE id = $3
       RETURNING *`,
      [estado, updaterId, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({
      message: `Usuario ${estado ? "activado" : "desactivado"} correctamente`,
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error al cambiar estado:", err);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
});

// Eliminar usuario
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

export default router;


