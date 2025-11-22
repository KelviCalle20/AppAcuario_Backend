import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Usuario } from "../aplication/usuarios/entities/user.entity";
// importa otras entidades según sea necesario

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Usuario], // agrega todas tus entidades aquí
  synchronize: false, // si ya tienes tablas creadas, NO pongas true
  logging: false,
});
// Inicialización
AppDataSource.initialize()
  .then(() => {
    console.log("Conectado a PostgreSQL con TypeORM");
  })
  .catch((err) => {
    console.error("Error al conectar con TypeORM:", err);
  });