import { Test, TestingModule } from '@nestjs/testing';
import { DetallesVentasService } from './detalles-ventas.service';

describe('DetallesVentasService', () => {
  let service: DetallesVentasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetallesVentasService],
    }).compile();

    service = module.get<DetallesVentasService>(DetallesVentasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
