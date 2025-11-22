import express from "express";
import pool from "../config/db"; // tu conexión a PostgreSQL

const router = express.Router();

// Obtener todas las categorías activas
router.get("/", async (_req, res) => {
  const result = await pool.query(
    "SELECT id, nombre FROM categorias WHERE estado = true ORDER BY nombre"
  );
  res.json(result.rows);
});

export default router;

