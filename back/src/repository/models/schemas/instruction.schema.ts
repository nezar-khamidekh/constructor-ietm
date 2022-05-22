import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Step, StepSchema } from './step.schema';

export type InstructionDocument = Instruction & Document;

@Schema({ _id: false, versionKey: false, timestamps: false })
export class Instruction {
  @Prop()
  index: number;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [StepSchema], default: [] })
  steps: Step[];
}

export const InstructionSchema = SchemaFactory.createForClass(Instruction);
