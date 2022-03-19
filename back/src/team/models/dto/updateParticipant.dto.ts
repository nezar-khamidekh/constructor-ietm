import { IsNumber, IsString } from 'class-validator';

export class UpdateParticipantDto {
  @IsString()
  userEntry: string;

  @IsString()
  teamId: string;

  @IsNumber()
  role: number;
}
