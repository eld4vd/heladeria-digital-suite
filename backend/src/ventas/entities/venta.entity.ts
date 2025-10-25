import { DetallesVenta } from 'src/detalles-ventas/entities/detalles-venta.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { PagoSimulado } from 'src/pagos-simulados/entities/pago-simulado.entity';
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
  Index,
} from 'typeorm';

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
  TRANSFERENCIA = 'transferencia',
  QR = 'qr',
}

export enum EstadoVenta {
  COMPLETADA = 'completada',
  DEVOLUCION = 'devolucion',
  BORRADOR = 'borrador',
  ANULADA = 'anulada',
}

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn('identity')
  id: number;

  // Fecha/hora de la venta en UTC (para reportes)
  @Index()
  @Column({
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaHora: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaVenta?: Date | null;

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
  total: number;

  @Column({
    type: 'enum',
    enum: MetodoPago,
    nullable: false,
  })
  metodoPago: MetodoPago;

  @Column({ type: 'varchar', length: 100, nullable: true })
  clienteNombre?: string | null;

  @Column({ type: 'text', nullable: true })
  notas?: string | null;

  @Column({ name: 'empleado_id', type: 'int', nullable: true })
  empleadoId?: number | null;

  // Snapshot de nombre del empleado al momento de la venta (nullable para ventas online)
  @Column({ type: 'varchar', length: 120, nullable: true })
  empleadoNombreSnapshot?: string | null;

  @Index()
  @Column({ type: 'enum', enum: EstadoVenta, default: EstadoVenta.COMPLETADA })
  estado: EstadoVenta;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;

  @DeleteDateColumn({ select: false })
  fechaEliminacion: Date;

  //Muchas ventas a un empleado (nullable para ventas de carrito online sin empleado)
  @ManyToOne(() => Empleado, (empleado) => empleado.ventas, { nullable: true })
  @JoinColumn({ name: 'empleado_id' })
  empleado?: Empleado | null;

  // Una venta puede tener muchos detalles de venta (apunta a tabla detalles_ventas)
  @OneToMany(() => DetallesVenta, (detallesVenta) => detallesVenta.venta)
  detallesVentas: DetallesVenta[];

  // Una venta puede tener muchos pagos simulados
  @OneToMany(() => PagoSimulado, (pago) => pago.venta)
  pagosSimulados: PagoSimulado[];
}
