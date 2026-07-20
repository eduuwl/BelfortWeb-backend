import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBannerDto {
  @Type(() => Number)
  @IsNumber()
  ordem: number;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  ativo: boolean;

  @IsOptional()
  @IsString()
  link?: string;

  @IsString()
  alt: string;
}
