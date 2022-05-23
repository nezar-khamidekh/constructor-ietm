import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ManageModelDto {
  @IsString()
  targetFormat: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  compression?: number;
}
