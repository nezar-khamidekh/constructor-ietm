import { IsNumber, IsString } from 'class-validator';
import { UserEntryDto } from 'src/user/models/dto/userEntry.dto';

export class UpdateParticipantDto extends UserEntryDto {
  @IsString()
  teamId: string;

  @IsNumber()
  role: number;
}
