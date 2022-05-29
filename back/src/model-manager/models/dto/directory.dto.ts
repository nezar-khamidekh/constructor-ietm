import { IsString } from 'class-validator';

export class DirectoryDto {
  @IsString()
  repoId: string;

  @IsString()
  path: string;

  @IsString()
  name: string;
}
