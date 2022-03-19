import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Participant, ParticipantSchema } from './participant.schema';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({ length: 200, unique: true })
  title: string;

  @Prop({ default: null })
  avatar: string;

  @Prop({ length: 2000, default: null })
  description: string;

  @Prop({ type: [ParticipantSchema], default: [] })
  participants: Participant[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
