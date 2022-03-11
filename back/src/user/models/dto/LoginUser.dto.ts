import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  login?: string;

  @IsString()
  password: string;
}
