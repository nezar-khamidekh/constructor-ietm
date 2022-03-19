import { IsNumber, IsString } from 'class-validator';

export class RemoveParticipantDto {
  @IsString()
  userEntry: string;

  @IsString()
  teamId: string;
}
