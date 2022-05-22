import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Position, PositionSchema } from './position.schema';

export type SceneSettingsDocument = SceneSettings & Document;

@Schema({ _id: false, versionKey: false, timestamps: false })
export class SceneSettings {
  @Prop()
  grid: boolean;

  @Prop()
  background: string;

  @Prop({ type: PositionSchema, default: null })
  cameraPosition: Position;
}

export const SceneSettingsSchema = SchemaFactory.createForClass(SceneSettings);
