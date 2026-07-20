import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBannerDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ordem?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  alt?: string;
}
