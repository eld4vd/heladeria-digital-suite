import { Categoria } from 'src/categorias/entities/categoria.entity';
import { DetallesVenta } from 'src/detalles-ventas/entities/detalles-venta.entity';
import { CarritoItem } from 'src/carrito-items/entities/carrito-item.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: false })
  sabor: string;

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
  precio: number;

  @Column({ type: 'int', default: 0, nullable: false })
  stock: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imagenUrl?: string | null;

  @Column({ name: 'categoria_id', type: 'int', nullable: false })
  categoriaId: number;

  @Column({ type: 'boolean', default: true, nullable: false })
  activo: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;

  @DeleteDateColumn({ select: false })
  fechaEliminacion: Date;

  //un producto puede pertenecer a una categoria
  @ManyToOne(() => Categoria, (categoria) => categoria.productos)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  // un producto puede tener muchos detalles de venta (apunta a tabla detalles_ventas)
  @OneToMany(() => DetallesVenta, (detallesVenta) => detallesVenta.producto)
  detallesVentas: DetallesVenta[];

  // un producto puede estar en muchos items de carrito
  @OneToMany(() => CarritoItem, (carritoItem) => carritoItem.producto)
  carritoItems: CarritoItem[];
}
