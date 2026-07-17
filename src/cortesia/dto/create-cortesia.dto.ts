import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { IsCpf } from '../../common/is-cpf.validator';

export class CreateCortesiaDto {
  @IsString()
  @MinLength(3)
  nome: string;

  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'whatsapp deve conter DDD + número (10 ou 11 dígitos)',
  })
  whatsapp: string;

  @IsEmail()
  email: string;

  @IsCpf()
  cpf: string;

  @IsString()
  modalidade: string;

  @IsString()
  horario: string;

  @IsString()
  dia: string;

  @IsString()
  datasAula: string;

  @IsString()
  limitacao: string;
}
