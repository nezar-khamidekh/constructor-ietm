import { IsString } from 'class-validator';

export class ObjectDto {
  @IsString()
  repoId: string;

  @IsString()
  path: string;

  @IsString()
  fullname: string;
}
