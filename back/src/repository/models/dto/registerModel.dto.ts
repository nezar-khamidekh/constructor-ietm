import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ModelType } from '../schemas/model.schema';

export class RegisterModelDto {
  @IsString()
  repoId: string;

  @IsString()
  format: ModelFormat;

  @IsOptional()
  @IsNumber()
  type: ModelType;
}

export enum ModelFormat {
  gltf,
  step,
}
