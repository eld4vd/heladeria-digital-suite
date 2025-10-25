import { Test, TestingModule } from '@nestjs/testing';
import { PagosSimuladosController } from './pagos-simulados.controller';
import { PagosSimuladosService } from './pagos-simulados.service';

describe('PagosSimuladosController', () => {
  let controller: PagosSimuladosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagosSimuladosController],
      providers: [PagosSimuladosService],
    }).compile();

    controller = module.get<PagosSimuladosController>(PagosSimuladosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
