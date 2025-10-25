import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { CarritoItem } from 'src/carrito-items/entities/carrito-item.entity';

@Entity('carritos')
export class Carrito {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'int', nullable: true })
  clienteId?: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  clienteTempId?: string | null;

  @Column({ type: 'varchar', length: 20, default: 'activo' })
  estado: string; // activo | pagado | cancelado

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value !== null ? Number(value) : null),
    },
  })
  total: number;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;

  @DeleteDateColumn({ select: false })
  fechaEliminacion: Date;

  // Relaciones
  @OneToMany(() => CarritoItem, (item) => item.carrito)
  items: CarritoItem[];
}
