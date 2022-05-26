import { IsString } from 'class-validator';

export class FileDto {
  @IsString()
  path: string;

  @IsString()
  fullname: string;
}
