import { IsOptional, IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsString()
  creatorId: string;
}
