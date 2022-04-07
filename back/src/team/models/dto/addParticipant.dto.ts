import { IsNumber, IsOptional, IsString } from 'class-validator';
import { UserEntryDto } from 'src/user/models/dto/userEntry.dto';

export class AddParticipantDto extends UserEntryDto {
  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  repoId?: string;

  @IsNumber()
  role: number;
}
