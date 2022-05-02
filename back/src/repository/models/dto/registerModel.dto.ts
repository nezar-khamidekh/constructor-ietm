import { IsString } from 'class-validator';
import { ModelType } from '../schemas/model.schema';

export class RegisterModelDto {
  @IsString()
  repoId: string;

  @IsString()
  format: ModelFormat;

  @IsString()
  type: ModelType;
}

export enum ModelFormat {
  gltf,
  step,
}
