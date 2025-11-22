import { Router, Request, Response } from "express";
import pool from "../config/db";

const router = Router();

/* ============================================================
   AGREGAR PRODUCTO AL CARRITO
============================================================ */
router.post("/add", async (req: Request, res: Response) => {
  const { usuario_id, producto_id, cantidad } = req.body;

  try {
    if (!usuario_id || !producto_id || !cantidad) {
      return res.status(400).json({ message: "Faltan datos requeridos." });
    }

    // Verificar si el producto existe y tiene stock
    const productoRes = await pool.query(
      "SELECT id, stock FROM productos WHERE id = $1 AND estado = TRUE",
      [producto_id]
    );

    if (productoRes.rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado o inactivo." });
    }

    const stockDisponible = productoRes.rows[0].stock;
    if (stockDisponible < cantidad) {
      return res.status(400).json({ message: "Stock insuficiente." });
    }

    // Buscar si el usuario ya tiene un carrito activo
    const carritoRes = await pool.query(
      "SELECT id FROM carritos WHERE usuario_id = $1 AND estado = TRUE",
      [usuario_id]
    );

    let carritoId: number;

    if (carritoRes.rows.length > 0) {
      carritoId = carritoRes.rows[0].id;
    } else {
      // Crear nuevo carrito
      const nuevo = await pool.query(
        "INSERT INTO carritos (usuario_id, usuarioCreacion, usuarioActualizacion) VALUES ($1, $1, $1) RETURNING id",
        [usuario_id]
      );
      carritoId = nuevo.rows[0].id;
    }

    // Verificar si el producto ya está en el carrito
    const detalle = await pool.query(
      "SELECT id, cantidad FROM detalle_carrito WHERE carrito_id = $1 AND producto_id = $2",
      [carritoId, producto_id]
    );

    if (detalle.rows.length > 0) {
      // Si ya existe, aumentar cantidad
      const nuevaCantidad = detalle.rows[0].cantidad + cantidad;

      if (nuevaCantidad > stockDisponible) {
        return res.status(400).json({ message: "No hay suficiente stock disponible." });
      }

      await pool.query(
        "UPDATE detalle_carrito SET cantidad = $1, fechaActualizacion = NOW(), usuarioActualizacion = $2 WHERE id = $3",
        [nuevaCantidad, usuario_id, detalle.rows[0].id]
      );
    } else {
      // Insertar nuevo producto en el carrito
      await pool.query(
        "INSERT INTO detalle_carrito (carrito_id, producto_id, cantidad, usuarioCreacion, usuarioActualizacion) VALUES ($1, $2, $3, $4, $4)",
        [carritoId, producto_id, cantidad, usuario_id]
      );
    }

    // Actualizar stock del producto
    await pool.query(
      "UPDATE productos SET stock = stock - $1 WHERE id = $2",
      [cantidad, producto_id]
    );

    res.status(200).json({ message: "✅ Producto agregado al carrito correctamente." });
  } catch (err) {
    console.error("Error al agregar producto al carrito:", err);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

/* ============================================================
   OBTENER PRODUCTOS DEL CARRITO DE UN USUARIO
============================================================ */
router.get("/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        dc.id AS detalle_id, 
        p.id AS producto_id, 
        p.nombre, 
        p.precio, 
        p.imagen_url,
        dc.cantidad, 
        (p.precio * dc.cantidad) AS subtotal
      FROM carritos c
      JOIN detalle_carrito dc ON c.id = dc.carrito_id
      JOIN productos p ON p.id = dc.producto_id
      WHERE c.usuario_id = $1 AND c.estado = TRUE
      ORDER BY dc.id ASC
      `,
      [usuario_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener el carrito." });
  }
});

/* ============================================================
   ELIMINAR UN PRODUCTO DEL CARRITO
============================================================ */
router.delete("/remove/:detalle_id", async (req, res) => {
  const { detalle_id } = req.params;

  try {
    const detalle = await pool.query(
      "SELECT producto_id, cantidad FROM detalle_carrito WHERE id = $1",
      [detalle_id]
    );

    if (detalle.rows.length === 0) {
      return res.status(404).json({ message: "Detalle no encontrado." });
    }

    const { producto_id, cantidad } = detalle.rows[0];

    // Restaurar stock del producto
    await pool.query(
      "UPDATE productos SET stock = stock + $1 WHERE id = $2",
      [cantidad, producto_id]
    );

    // Eliminar del carrito
    await pool.query("DELETE FROM detalle_carrito WHERE id = $1", [detalle_id]);

    res.json({ message: "Producto eliminado del carrito correctamente." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar producto." });
  }
});

/* ============================================================
   VACIAR TODO EL CARRITO DE UN USUARIO
============================================================ */
router.delete("/clear/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const detalles = await pool.query(
      `
      SELECT dc.producto_id, dc.cantidad 
      FROM carritos c 
      JOIN detalle_carrito dc ON c.id = dc.carrito_id
      WHERE c.usuario_id = $1 AND c.estado = TRUE
      `,
      [usuario_id]
    );

    // Restaurar stock de todos los productos
    for (const item of detalles.rows) {
      await pool.query(
        "UPDATE productos SET stock = stock + $1 WHERE id = $2",
        [item.cantidad, item.producto_id]
      );
    }

    // Eliminar detalles del carrito
    await pool.query(
      "DELETE FROM detalle_carrito WHERE carrito_id = (SELECT id FROM carritos WHERE usuario_id = $1 AND estado = TRUE)",
      [usuario_id]
    );

    res.json({ message: "🧹 Carrito vaciado correctamente." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al vaciar carrito." });
  }
});

export default router;


