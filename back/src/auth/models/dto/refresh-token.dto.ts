export class RefreshTokenDto {
  token: string;
  expireDate: Date;
  userId?: number;
}
