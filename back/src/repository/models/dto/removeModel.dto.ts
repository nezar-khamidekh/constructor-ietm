import { IsString } from 'class-validator';

export class RemoveModelDto {
  @IsString()
  repoId: string;

  @IsString()
  modelId: string;
}
