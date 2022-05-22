import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Timestamp, TimestampSchema } from './timestamp.schema';

export type GuidelineDocument = Guideline & Document;

@Schema()
export class Guideline {
  @Prop({ length: 200 })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Model' })
  assinedModel: Types.ObjectId;

  @Prop({ type: [TimestampSchema], default: [] })
  timeStamps: Timestamp[];
}

export const GuidelineSchema = SchemaFactory.createForClass(Guideline);
