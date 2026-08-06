import { IsString } from 'class-validator';

export class UpdateObservacaoDto {
  @IsString()
  observacao: string;
}
