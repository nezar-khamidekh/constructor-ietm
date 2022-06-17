import { ObjectDto } from './object.dto';
import { IsString } from 'class-validator';

export class RenameDto extends ObjectDto {
  @IsString()
  newName: string;
}
