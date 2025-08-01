import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Req, Res, Next } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async use(@Req() req: any, @Res() res: any, @Next() next: any) {
    const authHeaders = req.headers.authorization;
    const _id = await this.authService.handleAuthMiddleware(
      authHeaders,
      'user',
    );
    const user = await this.userService.findById(_id);
    if (!user) {
      throw new HttpException(
        {
          key: 'INVALID_CREDENTIAL',
          message: 'Invalid credentials',
          data: {}, 
          statusCode: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    req['user_data'] = user;
    return next();
  }
}
