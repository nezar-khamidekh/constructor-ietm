import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ManageModelDto {
  @IsString()
  format: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  compression?: number;
}
