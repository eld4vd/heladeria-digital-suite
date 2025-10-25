import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';

@UseGuards(JwtAccessAuthGuard)
@Controller()
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('dashboard/hoy')
  dashboardHoy(@Query('tz') tz?: string) {
    return this.reportesService.dashboardHoy(tz || 'America/La_Paz');
  }

  @Get('reportes/calendario')
  calendario(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('tz') tz?: string,
  ) {
    return this.reportesService.calendario(
      parseInt(year, 10),
      parseInt(month, 10),
      tz || 'America/La_Paz',
    );
  }

  @Get('reportes/dia')
  porDia(
    @Query('date') date: string,
    @Query('tz') tz?: string,
    @Query('includeDetalles') includeDetalles?: string,
  ) {
    return this.reportesService.porDia(
      date,
      tz || 'America/La_Paz',
      includeDetalles || 'false',
    );
  }
}
