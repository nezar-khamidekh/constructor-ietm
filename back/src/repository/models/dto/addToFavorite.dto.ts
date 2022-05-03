import { IsString } from 'class-validator';

export class AddToFavoriteDto {
  @IsString()
  repoId: string;

  @IsString()
  userId: string;
}
