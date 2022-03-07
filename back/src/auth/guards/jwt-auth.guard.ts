import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserI } from 'src/user/models/interfaces/user.inteface';
import { UserDocument } from 'src/user/models/schemas/user.schema';
import { UserService } from 'src/user/service/user.service';
import { SessionI } from '../models/interfaces/session.interface';
import { AuthService } from '../service/auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const access_token = request.cookies['access_token'];
    const refresh_token = request.cookies['refresh_token'];
    if (access_token) return super.canActivate(context);
    else if (refresh_token)
      return this.authService.getUserByToken(refresh_token).pipe(
        switchMap((user: UserDocument) => {
          return forkJoin([
            this.authService.deleteRefreshToken(refresh_token, user._id),
            this.userService.generateSession({
              _id: user._id,
              login: user.login,
            }),
          ]).pipe(
            switchMap(([deleted, session]: [boolean, SessionI]) => {
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
              response.user = user;
              request.cookies['access_token'] = session.access_token;
              return of(this.activate(context)).pipe(
                map((result: any) => {
                  return result;
                }),
              );
            }),
          );
        }),
      );
    else return super.canActivate(context);
  }

  activate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
