import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Venta, EstadoVenta } from '../ventas/entities/venta.entity';
import { DetallesVenta } from '../detalles-ventas/entities/detalles-venta.entity';
import { DateTime } from 'luxon';

type UtcDayRange = { start: Date; end: Date };

// Normaliza un día calendárico a su rango equivalente en UTC
const toUtcRangeForDay = (dateStr: string, tz: string): UtcDayRange => {
  // dateStr: YYYY-MM-DD interpretado en la zona tz
  const startZoned = DateTime.fromISO(dateStr, { zone: tz }).startOf('day');
  const endZoned = startZoned.plus({ days: 1 });
  return {
    start: startZoned.toUTC().toJSDate(),
    end: endZoned.toUTC().toJSDate(),
  };
};

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Venta) private ventasRepo: Repository<Venta>,
    @InjectRepository(DetallesVenta)
    private detallesRepo: Repository<DetallesVenta>,
  ) {}

  // Reúne métricas rápidas del día actual para el dashboard principal
  async dashboardHoy(tz = 'America/La_Paz') {
    const today = DateTime.now().setZone(tz);
    const y = today.toFormat('yyyy');
    const m = today.toFormat('MM');
    const d = today.toFormat('dd');
    const { start, end } = toUtcRangeForDay(`${y}-${m}-${d}`, tz);

    const ventas = await this.ventasRepo.find({
      where: {
        fechaHora: Between(start, end),
        estado: In([EstadoVenta.COMPLETADA, EstadoVenta.DEVOLUCION]),
      },
      relations: ['detallesVentas'],
      order: { fechaHora: 'DESC' },
    });

    // Calcular totales
    let importeTotal = 0;
    let itemsVendidos = 0;
    for (const v of ventas) {
      const signo = v.estado === EstadoVenta.DEVOLUCION ? -1 : 1;
      importeTotal += Number(v.total) * signo;
      itemsVendidos +=
        v.detallesVentas?.reduce((acc, d) => acc + d.cantidad, 0) || 0;
    }

    return {
      fecha: `${y}-${m}-${d}`,
      ventasCount: ventas.length,
      importeTotal,
      itemsVendidos,
      ultimasVentas: ventas.slice(0, 10),
    };
  }

  // Analiza día a día un mes completo construyendo filas agregadas
  async calendario(year: number, month: number, tz = 'America/La_Paz') {
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const rows: Array<{
      date: string;
      ventasCount: number;
      importeTotal: number;
      itemsVendidos: number;
      empleadosUnicos: number;
    }> = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day
        .toString()
        .padStart(2, '0')}`;
      const { start, end } = toUtcRangeForDay(dateStr, tz);
      const ventas = await this.ventasRepo.find({
        where: {
          fechaHora: Between(start, end),
          estado: In([EstadoVenta.COMPLETADA, EstadoVenta.DEVOLUCION]),
        },
        relations: ['detallesVentas'],
      });
      let importeTotal = 0;
      let itemsVendidos = 0;
      const empleadosSet = new Set<string>();
      for (const v of ventas) {
        // Si es devolución, resta
        importeTotal +=
          Number(v.total) * (v.estado === EstadoVenta.DEVOLUCION ? -1 : 1);
        itemsVendidos +=
          v.detallesVentas?.reduce((acc, d) => acc + d.cantidad, 0) || 0;
        if (v.empleadoNombreSnapshot) {
          empleadosSet.add(v.empleadoNombreSnapshot);
        }
      }
      rows.push({
        date: dateStr,
        ventasCount: ventas.length,
        importeTotal,
        itemsVendidos,
        empleadosUnicos: empleadosSet.size,
      });
    }
    return rows;
  }

  // Devuelve ventas de un día con un resumen opcional por empleado
  async porDia(date: string, tz = 'America/La_Paz', includeDetalles = 'false') {
    const { start, end } = toUtcRangeForDay(date, tz);
    const ventas = await this.ventasRepo.find({
      where: {
        fechaHora: Between(start, end),
        estado: In([EstadoVenta.COMPLETADA, EstadoVenta.DEVOLUCION]),
      },
      relations:
        includeDetalles === 'true'
          ? ['detallesVentas', 'detallesVentas.producto']
          : [],
      order: { fechaHora: 'DESC' },
    });

    const resumenPorEmpleado: Record<
      string,
      { ventasCount: number; importeTotal: number }
    > = {};
    for (const v of ventas) {
      const key = v.empleadoNombreSnapshot || 'Desconocido';
      if (!resumenPorEmpleado[key])
        resumenPorEmpleado[key] = { ventasCount: 0, importeTotal: 0 };
      resumenPorEmpleado[key].ventasCount += 1;
      resumenPorEmpleado[key].importeTotal +=
        Number(v.total) * (v.estado === EstadoVenta.DEVOLUCION ? -1 : 1);
    }

    return { date, ventas, resumenPorEmpleado };
  }
}
