import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  constructor() {
    this.firstName = this.firstName || '';
    this.lastName = this.lastName || '';
  }

  @IsString()
  login: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  username: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
