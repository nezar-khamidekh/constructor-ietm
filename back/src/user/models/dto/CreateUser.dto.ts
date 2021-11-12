import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  login: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  username: string;
}
