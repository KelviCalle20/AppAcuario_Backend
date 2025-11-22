import bcrypt from "bcrypt";
import { Usuario } from "../entities/user.entity";
import { UserRepository } from "../repositories/user.repository";

const INITIAL_ADMIN_ID = 1; // para actualizar usuarioActualizacion

export class UserService {
  private repo = new UserRepository();

  async getAllUsers(): Promise<Usuario[]> {
    return this.repo.findAll();
  }

  async register(user: Partial<Usuario>): Promise<Usuario> {
    const hashedPassword = await bcrypt.hash(user.contrasena!, 10);

    const newUser = this.repo.create({
      nombre: user.nombre,
      apellido_paterno: user.apellido_paterno,
      apellido_materno: user.apellido_materno,
      correo: user.correo,
      contrasena: hashedPassword,
      rol: user.rol ?? "cliente",
      estado: true,
      usuarioCreacion: user.usuarioCreacion ?? { id: INITIAL_ADMIN_ID } as Usuario,
      usuarioActualizacion: null,
    });


    return await this.repo.save(newUser);

  }

  async login(correo: string, contrasena: string) {
    const user = await this.repo.findByCorreo(correo);
    if (!user) throw new Error("Usuario no encontrado");

    const isValid = await bcrypt.compare(contrasena, user.contrasena);
    if (!isValid) throw new Error("Contraseña incorrecta");

    return { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol };
  }

  async update(id: number, user: Partial<Usuario>) {
    return this.repo.update(id, {
      ...user,
      usuarioActualizacion: user.usuarioActualizacion ?? { id: INITIAL_ADMIN_ID } as Usuario,
      fechaActualizacion: new Date(),
    });
  }

  async changeStatus(id: number, estado: boolean, usuarioActualizacion: Usuario) {
    return this.repo.changeStatus(id, estado, usuarioActualizacion);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}
