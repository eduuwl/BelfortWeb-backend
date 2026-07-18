import { IsBoolean } from 'class-validator';

export class UpdatePresencaDto {
  @IsBoolean()
  confirmada: boolean;
}
