import { IsString } from 'class-validator';

export class FileDto {
  @IsString()
  repoId: string;

  @IsString()
  path: string;

  @IsString()
  name: string;
}
