import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Position, PositionSchema } from './position.schema';

export type AnnotationDocument = Annotation & Document;

@Schema({ _id: false, versionKey: false })
export class Annotation {
  @Prop({ length: 150 })
  title: string;

  @Prop({ length: 650 })
  description: string;

  @Prop({ type: [PositionSchema], default: null })
  position: Position;

  @Prop()
  attachedObjectId: string;
}

export const AnnotationSchema = SchemaFactory.createForClass(Annotation);
