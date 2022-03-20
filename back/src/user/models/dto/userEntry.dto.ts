import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserEntryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  login?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
