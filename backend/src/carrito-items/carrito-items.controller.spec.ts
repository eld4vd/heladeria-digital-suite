import { Test, TestingModule } from '@nestjs/testing';
import { CarritoItemsController } from './carrito-items.controller';
import { CarritoItemsService } from './carrito-items.service';

describe('CarritoItemsController', () => {
  let controller: CarritoItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarritoItemsController],
      providers: [CarritoItemsService],
    }).compile();

    controller = module.get<CarritoItemsController>(CarritoItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
