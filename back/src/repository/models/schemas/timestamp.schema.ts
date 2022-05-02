import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimestampDocument = Timestamp & Document;

@Schema({ _id: false, versionKey: false })
export class Timestamp {
  @Prop()
  start: number;

  @Prop()
  end: number;

  @Prop({ length: 500 })
  text: string;
}

export const TimestampSchema = SchemaFactory.createForClass(Timestamp);
