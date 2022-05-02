import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PositionDocument = Position & Document;

@Schema({ _id: false, versionKey: false })
export class Position {
  @Prop()
  x: number;

  @Prop()
  y: number;

  @Prop()
  z: number;
}

export const PositionSchema = SchemaFactory.createForClass(Position);
