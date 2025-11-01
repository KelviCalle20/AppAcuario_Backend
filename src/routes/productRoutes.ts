import express from "express";
import pool from "../config/db";

const router = express.Router();
const INITIAL_ADMIN_ID = 1;

// Obtener todos los productos
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.imagen_url,
             c.nombre AS categoria, p.estado,
             p.fechaCreacion, p.usuarioCreacion, p.fechaActualizacion, p.usuarioActualizacion
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Crear producto
router.post("/", async (req, res) => {
  const {
    nombre,
    descripcion,
    precio,
    stock,
    categoria_id,
    imagen_url,
    usuarioCreacion,
  } = req.body;

  const creatorId = Number(usuarioCreacion) || INITIAL_ADMIN_ID;

  try {
    await pool.query(
      `
      INSERT INTO productos 
        (nombre, descripcion, precio, stock, categoria_id, imagen_url, usuarioCreacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [nombre, descripcion, precio, stock, categoria_id, imagen_url, creatorId]
    );

    res.status(201).json({ message: "Producto registrado correctamente" });
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// Actualizar producto
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    descripcion,
    precio,
    stock,
    categoria_id,
    imagen_url,
    usuarioActualizacion,
  } = req.body;

  const updaterId = Number(usuarioActualizacion) || INITIAL_ADMIN_ID;

  try {
    const result = await pool.query(
      `
      UPDATE productos
      SET nombre = $1,
          descripcion = $2,
          precio = $3,
          stock = $4,
          categoria_id = $5,
          imagen_url = $6,
          usuarioActualizacion = $7,
          fechaActualizacion = NOW()
      WHERE id = $8
      RETURNING *
    `,
      [nombre, descripcion, precio, stock, categoria_id, imagen_url, updaterId, id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ message: "Producto actualizado correctamente", producto: result.rows[0] });
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

// Cambiar estado de un producto
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const result = await pool.query(
      `UPDATE productos
       SET estado = $1, fechaActualizacion = NOW()
       WHERE id = $2 RETURNING *`,
      [estado, id]
    );
    if (result.rows.length === 0) return res.status(404).send("Producto no encontrado");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error del servidor");
  }
});


// Eliminar producto
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM productos WHERE id = $1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

export default router;
