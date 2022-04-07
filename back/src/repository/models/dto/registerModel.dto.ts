import { IsString } from 'class-validator';

export class RegisterModelDto {
  @IsString()
  repoId: string;
}
