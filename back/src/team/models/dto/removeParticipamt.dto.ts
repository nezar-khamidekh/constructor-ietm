import { IsNumber, IsOptional, IsString } from 'class-validator';
import { UserEntryDto } from 'src/user/models/dto/userEntry.dto';

export class RemoveParticipantDto extends UserEntryDto {
  @IsString()
  @IsOptional()
  teamId?: string;

  @IsOptional()
  @IsString()
  repoId?: string;
}
