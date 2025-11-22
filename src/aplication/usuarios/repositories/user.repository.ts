import { Repository } from "typeorm";
import { AppDataSource } from "../../../config/db";
import { Usuario } from "../entities/user.entity";

export class UserRepository {
  private repo: Repository<Usuario>;

  constructor() {
    this.repo = AppDataSource.getRepository(Usuario);
  }

  findAll() {
    return this.repo.find({ order: { id: "ASC" } });
  }

  findByCorreo(correo: string) {
    return this.repo.findOne({ where: { correo } });
  }

  create(user: Partial<Usuario>) {
    return this.repo.create(user);
  }

  save(user: Usuario) {
    return this.repo.save(user);
  }

  update(id: number, user: Partial<Usuario>) {
    return this.repo.save({ id, ...user });
  }

  changeStatus(id: number, estado: boolean, usuarioActualizacion: Usuario) {
    return this.repo.save({ id, estado, usuarioActualizacion });
  }

  delete(id: number) {
    return this.repo.delete(id);
  }
}

