export class RefreshTokenDto {
  token: string;
  expireDate: Date;
  user?: number;
}
