import { Types } from 'mongoose';

export interface CatI {
  _id?: Types.ObjectId;
  name: string;
  age: number;
  breed: string;
}
