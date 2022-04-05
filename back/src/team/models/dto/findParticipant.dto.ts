import { IsString } from 'class-validator';
import { UserEntryDto } from 'src/user/models/dto/userEntry.dto';

export class FindParticipantDto extends UserEntryDto {
  @IsString()
  teamId: string;
}
