import { RefreshTokenI } from './refresh-token.interface';

export interface SessionI {
  access_token: string;
  refresh_token: RefreshTokenI;
}
