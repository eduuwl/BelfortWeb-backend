import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { IsCpf } from '../../common/is-cpf.validator';

export class CreateMatriculaDto {
  @IsString()
  @MinLength(3)
  nome: string;

  @IsString()
  @MinLength(1)
  nascimento: string;

  @IsEmail()
  email: string;

  @IsCpf()
  cpf: string;

  @IsString()
  @MinLength(5)
  endereco: string;

  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'whatsapp deve conter DDD + número (10 ou 11 dígitos)',
  })
  whatsapp: string;

  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'whatsappEmergencia deve conter DDD + número (10 ou 11 dígitos)',
  })
  whatsappEmergencia: string;

  @IsString()
  instagram: string;

  @IsString()
  limitacao: string;

  @IsString()
  modalidade: string;

  @IsString()
  unidade: string;

  @IsString()
  horario: string;

  @IsString()
  cref: string;

  @IsString()
  plano: string;

  // Obrigatório apenas quando o aluno é menor de idade — regra aplicada no frontend (mesmo
  // padrão de `cref`, que só é obrigatório para modalidade "personal"); aqui só valida o tipo.
  // "" quando o aluno é maior de idade.
  @IsString()
  responsavelNome: string;

  @IsString()
  responsavelWhatsapp: string;

  @IsString()
  aceite: string;
}
