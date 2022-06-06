import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { from, map, Observable, switchMap } from 'rxjs';
import { SessionI } from 'src/auth/models/interfaces/session.interface';
import { AuthService } from 'src/auth/service/auth.service';
import { CreateUserDto } from '../models/dto/CreateUser.dto';
import { LoginUserDto } from '../models/dto/LoginUser.dto';
import { User, UserDocument } from '../models/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { RefreshTokenDocument } from 'src/auth/models/schema/refresh-token.schema';
import { UserEntryDto } from '../models/dto/userEntry.dto';

@Injectable()
export class UserService {
  constructor(
    private authService: AuthService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  create(createUserDto: CreateUserDto): Observable<boolean> {
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
                          if (savedUser) return true;
                          else
                            throw new HttpException(
                              'Ошибка при создании пользователя',
                              HttpStatus.NOT_ACCEPTABLE,
                            );
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
    return this.findUserWithPassword(
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
                login: user.login,
                avatar: user.avatar,
              },
            };
          }),
        );
      }),
    );
  }

  private findUserWithPassword(str: string): Observable<UserDocument> {
    return from(
      this.userModel.findOne({ $or: [{ login: str }, { email: str }] }, [
        'login',
        'lastName',
        'firstName',
        'email',
        'password',
        'avatar',
      ]),
    ).pipe(
      map((user: UserDocument) => {
        return user;
      }),
    );
  }

  findOne(userEntryDto: UserEntryDto): Observable<UserDocument> {
    const filter = [];
    if (userEntryDto.email) filter.push({ email: userEntryDto.email });
    if (userEntryDto.login) filter.push({ login: userEntryDto.login });
    if (userEntryDto.userId)
      filter.push({ _id: new Types.ObjectId(userEntryDto.userId) });
    return from(
      this.userModel.findOne(
        {
          $or: filter,
        },
        ['login', 'lastName', 'firstName', 'email', 'avatar'],
      ),
    ).pipe(
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
            map((result: any) => {
              return result.modifiedCount ? true : false;
            }),
          );
        }),
      );
    else
      return from(
        this.userModel.updateOne({ _id: updateData._id }, updateData),
      ).pipe(
        map((result: any) => {
          return result.modifiedCount ? true : false;
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
