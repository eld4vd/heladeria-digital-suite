import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PagosSimuladosService } from './pagos-simulados.service';
import { CreatePagoSimuladoDto } from './dto/create-pago-simulado.dto';
import { UpdatePagoSimuladoDto } from './dto/update-pago-simulado.dto';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';

@UseGuards(JwtAccessAuthGuard)
@Controller('pagos-simulados')
export class PagosSimuladosController {
  constructor(private readonly pagosSimuladosService: PagosSimuladosService) {}

  @Post()
  create(@Body() createPagoSimuladoDto: CreatePagoSimuladoDto) {
    return this.pagosSimuladosService.create(createPagoSimuladoDto);
  }

  @Get()
  findAll() {
    return this.pagosSimuladosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagosSimuladosService.findOne(+id);
  }

  @Get('venta/:ventaId')
  findByVentaId(@Param('ventaId') ventaId: string) {
    return this.pagosSimuladosService.findByVentaId(+ventaId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePagoSimuladoDto: UpdatePagoSimuladoDto,
  ) {
    return this.pagosSimuladosService.update(+id, updatePagoSimuladoDto);
  }

  @Patch(':id/completar')
  completarPago(@Param('id') id: string) {
    return this.pagosSimuladosService.completarPago(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosSimuladosService.remove(+id);
  }
}
