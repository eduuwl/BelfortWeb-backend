import { IsString } from 'class-validator';

export class UpdateNumeroMatriculaDto {
  @IsString()
  numeroMatricula: string;
}
