import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Annotation, AnnotationSchema } from './annotation.schema';
export type AnnotationGroupDocument = AnnotationGroup & Document;

@Schema({ _id: false, versionKey: false, timestamps: false })
export class AnnotationGroup {
  @Prop({ type: Types.ObjectId, ref: 'Model' })
  assinedModel: Types.ObjectId;

  @Prop({ type: [AnnotationSchema], default: [] })
  annotations: Annotation[];
}

export const AnnotationGroupSchema =
  SchemaFactory.createForClass(AnnotationGroup);
