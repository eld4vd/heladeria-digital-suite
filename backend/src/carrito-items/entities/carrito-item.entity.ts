import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Carrito } from 'src/carritos/entities/carrito.entity';
import { Producto } from 'src/productos/entities/producto.entity';

@Entity('carrito_items')
export class CarritoItem {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ name: 'carrito_id', type: 'int', nullable: false })
  carritoId: number;

  @Column({ name: 'producto_id', type: 'int', nullable: false })
  productoId: number;

  @Column({ type: 'int', nullable: false })
  cantidad: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value !== null ? Number(value) : null),
    },
  })
  subtotal: number;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;

  // Relaciones
  @ManyToOne(() => Carrito, (carrito) => carrito.items)
  @JoinColumn({ name: 'carrito_id' })
  carrito: Carrito;

  @ManyToOne(() => Producto, (producto) => producto.carritoItems)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}
