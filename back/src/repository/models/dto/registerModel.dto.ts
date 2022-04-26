import { IsString } from 'class-validator';

export class RegisterModelDto {
  @IsString()
  repoId: string;

  @IsString()
  format: ModelFormat;
}

export enum ModelFormat {
  gltf,
  step,
}
