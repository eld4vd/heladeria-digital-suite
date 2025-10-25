import { PartialType } from '@nestjs/mapped-types';
import { CreatePagoSimuladoDto } from './create-pago-simulado.dto';

// Habilita parches parciales sobre pagos simulados
export class UpdatePagoSimuladoDto extends PartialType(CreatePagoSimuladoDto) {}
