import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({ versionKey: false, timestamps: true })
export class Favorite {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Repository' })
  repository: Types.ObjectId;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
