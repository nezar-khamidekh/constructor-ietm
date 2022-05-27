import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActionDocument = Action & Document;

@Schema({ _id: false, versionKey: false, timestamps: false })
export class Action {
  @Prop()
  index: number;

  @Prop()
  type: ActionType;

  @Prop({ type: Object, default: null })
  value: any;
}

export const ActionSchema = SchemaFactory.createForClass(Action);

export enum ActionType {
  Camera,
  Rotation,
  Explode,
  Section,
  Hide,
  Annotation,
  RestoreView,
  FitToView,
}
