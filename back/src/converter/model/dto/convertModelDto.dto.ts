import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ConvertModelDto {
  @IsString()
  format: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  compression?: number;
}
