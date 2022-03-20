import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ParticipantDocument = Participant & Document;

@Schema({ _id: false })
export class Participant {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  login: string;

  @Prop()
  role: ParticipantRole;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);

export enum ParticipantRole {
  Author,
  Editor,
  Reader,
}
