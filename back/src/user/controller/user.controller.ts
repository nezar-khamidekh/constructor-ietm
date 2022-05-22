import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { map, Observable, switchMap } from 'rxjs';
import { Response } from 'express';
import { SessionI } from 'src/auth/models/interfaces/session.interface';
import { CreateUserDto } from '../models/dto/CreateUser.dto';
import { LoginUserDto } from '../models/dto/LoginUser.dto';
import { UserService } from '../service/user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserDocument } from '../models/schemas/user.schema';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto, @Res() response: Response) {
    return this.userService.create(createUserDto).pipe(
      switchMap(() => {
        return this.login(
          {
            ...LoginUserDto,
            login: createUserDto.login,
            password: createUserDto.password,
          },
          response,
        );
      }),
    );
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto, @Res() response: Response) {
    return this.userService.login(loginUserDto).pipe(
      map((session: SessionI) => {
        response.cookie('access_token', session.access_token, {
          expires: new Date(Date.now() + 1000 * 60 * 5),
          httpOnly: true,
          secure: false,
        });
        response.cookie('refresh_token', session.refresh_token.token, {
          expires: session.refresh_token.expireDate,
          httpOnly: true,
          secure: false,
        });
        return response.status(HttpStatus.ACCEPTED).send(session.user);
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout(@Res() response) {
    response.clearCookie('refresh_token');
    response.clearCookie('access_token');
    return response.status(200).json('User Logged out');
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  updateUser(@Body() updateUserDto: UserDocument) {
    return this.userService.updateOne(updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getCurUser(@Req() req): Observable<UserDocument> {
    return this.userService.findOne({ userId: req.user._id });
  }

  @UseGuards(JwtAuthGuard)
  @Get('is_auth')
  check(@Req() request) {
    if (request.user !== null) return true;
  }

  @Get('all')
  getAllUsers() {
    return this.userService.findAll();
  }
}
