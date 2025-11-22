//rutas mejoradas
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./aplication/usuarios/routes/user.routes";
//import productRoutes from "./routes/productRoutes";
//import categoryRoutes from "./routes/categoryRoutes";
//import cartRoutes from "./routes/cartRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
//app.use("/api/products", productRoutes);
//app.use("/api/categories", categoryRoutes);
//app.use("/api/carrito", cartRoutes);

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});