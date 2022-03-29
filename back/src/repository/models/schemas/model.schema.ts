import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ModelDocument = Model & Document;

@Schema({ _id: false })
export class Model {
  @Prop({ length: 200 })
  name: string;

  @Prop()
  filename: string;

  @Prop()
  path: string;
}

export const ModelSchema = SchemaFactory.createForClass(Model);
