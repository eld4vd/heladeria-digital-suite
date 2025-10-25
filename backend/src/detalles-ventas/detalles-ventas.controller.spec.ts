import { Test, TestingModule } from '@nestjs/testing';
import { DetallesVentasController } from './detalles-ventas.controller';
import { DetallesVentasService } from './detalles-ventas.service';

describe('DetallesVentasController', () => {
  let controller: DetallesVentasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetallesVentasController],
      providers: [DetallesVentasService],
    }).compile();

    controller = module.get<DetallesVentasController>(DetallesVentasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
