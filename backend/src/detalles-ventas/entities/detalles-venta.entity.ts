import { Venta } from 'src/ventas/entities/venta.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('detalles_ventas')
export class DetallesVenta {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ name: 'venta_id', type: 'int', nullable: false })
  ventaId: number;

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
  precioUnitario: number;

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

  @DeleteDateColumn({ select: false })
  fechaEliminacion: Date;
  // Muchos detalles a una venta
  @ManyToOne(() => Venta, (venta) => venta.detallesVentas)
  @JoinColumn({ name: 'venta_id', referencedColumnName: 'id' })
  venta: Venta;

  // Muchos detalles a un producto
  @ManyToOne(() => Producto, (producto) => producto.detallesVentas)
  @JoinColumn({ name: 'producto_id', referencedColumnName: 'id' })
  producto: Producto;
}
