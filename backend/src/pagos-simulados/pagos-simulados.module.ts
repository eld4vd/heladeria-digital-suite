import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosSimuladosService } from './pagos-simulados.service';
import { PagosSimuladosController } from './pagos-simulados.controller';
import { PagoSimulado } from './entities/pago-simulado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PagoSimulado])],
  controllers: [PagosSimuladosController],
  providers: [PagosSimuladosService],
  exports: [PagosSimuladosService],
})
export class PagosSimuladosModule {}
