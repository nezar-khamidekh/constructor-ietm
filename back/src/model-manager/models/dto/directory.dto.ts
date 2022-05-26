import { IsString } from 'class-validator';

export class DirectoryDto {
  @IsString()
  path: string;

  @IsString()
  name: string;
}
