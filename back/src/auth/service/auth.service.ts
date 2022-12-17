import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { from, map, Observable, switchMap } from 'rxjs';
import { RefreshTokenDto } from '../models/dto/refresh-token.dto';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../models/schema/refresh-token.schema';
import { User, UserDocument } from 'src/user/models/schemas/user.schema';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  makeRefreshToken(userId: number): Observable<RefreshTokenDocument> {
    const refreshTokenData = new this.refreshTokenModel(
      this.generateRefreshTokenDto(userId),
    );
    return from(refreshTokenData.save());
  }

  deleteRefreshToken(token: string, userId: number): Observable<boolean> {
    return from(
      this.refreshTokenModel.deleteOne({
        $and: [{ token: token }, { userId: userId }],
      }),
    ).pipe(
      map((result: any) => {
        if (result.deletedCount) return true;
        else return false;
      }),
    );
  }

  getUserByToken(refresh: string): Observable<UserDocument> {
    return from(this.refreshTokenModel.findOne({ token: refresh })).pipe(
      switchMap((rToken) => {
        if (!rToken) {
          throw new HttpException(
            'Refresh token не найден. Пожалуйста, обновите страницу или авторизуйтесь снова',
            HttpStatus.UNAUTHORIZED,
          );
        }
        return from(this.userModel.findById(rToken.userId)).pipe(
          map((user) => {
            if (user) return user;
            else
              throw new HttpException(
                'Пользователь не найден',
                HttpStatus.NOT_FOUND,
              );
          }),
        );
      }),
    );
  }

  private generateRefreshTokenDto(userId?: number): RefreshTokenDto {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    const refreshTokenDto: RefreshTokenDto = {
      token: uuidv4(),
      expireDate: date,
    };
    if (userId) {
      refreshTokenDto.userId = userId;
    }
    return refreshTokenDto;
  }

  generateJwt(data: any, expireTime: string): Observable<string> {
    return from(this.jwtService.signAsync({ data }, { expiresIn: expireTime }));
  }

  hashPassword(password: string): Observable<string> {
    return from<string>(bcrypt.hash(password, 13));
  }

  comparePassword(password: string, storedPassHash: string): Observable<any> {
    return from(bcrypt.compare(password, storedPassHash));
  }
}
