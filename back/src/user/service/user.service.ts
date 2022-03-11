import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { from, map, Observable, switchMap } from 'rxjs';
import { SessionI } from 'src/auth/models/interfaces/session.interface';
import { AuthService } from 'src/auth/service/auth.service';
import { CreateUserDto } from '../models/dto/CreateUser.dto';
import { LoginUserDto } from '../models/dto/LoginUser.dto';
import { UserI } from '../models/interfaces/user.inteface';
import { User, UserDocument } from '../models/schemas/user.schema';
import { Model } from 'mongoose';
import { RefreshTokenDocument } from 'src/auth/models/schema/refresh-token.schema';

@Injectable()
export class UserService {
  constructor(
    private authService: AuthService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
                      const newUser = new this.userModel({
                        ...createUserDto,
                        password: passHash,
                      });
                      return from(newUser.save()).pipe(
                        map((savedUser: UserDocument) => {
                          const { _id, password, ...user } = savedUser;
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
      switchMap((user: UserDocument) => {
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

  generateSession(user: any): Observable<SessionI> {
    return this.authService.generateJwt(user, '300s').pipe(
      switchMap((jwt: string) => {
        return this.authService.makeRefreshToken(user._id).pipe(
          map((refresh: RefreshTokenDocument) => {
            return <SessionI>{
              access_token: jwt,
              refresh_token: refresh,
              user: {
                _id: user._id,
                lastName: user.lastName,
                firstName: user.firstName,
                email: user.email,
                username: user.username,
                login: user.login,
                avatar: user.avatar,
              },
            };
          }),
        );
      }),
    );
  }

  checkLogin(login: string): Observable<UserDocument> {
    return from(this.userModel.findOne({ login })).pipe(
      map((user) => {
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

  private findUserByEmailOrLogin(str: string): Observable<UserDocument> {
    return from(
      this.userModel.findOne({ $or: [{ login: str }, { email: str }] }, [
        'login',
        'lastName',
        'firstName',
        'email',
        'username',
        'password',
        'avatar',
      ]),
    ).pipe(
      map((user: UserDocument) => {
        return user;
      }),
    );
  }

  findOne(id: string): Observable<UserDocument> {
    return from(
      this.userModel.findById(id, [
        'login',
        'lastName',
        'firstName',
        'email',
        'username',
        'avatar',
      ]),
    );
  }

  findAll() {
    return from(this.userModel.find());
  }

  updateOne(updateData: UserDocument): Observable<boolean> {
    if (updateData.password)
      return this.authService.hashPassword(updateData.password).pipe(
        switchMap((hashedPass) => {
          updateData.password = hashedPass;
          return from(
            this.userModel.updateOne({ _id: updateData._id }, updateData),
          ).pipe(
            map((result) => {
              return true;
            }),
          );
        }),
      );
    else
      return from(
        this.userModel.updateOne({ _id: updateData._id }, updateData),
      ).pipe(
        map((result) => {
          return true;
        }),
      );
  }

  private validatePassword(
    password: string,
    storedHash: string,
  ): Observable<boolean> {
    return this.authService.comparePassword(password, storedHash);
  }

  private mailExists(email: string): Observable<boolean> {
    return from(this.userModel.findOne({ email })).pipe(
      map((user) => {
        return user ? true : false;
      }),
    );
  }

  private loginExists(login: string): Observable<boolean> {
    return from(this.userModel.findOne({ login })).pipe(
      map((user) => {
        return user ? true : false;
      }),
    );
  }
}
