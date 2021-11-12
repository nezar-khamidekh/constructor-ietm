import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable, switchMap } from 'rxjs';
import { RefreshTokenI } from 'src/auth/models/interfaces/refresh-token.interface';
import { SessionI } from 'src/auth/models/interfaces/session.interface';
import { AuthService } from 'src/auth/service/auth.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../models/dto/CreateUser.dto';
import { LoginUserDto } from '../models/dto/LoginUser.dto';
import { UserEntity } from '../models/entities/user.entity';
import { UserI } from '../models/interfaces/user.inteface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserI>,
    private authService: AuthService,
  ) {}

  create(createUserDto: CreateUserDto): Observable<UserI> {
    return this.mailExists(createUserDto.email.toLowerCase()).pipe(
      switchMap((mailExists: boolean) => {
        if (!mailExists) {
          return this.loginExists(createUserDto.login.toLowerCase()).pipe(
            switchMap((loginExists: boolean) => {
              if (!loginExists) {
                return this.authService
                  .hashPassword(createUserDto.password)
                  .pipe(
                    switchMap((passHash: string) => {
                      return from(
                        this.userRepository.save(
                          this.userRepository.create({
                            ...createUserDto,
                            password: passHash,
                          }),
                        ),
                      ).pipe(
                        map((savedUser: UserI) => {
                          const {
                            id,
                            password,
                            creationTime,
                            updateTime,
                            ...user
                          } = savedUser;
                          return user;
                        }),
                      );
                    }),
                  );
              } else {
                throw new HttpException(
                  'Этот логин занят',
                  HttpStatus.NOT_ACCEPTABLE,
                );
              }
            }),
          );
        } else {
          throw new HttpException(
            'Этот адрес почты занят',
            HttpStatus.NOT_ACCEPTABLE,
          );
        }
      }),
    );
  }

  login(loginUserDto: LoginUserDto): Observable<SessionI> {
    return this.findUserByEmailOrLogin(
      loginUserDto.login || loginUserDto.email,
    ).pipe(
      switchMap((user: UserI) => {
        if (user) {
          return this.validatePassword(
            loginUserDto.password,
            user.password,
          ).pipe(
            switchMap((match: boolean) => {
              if (match) {
                return this.generateSession(user);
              } else {
                throw new HttpException(
                  'Некорректный пароль',
                  HttpStatus.NOT_ACCEPTABLE,
                );
              }
            }),
          );
        } else {
          throw new HttpException(
            'Такого пользователя не существует',
            HttpStatus.NOT_FOUND,
          );
        }
      }),
    );
  }

  generateSession(user: UserI): Observable<SessionI> {
    return this.findOne(user.id).pipe(
      switchMap((user: UserI) => {
        if (user)
          return this.authService.generateJwt(user, '300s').pipe(
            switchMap((jwt: string) => {
              return this.authService.makeRefreshToken(user.id).pipe(
                map((refresh: RefreshTokenI) => {
                  return <SessionI>{
                    access_token: jwt,
                    refresh_token: refresh,
                  };
                }),
              );
            }),
          );
        else
          throw new HttpException(
            'Такого пользователя не существует',
            HttpStatus.NOT_FOUND,
          );
      }),
    );
  }

  checkLogin(login: string): Observable<UserI> {
    return from(this.userRepository.findOne({ login })).pipe(
      map((user: UserI) => {
        if (user) {
          return user;
        } else
          throw new HttpException(
            'Пользователь не найден',
            HttpStatus.NOT_FOUND,
          );
      }),
    );
  }

  private findUserByEmailOrLogin(str: string): Observable<UserI> {
    return from(
      this.userRepository
        .createQueryBuilder('user')
        .select(['user.login', 'user.email', 'user.password', 'user.id'])
        .where('user.email = :email', { email: str.toLowerCase() })
        .orWhere('user.login = :login', { login: str.toLowerCase() })
        .getOne(),
    ).pipe(
      map((user: UserI) => {
        return user;
      }),
    );
  }

  findOne(id: number): Observable<UserI> {
    return from(this.userRepository.findOne({ id }));
  }

  private validatePassword(
    password: string,
    storedHash: string,
  ): Observable<boolean> {
    return this.authService.comparePassword(password, storedHash);
  }

  private mailExists(email: string): Observable<boolean> {
    return from(this.userRepository.findOne({ email })).pipe(
      map((user: UserI) => {
        return user ? true : false;
      }),
    );
  }

  private loginExists(login: string): Observable<boolean> {
    return from(this.userRepository.findOne({ login })).pipe(
      map((user: UserI) => {
        return user ? true : false;
      }),
    );
  }
}
