import { IsString, Matches, MinLength } from 'class-validator';

export class CreateAvaliacaoNutricionalDto {
  @IsString()
  @MinLength(3)
  nome: string;

  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'whatsapp deve conter DDD + número (10 ou 11 dígitos)',
  })
  whatsapp: string;

  @IsString()
  unidade: string;

  @IsString()
  dia: string;

  @IsString()
  data: string;

  @IsString()
  horario: string;

  @IsString()
  valor: string;
}
