import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  Participant,
  ParticipantSchema,
} from 'src/team/models/schemas/participant.schema';
import { Model, ModelSchema } from './model.schema';

export type RepositoryDocument = Repository & Document;

@Schema({ timestamps: true })
export class Repository {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', default: null })
  team: Types.ObjectId;

  @Prop({ length: 200, unique: true })
  title: string;

  @Prop()
  type: RepositoryType;

  @Prop({ default: null })
  description: string;

  @Prop({ default: null })
  preview: string;

  @Prop({ type: [ParticipantSchema], default: [] })
  participants: Participant[];

  @Prop({ type: [ModelSchema], default: [] })
  models: Model[];
}

export const RepositorySchema = SchemaFactory.createForClass(Repository);

export enum RepositoryType {
  Public,
  Private,
}
