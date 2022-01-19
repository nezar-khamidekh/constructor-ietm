import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable } from 'rxjs';
import { UserEntity } from 'src/user/models/entities/user.entity';
import { UserI } from 'src/user/models/interfaces/user.inteface';
import { DeleteResult, Repository } from 'typeorm';
import { RefreshTokenDto } from '../models/dto/refresh-token.dto';
import { RefreshTokenEntity } from '../models/entities/refresh-token.entity';
import { RefreshTokenI } from '../models/interfaces/refresh-token.interface';
import { v4 as uuidv4 } from 'uuid';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshTokenEntity)
    private refreshRepository: Repository<RefreshTokenI>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserI>,
  ) {}

  makeRefreshToken(userId: number): Observable<RefreshTokenI> {
    return from(
      this.refreshRepository.save(
        this.refreshRepository.create(this.generateRefreshTokenDto(userId)),
      ),
    );
  }

  deleteRefreshToken(token: string, user: number): Observable<boolean> {
    return from(this.refreshRepository.delete({ token, user })).pipe(
      map((result: DeleteResult) => {
        if (result.affected !== null) return true;
        else return false;
      }),
    );
  }

  getUserByToken(refresh: string): Observable<UserI> {
    return from(
      this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.refresh_tokens', 'refresh')
        .where('refresh.token = :token', { token: refresh })
        .getOne(),
    ).pipe(
      map((user: UserI) => {
        if (user) return user;
        else
          throw new HttpException(
            'Пользователь не найден',
            HttpStatus.NOT_FOUND,
          );
      }),
    );
  }

  generateRefreshTokenDto(userId?: number): RefreshTokenDto {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    const refreshTokenDto: RefreshTokenDto = {
      token: uuidv4(),
      expireDate: date,
    };
    refreshTokenDto.user = userId;
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
