import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Empleado])],
  providers: [SeedService],
})
export class SeedModule {}
