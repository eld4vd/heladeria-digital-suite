import { Test, TestingModule } from '@nestjs/testing';
import { CarritoItemsService } from './carrito-items.service';

describe('CarritoItemsService', () => {
  let service: CarritoItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarritoItemsService],
    }).compile();

    service = module.get<CarritoItemsService>(CarritoItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
