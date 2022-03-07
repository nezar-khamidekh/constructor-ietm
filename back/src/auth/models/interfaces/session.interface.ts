import { UserDocument } from 'src/user/models/schemas/user.schema';
import { RefreshTokenDocument } from '../schema/refresh-token.schema';
import { RefreshTokenI } from './refresh-token.interface';

export interface SessionI {
  access_token: string;
  refresh_token: RefreshTokenDocument;
  user?: UserDocument;
}
