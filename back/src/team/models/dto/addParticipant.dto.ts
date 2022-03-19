import { IsNumber, IsString } from 'class-validator';

export class AddParticipantDto {
  @IsString()
  userEntry: string;

  @IsString()
  teamId: string;

  @IsNumber()
  role: number;
}
