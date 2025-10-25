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
import { CarritosService } from './carritos.service';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';
import { CheckoutCarritoDto } from './dto/checkout-carrito.dto';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';
import { Public } from 'src/auth/decorators/auth-public.decorator';

@Controller('carritos')
export class CarritosController {
  constructor(private readonly carritosService: CarritosService) {}

  // ========== ENDPOINTS PÚBLICOS (Sin autenticación) ==========

  @Public()
  @Post()
  create(@Body() createCarritoDto: CreateCarritoDto) {
    return this.carritosService.create(createCarritoDto);
  }

  @Public()
  @Post('checkout')
  checkout(@Body() checkoutDto: CheckoutCarritoDto) {
    return this.carritosService.checkout(checkoutDto);
  }

  // ========== ENDPOINTS PROTEGIDOS (Con autenticación) ==========

  @UseGuards(JwtAccessAuthGuard)
  @Get()
  findAll() {
    return this.carritosService.findAll();
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carritosService.findOne(+id);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('cliente/:clienteId')
  findByClienteId(@Param('clienteId') clienteId: string) {
    return this.carritosService.findByClienteId(+clienteId);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('temp/:clienteTempId')
  findByClienteTempId(@Param('clienteTempId') clienteTempId: string) {
    return this.carritosService.findByClienteTempId(clienteTempId);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarritoDto: UpdateCarritoDto) {
    return this.carritosService.update(+id, updateCarritoDto);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Patch(':id/recalcular')
  recalcularTotal(@Param('id') id: string) {
    return this.carritosService.recalcularTotal(+id);
  }

  @UseGuards(JwtAccessAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carritosService.remove(+id);
  }
}
