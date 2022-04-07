import { IsNumber, IsOptional, IsString } from 'class-validator';
import { RepositoryType } from '../schemas/repository.schema';

export class CreateRepositoryDto {
  @IsString()
  author: string;

  @IsString()
  @IsOptional()
  team?: string;

  @IsString()
  title: string;

  @IsNumber()
  type: RepositoryType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsOptional()
  preview?: string;
}
