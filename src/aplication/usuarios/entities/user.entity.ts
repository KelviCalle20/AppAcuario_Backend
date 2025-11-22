import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity({ name: "usuarios" })
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 50 })
  nombre!: string;

  @Column({ type: "varchar", length: 50 })
  apellido_paterno!: string;

  @Column({ type: "varchar", length: 50 })
  apellido_materno!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  correo!: string;

  @Column({ type: "text" })
  contrasena!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  rol?: string;

  @Column({ type: "boolean", default: true })
  estado!: boolean;

  @CreateDateColumn({ type: "timestamp", name: "fechacreacion" })
  fechaCreacion!: Date;

  @UpdateDateColumn({ type: "timestamp", name: "fechaactualizacion" })
  fechaActualizacion!: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: "usuariocreacion" })
  usuarioCreacion?: Usuario | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: "usuarioactualizacion" })
  usuarioActualizacion?: Usuario | null;
}

