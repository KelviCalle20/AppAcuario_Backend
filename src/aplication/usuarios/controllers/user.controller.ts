import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
  async getAll(_req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const newUser = await userService.register(req.body);
      res.status(201).json({ message: "Usuario registrado", user: newUser });
    } catch (err: any) {
      console.error(err);
      if (err.code === "23505") {
        res.status(400).json({ error: "El usuario ya existe" });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  }

  async login(req: Request, res: Response) {
    const { correo, contrasena } = req.body;
    try {
      const data = await userService.login(correo, contrasena);
      res.json({ message: "Login exitoso", user: data });
    } catch (err: any) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const user = await userService.update(Number(id), req.body);
      res.json({ message: "Usuario actualizado", user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "No se pudo actualizar el usuario" });
    }
  }

  async changeStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { estado, usuarioActualizacion } = req.body;
    try {
      const user = await userService.changeStatus(
        Number(id),
        estado,
        usuarioActualizacion ?? 1 // Por defecto admin 1 si no se envía
      );
      res.json({
        message: `Usuario ${estado ? "activado" : "desactivado"} correctamente`,
        user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al cambiar estado" });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await userService.delete(Number(id));
      res.json({ message: "Usuario eliminado correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al eliminar usuario" });
    }
  }
}


