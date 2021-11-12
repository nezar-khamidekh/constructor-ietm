import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  login?: string;

  @IsEmail()
  email?: string;

  @IsString()
  password: string;
}
