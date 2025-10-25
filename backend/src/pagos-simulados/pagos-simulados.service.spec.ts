import { Test, TestingModule } from '@nestjs/testing';
import { PagosSimuladosService } from './pagos-simulados.service';

describe('PagosSimuladosService', () => {
  let service: PagosSimuladosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagosSimuladosService],
    }).compile();

    service = module.get<PagosSimuladosService>(PagosSimuladosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
