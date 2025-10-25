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
import { CarritoItemsService } from './carrito-items.service';
import { CreateCarritoItemDto } from './dto/create-carrito-item.dto';
import { UpdateCarritoItemDto } from './dto/update-carrito-item.dto';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt-access-auth.guard';
import { Public } from 'src/auth/decorators/auth-public.decorator';

@Controller('carrito-items')
export class CarritoItemsController {
  constructor(private readonly carritoItemsService: CarritoItemsService) {}

  // ========== ENDPOINTS PÚBLICOS (Sin autenticación) ==========

  @Public()
  @Post()
  create(@Body() createCarritoItemDto: CreateCarritoItemDto) {
    return this.carritoItemsService.create(createCarritoItemDto);
  }

  @Public()
  @Get('carrito/:carritoId')
  findByCarritoId(@Param('carritoId') carritoId: string) {
    return this.carritoItemsService.findByCarritoId(+carritoId);
  }

  @Public()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCarritoItemDto: UpdateCarritoItemDto,
  ) {
    return this.carritoItemsService.update(+id, updateCarritoItemDto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carritoItemsService.remove(+id);
  }

  // ========== ENDPOINTS PROTEGIDOS (Con autenticación) ==========

  @UseGuards(JwtAccessAuthGuard)
  @Get()
  findAll() {
    return this.carritoItemsService.findAll();
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carritoItemsService.findOne(+id);
  }
}
