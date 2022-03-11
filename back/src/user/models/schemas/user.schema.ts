import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, length: 50 })
  login: string;

  @Prop({ length: 125 })
  username: string;

  @Prop({ unique: true, length: 100 })
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop({ length: 125, default: null })
  firstName: string;

  @Prop({ length: 125, default: null })
  lastName: string;

  @Prop({ default: null })
  avatar: string;

  @Prop({ type: Types.ObjectId, ref: 'RefreshToken' })
  refreshTokens: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
