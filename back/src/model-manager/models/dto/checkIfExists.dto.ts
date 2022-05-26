import { IsOptional, IsString } from 'class-validator';

export enum ObjectType {
  directory, file
}

export class ObjectDto {
  @IsString()
  path: string;

  @IsString()
  fullname: string;

  @IsString()
  type: ObjectType;
}
