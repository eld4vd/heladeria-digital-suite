import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Venta } from 'src/ventas/entities/venta.entity';

@Entity('empleados')
export class Empleado {
  @PrimaryGeneratedColumn('identity') // el identity es para que sea autoincremental
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false, select: false }) // el select hace que no se retorne en las consultas
  password: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion', select: false })
  fechaEliminacion: Date;

  // un empleado puede tener muchas ventas
  @OneToMany(() => Venta, (venta) => venta.empleado)
  ventas: Venta[];

  // Hook para hashear password solo en INSERT
  // IMPORTANTE: En UPDATE, solo hashear si el password cambió (detectar si no está ya hasheado)
  @BeforeInsert()
  async hashPasswordOnInsert() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // En UPDATE: solo hashear si el password cambió y NO está hasheado
  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    // Verificar si es un hash de bcrypt (empieza con $2a$, $2b$ o $2y$)
    if (this.password && !this.password.match(/^\$2[ayb]\$/)) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
  // Método para validar password
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
