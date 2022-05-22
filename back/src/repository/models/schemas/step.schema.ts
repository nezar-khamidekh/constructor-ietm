import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Action, ActionSchema } from './action.schema';

export type StepDocument = Step & Document;

@Schema({ _id: false, versionKey: false, timestamps: false })
export class Step {
  @Prop()
  index: number;

  @Prop()
  description: string;

  @Prop({ type: [ActionSchema], default: [] })
  actions: Action[];
}

export const StepSchema = SchemaFactory.createForClass(Step);
