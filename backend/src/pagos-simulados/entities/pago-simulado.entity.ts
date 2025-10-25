import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Venta } from 'src/ventas/entities/venta.entity';

@Entity('pagos_simulados')
export class PagoSimulado {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ name: 'venta_id', type: 'int', nullable: false })
  ventaId: number;

  @Column({ type: 'varchar', length: 20, nullable: false, default: 'qr' })
  metodoPago: 'qr' | 'debito';

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value !== null ? Number(value) : null),
    },
  })
  monto: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  codigoQr?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  numeroTarjeta?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombreTitular?: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  estadoPago: 'pendiente' | 'aprobado' | 'rechazado';

  @Column({ type: 'timestamp', nullable: true })
  fechaPago?: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  clienteNombre?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  direccionEntrega?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string | null;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaModificacion: Date;

  // Relaciones
  @ManyToOne(() => Venta, (venta) => venta.pagosSimulados)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;
}
